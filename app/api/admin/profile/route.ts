import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, hashPassword } from '@/lib/auth'

// For demo purposes, storing in memory
// In production, this should be stored in a database
let adminProfile = {
  fullName: 'Admin User',
  email: 'admin@emsi.ma',
  occupation: 'System Administrator',
  role: 'admin',
  username: 'admin'
}

export async function GET(request: NextRequest) {
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

    return NextResponse.json(adminProfile)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    // Get update data from request body
    const updateData = await request.json()

    // Update profile data (excluding password for now in this demo)
    if (updateData.fullName) adminProfile.fullName = updateData.fullName
    if (updateData.email) adminProfile.email = updateData.email
    if (updateData.occupation) adminProfile.occupation = updateData.occupation

    // In production, you would also handle password update here
    // if (updateData.newPassword) {
    //   const hashedPassword = await hashPassword(updateData.newPassword)
    //   // Update password in database
    // }

    return NextResponse.json({
      success: true,
      profile: adminProfile
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}