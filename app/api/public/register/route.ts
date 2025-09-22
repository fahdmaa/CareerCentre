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

    // Check if already registered
    const { data: existingReg } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', event_id)
      .eq('student_email', studentEmail)
      .maybeSingle()

    if (existingReg) {
      return NextResponse.json(
        { error: 'You have already registered for this event' },
        { status: 400 }
      )
    }

    // Get event details to check capacity
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, capacity, spots_taken')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Determine if should be on waitlist
    const spotsLeft = event.capacity - (event.spots_taken || 0)
    const onWaitlist = spotsLeft <= 0

    let waitlistPosition = null
    if (onWaitlist) {
      // Calculate waitlist position
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id)
        .eq('on_waitlist', true)

      waitlistPosition = (count || 0) + 1
    }

    // Insert registration
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id,
        student_name: studentName,
        student_email: studentEmail,
        student_phone: studentPhone || null,
        major: studentMajor,
        year: yearOfStudy,
        on_waitlist: onWaitlist,
        waitlist_position: waitlistPosition,
        status: 'confirmed'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update spots taken if not on waitlist
    if (!onWaitlist) {
      const { error: updateError } = await supabase
        .from('events')
        .update({ spots_taken: (event.spots_taken || 0) + 1 })
        .eq('id', event_id)

      if (updateError) {
        console.error('Failed to update spots_taken:', updateError)
      }
    }

    return NextResponse.json(
      {
        message: onWaitlist
          ? `You're on the waitlist (position #${waitlistPosition})`
          : 'Registration successful',
        data,
        on_waitlist: onWaitlist,
        waitlist_position: waitlistPosition
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}