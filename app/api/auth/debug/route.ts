import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '../../../../lib/auth'
import { isSupabaseConfigured } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabase: {
      configured: isSupabaseConfigured(),
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      serviceKey: process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'NOT SET'
    },
    jwt: {
      secret: process.env.JWT_SECRET ? 'ENV VAR SET' : 'USING DEFAULT',
    },
    cookies: {},
    headers: {},
    authentication: {
      cookieToken: null,
      headerToken: null,
      isValid: false,
      decodedPayload: null
    }
  }

  // Check cookies
  const cookies = request.cookies.getAll()
  debugInfo.cookies = cookies.reduce((acc, cookie) => {
    acc[cookie.name] = cookie.name === 'admin-token' ?
      `${cookie.value.substring(0, 20)}...` : cookie.value
    return acc
  }, {} as any)

  // Check headers
  const authHeader = request.headers.get('authorization')
  const userAgent = request.headers.get('user-agent')
  debugInfo.headers = {
    authorization: authHeader ? `${authHeader.substring(0, 30)}...` : 'NOT SET',
    userAgent: userAgent?.substring(0, 50) + '...'
  }

  // Check authentication
  const cookieToken = request.cookies.get('admin-token')?.value
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  debugInfo.authentication.cookieToken = cookieToken ?
    `${cookieToken.substring(0, 20)}...` : 'NOT FOUND'
  debugInfo.authentication.headerToken = headerToken ?
    `${headerToken.substring(0, 20)}...` : 'NOT FOUND'

  const token = cookieToken || headerToken
  if (token) {
    try {
      const payload = verifyJWT(token)
      debugInfo.authentication.isValid = !!payload
      if (payload) {
        debugInfo.authentication.decodedPayload = {
          userId: payload.userId,
          username: payload.username,
          iat: payload.iat,
          exp: payload.exp,
          expired: payload.exp ? new Date(payload.exp * 1000) < new Date() : false
        }
      }
    } catch (error: any) {
      debugInfo.authentication.error = error.message
    }
  }

  return NextResponse.json(debugInfo)
}

export async function POST(request: NextRequest) {
  try {
    const { test } = await request.json()

    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      tests: {
        cookieSupport: false,
        localStorageSupport: false,
        headerSupport: false,
        supabaseConnection: false,
        jwtGeneration: false
      },
      errors: []
    }

    // Test 1: Cookie support
    try {
      const testResponse = NextResponse.json({ test: 'cookie' })
      testResponse.cookies.set('test-cookie', 'test-value', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60
      })
      diagnostics.tests.cookieSupport = true
    } catch (error: any) {
      diagnostics.errors.push(`Cookie test failed: ${error.message}`)
    }

    // Test 2: Supabase connection
    if (isSupabaseConfigured()) {
      try {
        const { supabase } = await import('../../../../lib/supabase')
        const { error } = await supabase.from('users').select('id').limit(1)
        diagnostics.tests.supabaseConnection = !error
        if (error) {
          diagnostics.errors.push(`Supabase test failed: ${error.message}`)
        }
      } catch (error: any) {
        diagnostics.errors.push(`Supabase connection failed: ${error.message}`)
      }
    } else {
      diagnostics.tests.supabaseConnection = 'NOT CONFIGURED'
    }

    // Test 3: JWT generation
    try {
      const testToken = verifyJWT('invalid.token.here')
      diagnostics.tests.jwtGeneration = false
    } catch {
      // Expected to fail, which means JWT verification is working
      diagnostics.tests.jwtGeneration = true
    }

    // Test 4: Header support (checked from request)
    const authHeader = request.headers.get('authorization')
    diagnostics.tests.headerSupport = !!authHeader

    return NextResponse.json(diagnostics)
  } catch (error: any) {
    return NextResponse.json({
      error: 'Diagnostic test failed',
      message: error.message
    }, { status: 500 })
  }
}