import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD_HASH = '$2a$10$8KqGkZf3cGJ7xWJZLPqPOuPxB9W.kGXQP5cGHvq5nG0M4kMkMDnW6' // admin123
const JWT_SECRET = 'emsi-career-center-secret-2024' // Hardcoded for consistency

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      {
        userId: '1',
        username: ADMIN_USERNAME
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    const response = NextResponse.json(
      { 
        message: 'Login successful',
        token,
        user: { username: ADMIN_USERNAME }
      },
      { status: 200 }
    )

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 // 1 hour
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}