import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check auth
    const cookieStore = cookies()
    const token = cookieStore.get('admin-token')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      verify(token.value, process.env.JWT_SECRET!)
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!isSupabaseConfigured()) {
      // Return mock data if Supabase not configured
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)

      return NextResponse.json([
        {
          id: 1,
          application_id: 1,
          interview_date: tomorrow.toISOString().split('T')[0],
          interview_time: '10:00',
          interview_type: 'in-person',
          location: 'Career Center Office - Room 201',
          interviewer_name: 'Dr. Sarah Williams',
          status: 'scheduled',
          application: {
            student_name: 'Emily Chen'
          }
        },
        {
          id: 2,
          application_id: 2,
          interview_date: tomorrow.toISOString().split('T')[0],
          interview_time: '14:30',
          interview_type: 'online',
          meeting_link: 'https://meet.google.com/abc-defg-hij',
          interviewer_name: 'Prof. James Anderson',
          status: 'scheduled',
          application: {
            student_name: 'Mohamed Ali'
          }
        },
        {
          id: 3,
          application_id: 3,
          interview_date: nextWeek.toISOString().split('T')[0],
          interview_time: '11:00',
          interview_type: 'in-person',
          location: 'Career Center Office - Room 203',
          interviewer_name: 'Ms. Jennifer Brown',
          status: 'scheduled',
          application: {
            student_name: 'Lisa Martinez'
          }
        }
      ])
    }

    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        application:cohort_applications(student_name)
      `)
      .order('interview_date', { ascending: true })
      .order('interview_time', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 })
  }
}