import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../../../lib/supabase'
import { verifyJWT } from '../../../lib/auth'

export async function GET(request: NextRequest) {
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
    // Return mock data when database is not configured
    return NextResponse.json([
      {
        id: 1,
        sender_name: 'John Doe',
        sender_email: 'john@example.com',
        subject: 'Career Guidance Request',
        message: 'I would like to schedule a career counseling session to discuss my options for internships.',
        status: 'unread',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        sender_name: 'Sarah Smith',
        sender_email: 'sarah@example.com',
        subject: 'Resume Review',
        message: 'Could you please review my resume? I am applying for software engineering positions.',
        status: 'read',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ])
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sender_name, sender_email, sender_phone, subject, message } = body

    if (!sender_name || !sender_email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    if (!isSupabaseConfigured()) {
      // When database is not configured, still return success to allow testing
      return NextResponse.json(
        {
          message: 'Message sent successfully (demo mode)',
          data: {
            id: Date.now(),
            sender_name,
            sender_email,
            sender_phone: sender_phone || null,
            subject,
            message,
            status: 'unread',
            created_at: new Date().toISOString()
          }
        },
        { status: 201 }
      )
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_name,
        sender_email,
        sender_phone: sender_phone || null,
        subject,
        message,
        status: 'unread'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Message sent successfully', data },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}