import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, studentName, studentEmail, studentPhone, studentMajor, yearOfStudy } = body

    if (!event_id || !studentName || !studentEmail || !studentMajor || !yearOfStudy) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id,
        student_name: studentName,
        student_email: studentEmail,
        student_phone: studentPhone,
        student_major: studentMajor,
        year_of_study: yearOfStudy
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'You have already registered for this event' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Registration successful', data },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}