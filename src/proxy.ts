import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth-edge-compatible'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip proxy for public routes and admin routes
  if (
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/admin') || // Allow all admin routes
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next()
  }

  // Get token from Authorization header or cookies
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value

  if (!token) {
    // Redirect to login for protected routes (except admin which has its own auth)
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    return NextResponse.next()
  }

  try {
    // Verify JWT token (without database lookup for edge runtime compatibility)
    const decoded = await verifyTokenEdge(token)
    
    if (!decoded) {
      // Invalid token, redirect to login (except admin which has its own auth)
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/auth', request.url))
      }
      return NextResponse.next()
    }

    // For admin routes, we'll check admin status in the page component
    // since we can't do database lookups in edge runtime

    // Add user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', decoded.userId)

    return response
  } catch (error) {
    console.error('Proxy authentication error:', error)
    
    // On error, redirect to login for protected routes (except admin which has its own auth)
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}