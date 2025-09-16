import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  // Check for token in cookie first
  const cookieToken = request.cookies.get('admin-token')?.value

  // Also check Authorization header as fallback
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  const token = cookieToken || headerToken

  if (!token) {
    return NextResponse.json({
      error: 'No token provided',
      authenticated: false
    }, { status: 401 })
  }

  const payload = verifyJWT(token)

  if (!payload) {
    return NextResponse.json({
      error: 'Invalid token',
      authenticated: false
    }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: payload.userId,
      username: payload.username
    }
  })
}