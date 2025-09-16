import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    // Validate required fields
    const { name, email, consent } = body

    if (!name || !email || !consent) {
      return NextResponse.json(
        { error: 'Missing required fields or consent not given' },
        { status: 400 }
      )
    }

    // Check if email already exists to avoid duplicates
    const { data: existing, error: checkError } = await supabase
      .from('notification_subscribers')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: 'Email already subscribed for notifications' },
        { status: 200 }
      )
    }

    const { data, error } = await supabase
      .from('notification_subscribers')
      .insert({
        ...body,
        subscribed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Successfully subscribed for notifications', data },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to subscribe for notifications' },
      { status: 500 }
    )
  }
}