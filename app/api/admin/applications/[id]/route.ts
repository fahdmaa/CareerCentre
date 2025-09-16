import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../../lib/supabase'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const { status } = body

    if (!isSupabaseConfigured()) {
      // Return success if Supabase not configured
      return NextResponse.json({
        message: 'Application status updated',
        id: params.id,
        status
      })
    }

    const { data, error } = await supabase
      .from('cohort_applications')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the activity
    await supabase
      .from('recent_activities')
      .insert({
        activity_type: 'application',
        description: `Application #${params.id} status changed to ${status}`,
        activity_data: { application_id: params.id, new_status: status }
      })
      .catch(console.error) // Don't fail if activity log fails

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}