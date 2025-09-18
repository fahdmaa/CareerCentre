import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'
import { verifyJWT } from '../../../../lib/auth'

// Authentication middleware function
async function authenticateAdmin(request: NextRequest) {
  // Check for token in cookie first
  const cookieToken = request.cookies.get('admin-token')?.value

  // Also check Authorization header as fallback
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  const token = cookieToken || headerToken

  if (!token) {
    return null
  }

  const payload = verifyJWT(token)
  return payload
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('event_id')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit
    const format = searchParams.get('format') // 'csv' or 'json'

    if (!isSupabaseConfigured()) {
      // Return enhanced mock data if Supabase not configured
      const mockData = [
        {
          id: 1,
          event_id: 1,
          student_name: 'Sara Johnson',
          student_email: 'sara.johnson@emsi.ma',
          student_phone: '+212 6 12 34 56 78',
          major: 'Computer Science',
          year: 'Year 3',
          registration_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed',
          on_waitlist: false,
          waitlist_position: null,
          consent_updates: true,
          events: {
            id: 1,
            title: 'Career Development Workshop',
            event_date: '2024-12-15',
            event_time: '14:00',
            location: 'EMSI Marrakech - Amphitheater A',
            capacity: 50
          }
        },
        {
          id: 2,
          event_id: 2,
          student_name: 'Ahmed Hassan',
          student_email: 'ahmed.hassan@emsi.ma',
          student_phone: '+212 6 87 65 43 21',
          major: 'Business Administration',
          year: 'Year 2',
          registration_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed',
          on_waitlist: true,
          waitlist_position: 3,
          consent_updates: false,
          events: {
            id: 2,
            title: 'Internship Fair 2024',
            event_date: '2024-12-20',
            event_time: '10:00',
            location: 'EMSI Marrakech - Main Hall',
            capacity: 100
          }
        },
        {
          id: 3,
          event_id: 1,
          student_name: 'Fatima Zahra El Mansouri',
          student_email: 'fatima.elmansouri@emsi.ma',
          student_phone: null,
          major: 'Software Engineering',
          year: 'Year 4',
          registration_date: new Date().toISOString(),
          status: 'confirmed',
          on_waitlist: false,
          waitlist_position: null,
          consent_updates: true,
          events: {
            id: 1,
            title: 'Career Development Workshop',
            event_date: '2024-12-15',
            event_time: '14:00',
            location: 'EMSI Marrakech - Amphitheater A',
            capacity: 50
          }
        }
      ]

      // Apply search filter to mock data
      let filteredData = mockData
      if (search) {
        const query = search.toLowerCase()
        filteredData = mockData.filter(reg =>
          reg.student_name.toLowerCase().includes(query) ||
          reg.student_email.toLowerCase().includes(query) ||
          reg.major.toLowerCase().includes(query)
        )
      }

      // Apply event filter
      if (eventId) {
        filteredData = filteredData.filter(reg => reg.event_id === parseInt(eventId))
      }

      // Apply status filter
      if (status) {
        filteredData = filteredData.filter(reg => reg.status === status)
      }

      // Handle CSV export
      if (format === 'csv') {
        const csvHeaders = [
          'ID',
          'Student Name',
          'Student Email',
          'Student Phone',
          'Major',
          'Year',
          'Event Title',
          'Event Date',
          'Registration Date',
          'Status',
          'On Waitlist',
          'Waitlist Position'
        ].join(',')

        const csvRows = filteredData.map(reg => [
          reg.id,
          `"${reg.student_name}"`,
          reg.student_email,
          reg.student_phone || '',
          `"${reg.major}"`,
          reg.year,
          `"${reg.events.title}"`,
          reg.events.event_date,
          reg.registration_date,
          reg.status,
          reg.on_waitlist,
          reg.waitlist_position || ''
        ].join(','))

        const csvContent = [csvHeaders, ...csvRows].join('\n')

        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=event_registrations.csv'
          }
        })
      }

      // Apply pagination to mock data
      const paginatedData = filteredData.slice(offset, offset + limit)

      const analytics = {
        totalRegistrations: filteredData.length,
        confirmedRegistrations: filteredData.filter(r => !r.on_waitlist).length,
        waitlistRegistrations: filteredData.filter(r => r.on_waitlist).length,
        recentRegistrations: filteredData.filter(r => {
          const regDate = new Date(r.registration_date)
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return regDate >= sevenDaysAgo
        }).length
      }

      return NextResponse.json({
        registrations: paginatedData,
        pagination: {
          page,
          limit,
          total: filteredData.length,
          totalPages: Math.ceil(filteredData.length / limit)
        },
        analytics
      })
    }

    // Build query for real Supabase data
    let query = supabase
      .from('event_registrations')
      .select(`
        *,
        events!inner (
          id,
          title,
          event_date,
          event_time,
          location,
          capacity
        )
      `)
      .order('registration_date', { ascending: false })

    // Apply filters
    if (eventId) {
      query = query.eq('event_id', parseInt(eventId))
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`student_name.ilike.%${search}%,student_email.ilike.%${search}%`)
    }

    // Apply pagination for regular requests
    if (format !== 'csv') {
      query = query.range(offset, offset + limit - 1)
    }

    const { data: registrations, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Handle CSV export
    if (format === 'csv') {
      const csvHeaders = [
        'ID',
        'Student Name',
        'Student Email',
        'Student Phone',
        'Major',
        'Year',
        'Event Title',
        'Event Date',
        'Registration Date',
        'Status',
        'On Waitlist',
        'Waitlist Position'
      ].join(',')

      const csvRows = registrations?.map(reg => [
        reg.id,
        `"${reg.student_name || ''}"`,
        reg.student_email || '',
        reg.student_phone || '',
        `"${reg.major || ''}"`,
        reg.year || '',
        `"${reg.events?.title || ''}"`,
        reg.events?.event_date || '',
        reg.registration_date,
        reg.status,
        reg.on_waitlist || false,
        reg.waitlist_position || ''
      ].join(',')) || []

      const csvContent = [csvHeaders, ...csvRows].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=event_registrations.csv'
        }
      })
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })

    // Group registrations by status for analytics
    const analytics = {
      totalRegistrations: totalCount || 0,
      confirmedRegistrations: registrations?.filter(r => !r.on_waitlist).length || 0,
      waitlistRegistrations: registrations?.filter(r => r.on_waitlist).length || 0,
      recentRegistrations: registrations?.filter(r => {
        const regDate = new Date(r.registration_date)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return regDate >= sevenDaysAgo
      }).length || 0
    }

    return NextResponse.json({
      registrations: registrations || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      },
      analytics
    })

  } catch (error: any) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { registrationId, status, notes } = body

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      )
    }

    if (!isSupabaseConfigured()) {
      // Return mock success for development
      return NextResponse.json({
        success: true,
        message: 'Registration updated successfully (mock)',
        registration: {
          id: registrationId,
          status,
          notes,
          updated_at: new Date().toISOString()
        }
      })
    }

    // Update registration
    const { data, error } = await supabase
      .from('event_registrations')
      .update({
        status,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', registrationId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      registration: data
    })

  } catch (error: any) {
    console.error('Error updating registration:', error)
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get('id')

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      )
    }

    if (!isSupabaseConfigured()) {
      // Return mock success for development
      return NextResponse.json({
        success: true,
        message: 'Registration deleted successfully (mock)'
      })
    }

    // Get registration details before deleting
    const { data: registration } = await supabase
      .from('event_registrations')
      .select('event_id, on_waitlist')
      .eq('id', registrationId)
      .single()

    // Delete registration
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('id', registrationId)

    if (error) {
      throw error
    }

    // If it was a confirmed registration, update event spots_taken
    if (registration && !registration.on_waitlist) {
      // Get current spots_taken value
      const { data: event } = await supabase
        .from('events')
        .select('spots_taken')
        .eq('id', registration.event_id)
        .single()

      // Update with decremented value
      if (event) {
        await supabase
          .from('events')
          .update({
            spots_taken: Math.max(0, (event.spots_taken || 1) - 1)
          })
          .eq('id', registration.event_id)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting registration:', error)
    return NextResponse.json(
      { error: 'Failed to delete registration' },
      { status: 500 }
    )
  }
}