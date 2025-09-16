import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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

    if (!isSupabaseConfigured()) {
      // Return mock data if Supabase not configured
      return NextResponse.json([
        {
          id: 1,
          cohort_id: 1,
          student_name: 'Emily Chen',
          student_email: 'emily@example.com',
          major: 'Marketing',
          year: 'Year 3',
          motivation: 'I am passionate about helping fellow students navigate their career paths and would love to contribute to the Career Center\'s mission.',
          status: 'pending',
          created_at: new Date().toISOString(),
          cohort: { name: 'Spring 2024 Cohort' }
        },
        {
          id: 2,
          cohort_id: 1,
          student_name: 'Mohamed Ali',
          student_email: 'mohamed@example.com',
          major: 'Engineering',
          year: 'Year 4',
          motivation: 'Having benefited from the Career Center\'s resources, I want to give back by becoming an ambassador and helping others succeed.',
          status: 'pending',
          created_at: new Date().toISOString(),
          cohort: { name: 'Spring 2024 Cohort' }
        },
        {
          id: 3,
          cohort_id: 1,
          student_name: 'Lisa Martinez',
          student_email: 'lisa@example.com',
          major: 'Computer Science',
          year: 'Year 2',
          motivation: 'I believe in the power of peer support and want to help create a strong career-focused community on campus.',
          status: 'accepted',
          created_at: new Date().toISOString(),
          cohort: { name: 'Spring 2024 Cohort' }
        }
      ])
    }

    const { data, error } = await supabase
      .from('cohort_applications')
      .select(`
        *,
        cohort:cohorts(name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}