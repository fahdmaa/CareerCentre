import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // Check if it's a slug or numeric ID
    const isNumeric = /^\d+$/.test(id)

    let event
    if (isNumeric) {
      // Fetch by ID
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', parseInt(id))
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }
      event = data
    } else {
      // Fetch by slug
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', id)
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }
      event = data
    }

    // Fetch related events
    const { data: relatedEvents } = await supabase
      .from('events')
      .select('*')
      .neq('id', event.id)
      .eq('event_type', event.event_type)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .limit(3)

    return NextResponse.json({
      event,
      relatedEvents: relatedEvents || []
    })
  } catch (error: any) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()

    // Check if it's a slug or numeric ID
    const isNumeric = /^\d+$/.test(id)

    let data, error
    if (isNumeric) {
      ({ data, error } = await supabase
        .from('events')
        .update(body)
        .eq('id', parseInt(id))
        .select()
        .single())
    } else {
      ({ data, error } = await supabase
        .from('events')
        .update(body)
        .eq('slug', id)
        .select()
        .single())
    }

    if (error) {
      throw error
    }

    return NextResponse.json({ event: data })
  } catch (error: any) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // Check if it's a slug or numeric ID
    const isNumeric = /^\d+$/.test(id)

    let error
    if (isNumeric) {
      ({ error } = await supabase
        .from('events')
        .delete()
        .eq('id', parseInt(id)))
    } else {
      ({ error } = await supabase
        .from('events')
        .delete()
        .eq('slug', id))
    }

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}