import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get('upcoming') === 'true'
    const type = searchParams.get('type')
    const format = searchParams.get('format')
    const featured = searchParams.get('featured') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    let query = supabase
      .from('events')
      .select(`
        id, title, slug, description, event_date, event_time, location,
        capacity, spots_taken, status, event_type, event_format,
        city, campus, tags, host_org, image_url, featured,
        agenda, speakers, what_to_bring, meeting_link,
        created_at, updated_at
      `)
      .eq('status', 'upcoming')
      .order('event_date', { ascending: true })

    if (upcoming) {
      query = query.gte('event_date', new Date().toISOString().split('T')[0])
    }

    if (type && type !== '') {
      query = query.eq('event_type', type)
    }

    if (format && format !== '') {
      query = query.eq('event_format', format)
    }

    if (featured) {
      query = query.eq('featured', true)
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({
      events: data || [],
      total: data?.length || 0
    })
  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      event_date,
      event_time,
      location,
      event_type,
      event_format,
      city,
      campus,
      tags,
      host_org,
      capacity,
      image_url,
      agenda,
      speakers,
      what_to_bring,
      meeting_link
    } = body

    // Validate required fields
    if (!title || !event_date || !event_time || !location || !capacity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert new event
    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        event_date,
        event_time,
        location,
        event_type: event_type || 'workshop',
        event_format: event_format || 'on-campus',
        city,
        campus,
        tags,
        host_org,
        capacity,
        spots_taken: 0,
        image_url,
        agenda,
        speakers,
        what_to_bring,
        meeting_link,
        status: 'upcoming'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ event: data }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}