import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'

const JWT_SECRET = 'emsi-career-center-secret-2024' // Hardcoded for consistency

// Fallback admin credentials when Supabase is not configured
const FALLBACK_ADMIN_USERNAME = 'admin'
const FALLBACK_ADMIN_PASSWORD_HASH = '$2a$10$NF83M7443VbN1wrE.wtNjeAEQToylt4NhkrZUiPcHOpihJQGbuE/q' // admin123

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    let isValidPassword = false
    let userId = '1'

    // Check if Supabase is configured
    if (isSupabaseConfigured()) {
      // Fetch user from Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Verify password against the hash from database
      isValidPassword = await bcrypt.compare(password, user.password_hash)
      userId = user.id.toString()

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }
    } else {
      // Fallback to hardcoded credentials when Supabase is not configured
      if (username !== FALLBACK_ADMIN_USERNAME) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      isValidPassword = await bcrypt.compare(password, FALLBACK_ADMIN_PASSWORD_HASH)

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: userId,
        username: username
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    const response = NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: { username: username }
      },
      { status: 200 }
    )

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      path: '/',
      maxAge: 60 * 60 // 1 hour
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}