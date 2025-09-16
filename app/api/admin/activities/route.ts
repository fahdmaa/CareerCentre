import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'
import { verifyJWT } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
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

    if (!isSupabaseConfigured()) {
      // Return mock data if Supabase not configured
      const now = new Date()
      const activities = []

      // Generate mock activities
      for (let i = 0; i < 10; i++) {
        const date = new Date(now)
        date.setHours(date.getHours() - i * 2)

        const types = ['message', 'registration', 'application', 'interview']
        const type = types[i % types.length]

        let description = ''
        let user_name = ''

        switch (type) {
          case 'message':
            user_name = `User ${i + 1}`
            description = `New contact message received from ${user_name}`
            break
          case 'registration':
            user_name = `Student ${i + 1}`
            description = `${user_name} registered for Career Workshop`
            break
          case 'application':
            user_name = `Applicant ${i + 1}`
            description = `New ambassador application from ${user_name}`
            break
          case 'interview':
            user_name = `Candidate ${i + 1}`
            description = `Interview scheduled with ${user_name}`
            break
        }

        activities.push({
          id: i + 1,
          activity_type: type,
          description,
          user_name,
          created_at: date.toISOString()
        })
      }

      return NextResponse.json(activities)
    }

    const { data, error } = await supabase
      .from('recent_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Supabase error:', error)
      // Return empty array instead of error for activities
      return NextResponse.json([])
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching activities:', error)
    // Return empty array instead of error for activities
    return NextResponse.json([])
  }
}