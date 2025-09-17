import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// For demo purposes, using a hardcoded password hash
// In production, this should be fetched from the database
const ADMIN_PASSWORD_HASH = '$2a$10$YKd5g0kh8zH.gJEVLp7VCeZwV2yJ0m5DKJvXrKHX8xQKH9vxhHVmG' // admin123

export async function POST(request: NextRequest) {
  try {
    // Verify JWT from cookies or headers
    const cookieToken = request.cookies.get('admin-token')?.value
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    const token = cookieToken || headerToken

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get password from request body
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}