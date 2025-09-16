import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'
import { verifyJWT } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check for token in cookie first
    const cookieToken = request.cookies.get('admin-token')?.value

    // Also check Authorization header as fallback
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    const token = cookieToken || headerToken

    if (!token || !verifyJWT(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isSupabaseConfigured()) {
      // Return mock data if Supabase not configured
      return NextResponse.json([
        {
          id: 1,
          student_name: 'Sara Johnson',
          student_email: 'sara@example.com',
          major: 'Computer Science',
          year: 'Year 3',
          registration_date: new Date().toISOString(),
          status: 'confirmed',
          event: {
            title: 'Career Development Workshop',
            event_date: new Date().toISOString()
          }
        },
        {
          id: 2,
          student_name: 'Ahmed Hassan',
          student_email: 'ahmed@example.com',
          major: 'Business',
          year: 'Year 2',
          registration_date: new Date().toISOString(),
          status: 'confirmed',
          event: {
            title: 'Internship Fair 2024',
            event_date: new Date().toISOString()
          }
        }
      ])
    }

    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:events(title, event_date)
      `)
      .order('registration_date', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 })
  }
}