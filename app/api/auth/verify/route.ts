import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check for token in cookie first
    const cookieToken = request.cookies.get('admin-token')?.value

    // Also check Authorization header as fallback
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    const token = cookieToken || headerToken

    // Log for debugging
    console.log('Verify endpoint - Cookie token:', cookieToken ? 'present' : 'absent')
    console.log('Verify endpoint - Header token:', headerToken ? 'present' : 'absent')
    console.log('Verify endpoint - Using token from:', cookieToken ? 'cookie' : headerToken ? 'header' : 'none')

    if (!token) {
      return NextResponse.json({
        error: 'No token provided',
        authenticated: false,
        debug: {
          hasCookie: !!cookieToken,
          hasHeader: !!headerToken,
          authHeader: authHeader ? authHeader.substring(0, 20) + '...' : null
        }
      }, { status: 401 })
    }

    const payload = verifyJWT(token)

    if (!payload) {
      console.log('Token verification failed for token:', token.substring(0, 20) + '...')
      return NextResponse.json({
        error: 'Invalid token',
        authenticated: false,
        debug: {
          tokenLength: token.length,
          tokenStart: token.substring(0, 20),
          source: cookieToken ? 'cookie' : 'header'
        }
      }, { status: 401 })
    }

    console.log('Token verified successfully for user:', payload.username)

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: payload.userId,
        username: payload.username
      }
    })
  } catch (error: any) {
    console.error('Verify endpoint error:', error)
    return NextResponse.json({
      error: 'Verification error',
      message: error.message,
      authenticated: false
    }, { status: 500 })
  }
}