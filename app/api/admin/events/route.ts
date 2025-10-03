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
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const format = searchParams.get('format')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    if (!isSupabaseConfigured()) {
      // Return mock events data for development
      const mockEvents = [
        {
          id: 1,
          title: 'Career Development Workshop',
          description: 'Learn essential career skills for success in the modern workplace',
          event_date: '2024-12-15',
          event_time: '14:00',
          location: 'EMSI Marrakech - Amphitheater A',
          capacity: 50,
          spots_taken: 23,
          event_type: 'workshop',
          event_format: 'on-campus',
          status: 'upcoming',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          featured: false,
          city: 'Marrakech',
          campus: 'EMSI Marrakech',
          host_org: 'EMSI Career Center',
          image_url: null,
          agenda: 'Introduction, Career planning, Networking, Q&A',
          speakers: 'Career Development Team',
          what_to_bring: 'Notebook, pen, and questions'
        },
        {
          id: 2,
          title: 'Internship Fair 2024',
          description: 'Meet with top companies and discover internship opportunities',
          event_date: '2024-12-20',
          event_time: '10:00',
          location: 'EMSI Marrakech - Main Hall',
          capacity: 100,
          spots_taken: 67,
          event_type: 'fair',
          event_format: 'on-campus',
          status: 'upcoming',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          featured: true,
          city: 'Marrakech',
          campus: 'EMSI Marrakech',
          host_org: 'EMSI Career Center'
        },
        {
          id: 3,
          title: 'Tech Talk: AI in Business',
          description: 'Exploring the impact of artificial intelligence on modern business',
          event_date: '2024-12-22',
          event_time: '16:00',
          location: 'Online',
          capacity: 200,
          spots_taken: 145,
          event_type: 'seminar',
          event_format: 'online',
          status: 'upcoming',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          featured: false,
          meeting_link: 'https://zoom.us/j/123456789'
        }
      ]

      // Apply filters to mock data
      let filteredEvents = mockEvents
      if (search) {
        const query = search.toLowerCase()
        filteredEvents = mockEvents.filter(event =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
        )
      }

      if (status) {
        filteredEvents = filteredEvents.filter(event => event.status === status)
      }

      if (type) {
        filteredEvents = filteredEvents.filter(event => event.event_type === type)
      }

      if (format) {
        filteredEvents = filteredEvents.filter(event => event.event_format === format)
      }

      // Apply pagination
      const paginatedEvents = filteredEvents.slice(offset, offset + limit)

      return NextResponse.json({
        events: paginatedEvents,
        pagination: {
          page,
          limit,
          total: filteredEvents.length,
          totalPages: Math.ceil(filteredEvents.length / limit)
        },
        analytics: {
          totalEvents: filteredEvents.length,
          upcomingEvents: filteredEvents.filter(e => e.status === 'upcoming').length,
          featuredEvents: filteredEvents.filter(e => e.featured).length,
          totalCapacity: filteredEvents.reduce((sum, e) => sum + e.capacity, 0),
          totalRegistrations: filteredEvents.reduce((sum, e) => sum + e.spots_taken, 0)
        }
      })
    }

    // Build query for real Supabase data
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('event_type', type)
    }

    if (format) {
      query = query.eq('event_format', format)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: events, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Calculate analytics
    const { data: allEvents } = await supabase
      .from('events')
      .select('capacity, spots_taken, status, featured')

    const analytics = {
      totalEvents: totalCount || 0,
      upcomingEvents: allEvents?.filter(e => e.status === 'upcoming').length || 0,
      featuredEvents: allEvents?.filter(e => e.featured).length || 0,
      totalCapacity: allEvents?.reduce((sum, e) => sum + (e.capacity || 0), 0) || 0,
      totalRegistrations: allEvents?.reduce((sum, e) => sum + (e.spots_taken || 0), 0) || 0
    }

    return NextResponse.json({
      events: events || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      },
      analytics
    })

  } catch (error: any) {
    console.error('Error fetching admin events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Log the received data for debugging
    console.log('=== EVENT CREATION REQUEST ===')
    console.log('Guest speakers received:', JSON.stringify(body.guest_speakers, null, 2))

    const {
      title,
      description,
      event_date,
      event_time,
      location,
      capacity,
      event_type,
      event_format,
      city,
      campus,
      tags,
      host_org,
      image_url,
      featured,
      guest_speakers,
      guest_speaker_name,
      guest_speaker_occupation,
      guest_speaker_bio,
      guest_speaker_photo,
      guest_speaker_linkedin,
      agenda,
      speakers,
      what_to_bring,
      meeting_link
    } = body

    // Validate required fields
    if (!title || !event_date || !event_time || !location || !capacity) {
      return NextResponse.json(
        { error: 'Missing required fields: title, event_date, event_time, location, capacity' },
        { status: 400 }
      )
    }

    if (!isSupabaseConfigured()) {
      // Return mock success for development
      return NextResponse.json({
        success: true,
        event: {
          id: Date.now(),
          title,
          description,
          event_date,
          event_time,
          location,
          capacity,
          spots_taken: 0,
          event_type: event_type || 'workshop',
          event_format: event_format || 'on-campus',
          status: 'upcoming',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          featured: featured || false,
          city,
          campus,
          tags,
          host_org,
          image_url,
          guest_speaker_name,
          guest_speaker_occupation,
          guest_speaker_bio,
          guest_speaker_photo,
          guest_speaker_linkedin,
          agenda,
          speakers,
          what_to_bring,
          meeting_link
        }
      }, { status: 201 })
    }

    // Prepare guest speakers for JSONB - ensure it's an array
    let guestSpeakersForDb = null
    if (guest_speakers && Array.isArray(guest_speakers) && guest_speakers.length > 0) {
      // Filter out empty speakers (where all fields are empty)
      const validSpeakers = guest_speakers.filter((speaker: any) =>
        speaker.name || speaker.occupation || speaker.bio || speaker.linkedin || speaker.photo
      )
      guestSpeakersForDb = validSpeakers.length > 0 ? validSpeakers : null
    }

    // Prepare event data for insertion
    const eventToInsert = {
      title,
      description,
      event_date,
      event_time,
      location,
      capacity,
      spots_taken: 0,
      event_type: event_type || 'workshop',
      event_format: event_format || 'on-campus',
      status: 'upcoming',
      featured: featured || false,
      city,
      campus,
      tags,
      host_org,
      image_url,
      guest_speakers: guestSpeakersForDb,
      guest_speaker_name,
      guest_speaker_occupation,
      guest_speaker_bio,
      guest_speaker_photo,
      guest_speaker_linkedin,
      agenda,
      speakers,
      what_to_bring,
      meeting_link
    }

    console.log('Data being inserted:', JSON.stringify({
      title,
      guest_speakers_received: guest_speakers,
      guest_speakers_processed: guestSpeakersForDb,
      guest_speakers_final: eventToInsert.guest_speakers
    }, null, 2))

    // Create event in Supabase
    const { data, error } = await supabase
      .from('events')
      .insert(eventToInsert)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      throw error
    }

    console.log('Event created successfully. Saved guest_speakers:', JSON.stringify(data.guest_speakers, null, 2))

    return NextResponse.json({
      success: true,
      event: data
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event', details: error.message },
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
    const { eventId, guest_speakers, capacity, ...updateData } = body

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    if (!isSupabaseConfigured()) {
      // Return mock success for development
      return NextResponse.json({
        success: true,
        event: {
          id: eventId,
          ...updateData,
          guest_speakers,
          capacity,
          updated_at: new Date().toISOString()
        }
      })
    }

    // Prepare guest speakers for JSONB - ensure it's an array
    let guestSpeakersForDb = null
    if (guest_speakers && Array.isArray(guest_speakers) && guest_speakers.length > 0) {
      // Filter out empty speakers (where all fields are empty)
      const validSpeakers = guest_speakers.filter((speaker: any) =>
        speaker.name || speaker.occupation || speaker.bio || speaker.linkedin || speaker.photo
      )
      guestSpeakersForDb = validSpeakers.length > 0 ? validSpeakers : null
    }

    // Update event in Supabase
    const { data, error } = await supabase
      .from('events')
      .update({
        ...updateData,
        capacity: capacity ? parseInt(capacity) : updateData.capacity,
        guest_speakers: guestSpeakersForDb,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      event: data
    })

  } catch (error: any) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event', details: error.message },
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
    const eventId = searchParams.get('id')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    if (!isSupabaseConfigured()) {
      // Return mock success for development
      return NextResponse.json({
        success: true,
        message: 'Event deleted successfully (mock)'
      })
    }

    // Delete event from Supabase
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event', details: error.message },
      { status: 500 }
    )
  }
}