import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id)
    const body = await request.json()
    const {
      student_name,
      student_email,
      student_phone,
      student_year,
      student_program,
      consent_updates
    } = body

    // Validate required fields
    if (!student_name || !student_email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if already registered
    const { data: existingReg } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('student_email', student_email)
      .single()

    if (existingReg) {
      return NextResponse.json(
        { error: 'You have already registered for this event' },
        { status: 400 }
      )
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('capacity, spots_taken')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Determine if should be on waitlist
    const spotsLeft = event.capacity - event.spots_taken
    const onWaitlist = spotsLeft <= 0

    let waitlistPosition = null
    if (onWaitlist) {
      // Calculate waitlist position
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('on_waitlist', true)

      waitlistPosition = (count || 0) + 1
    }

    // Start a transaction-like operation
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        student_name,
        student_email,
        student_phone: student_phone || null,
        student_year: student_year || null,
        student_program: student_program || null,
        on_waitlist: onWaitlist,
        waitlist_position: waitlistPosition,
        consent_updates: consent_updates || false,
        status: 'confirmed'
      })
      .select()
      .single()

    if (regError) {
      throw regError
    }

    // Update spots taken if not on waitlist
    if (!onWaitlist) {
      await supabase
        .from('events')
        .update({ spots_taken: event.spots_taken + 1 })
        .eq('id', eventId)
    }

    return NextResponse.json({
      success: true,
      registration,
      onWaitlist,
      waitlistPosition,
      message: onWaitlist
        ? `You're on the waitlist (position #${waitlistPosition})`
        : 'Registration confirmed successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('RSVP error:', error)
    return NextResponse.json(
      { error: 'Failed to process RSVP' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id)

    // Get all registrations for the event
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('registration_date', { ascending: true })

    if (error) {
      throw error
    }

    const confirmed = registrations?.filter(r => !r.on_waitlist) || []
    const waitlist = registrations?.filter(r => r.on_waitlist) || []

    return NextResponse.json({
      confirmed,
      waitlist,
      totalRegistrations: registrations?.length || 0
    })
  } catch (error: any) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}