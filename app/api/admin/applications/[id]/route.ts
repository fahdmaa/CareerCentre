import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../../lib/supabase'
import { verifyJWT } from '../../../../../lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check for token in cookie first
    const cookieToken = request.cookies.get('admin-token')?.value

    // Also check Authorization header as fallback
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    const token = cookieToken || headerToken

    if (!token || !verifyJWT(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    try {
      await supabase
        .from('recent_activities')
        .insert({
          activity_type: 'application',
          description: `Application #${params.id} status changed to ${status}`,
          activity_data: { application_id: params.id, new_status: status }
        })
    } catch (activityError) {
      console.error('Failed to log activity:', activityError)
      // Don't fail if activity log fails
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}