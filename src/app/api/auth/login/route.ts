import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebaseAdmin'
import { generateToken } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('Login attempt for email:', email)

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    try {
      console.log('Attempting Firebase REST login...')
      console.log('Environment:', process.env.NODE_ENV)
      console.log('Firebase Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)

      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      if (!apiKey) {
        return NextResponse.json(
          { success: false, message: 'Missing Firebase API key' },
          { status: 500 }
        )
      }

      const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true })
        }
      )

      const payload = await resp.json()
      if (!resp.ok) {
        const msg = payload?.error?.message || 'Invalid credentials'
        return NextResponse.json(
          { success: false, message: msg },
          { status: 401 }
        )
      }

      const idToken = payload.idToken as string
      const uid = payload.localId as string

      try { await adminAuth.verifyIdToken(idToken) } catch (e) { console.warn('ID token verification failed:', e) }

      const docRef = adminDb.collection('users').doc(uid)
      const snap = await docRef.get()
      let userData: any
      if (snap.exists) {
        userData = snap.data()
      } else {
        userData = {
          id: uid,
          email,
          firstName: '',
          lastName: '',
          balance: 0,
          isAdmin: email.toLowerCase() === 'admin@pocketoption.com',
          kycStatus: 'pending',
          createdAt: new Date().toISOString(),
          phone: '',
          location: ''
        }
        await docRef.set(userData)
      }

      const jwtToken = generateToken(uid)

      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: userData,
        token: jwtToken
      })

      response.cookies.set('auth-token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60
      })

      console.log('Login API: Returning successful response')
      return response
    } catch (error: any) {
      console.error('Server-side login error:', error)
      return NextResponse.json(
        { success: false, message: error?.message || 'Invalid credentials' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
