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

    // Validate email format (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(student_email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Try to use the database function first
    try {
      const { data: result, error: rpcError } = await supabase
        .rpc('handle_event_rsvp', {
          p_event_id: eventId,
          p_student_name: student_name,
          p_student_email: student_email,
          p_student_phone: student_phone || null,
          p_student_year: student_year || null,
          p_student_program: student_program || null,
          p_consent_updates: consent_updates || false
        })

      if (!rpcError && result?.success) {
        return NextResponse.json(result, { status: 201 })
      }

      // If RPC function doesn't exist, fall back to manual implementation
      if (rpcError && rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
        console.log('Database function not found, using manual implementation')
      } else if (rpcError) {
        throw rpcError
      }
    } catch (rpcError) {
      console.log('RPC failed, falling back to manual implementation:', rpcError)
    }

    // Manual implementation fallback
    // Check if already registered
    const { data: existingReg } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('student_email', student_email)
      .maybeSingle()

    if (existingReg) {
      return NextResponse.json(
        { success: false, error: 'You have already registered for this event' },
        { status: 400 }
      )
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, capacity, spots_taken')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
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
        .eq('event_id', eventId)
        .eq('on_waitlist', true)

      waitlistPosition = (count || 0) + 1
    }

    // Insert registration
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        student_name,
        student_email,
        student_phone: student_phone || null,
        major: student_program || null, // Map to existing field
        year: student_year || null,     // Map to existing field
        on_waitlist: onWaitlist,
        waitlist_position: waitlistPosition,
        consent_updates: consent_updates || false,
        status: 'confirmed'
      })
      .select()
      .single()

    if (regError) {
      console.error('Registration insert error:', regError)
      throw regError
    }

    // Update spots taken if not on waitlist
    if (!onWaitlist) {
      const { error: updateError } = await supabase
        .from('events')
        .update({ spots_taken: (event.spots_taken || 0) + 1 })
        .eq('id', eventId)

      if (updateError) {
        console.error('Failed to update spots_taken:', updateError)
      }
    }

    return NextResponse.json({
      success: true,
      registration,
      on_waitlist: onWaitlist,
      waitlist_position: waitlistPosition,
      message: onWaitlist
        ? `You're on the waitlist (position #${waitlistPosition})`
        : 'Registration confirmed successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('RSVP error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process RSVP', details: error.message },
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