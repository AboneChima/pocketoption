import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth'
import { generateToken } from '@/lib/auth'
import { COLLECTIONS } from '@/lib/firebase'
import { adminDb, adminAuth } from '@/lib/firebaseAdmin'
import { setDoc, doc, getDoc } from 'firebase/firestore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    try {
      // Use Firebase authentication
      const created = await adminAuth.createUser({ email, password })

      const userData = {
        id: created.uid,
        email: created.email || '',
        firstName: firstName || '',
        lastName: lastName || '',
        balance: 0,
        isAdmin: (created.email || '').toLowerCase() === 'admin@pocketoption.com',
        kycStatus: 'pending',
        createdAt: new Date().toISOString(),
        phone: '',
        location: ''
      }

      await adminDb.collection(COLLECTIONS.USERS).doc(created.uid).set(userData)

      const jwtToken = generateToken(created.uid)
      
      

      // Create response with user data
      const response = NextResponse.json({
        success: true,
        message: 'Registration successful',
        user: userData,
        token: jwtToken
      })

      // Set JWT token as httpOnly cookie for middleware authentication
      response.cookies.set('auth-token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      return response
    } catch (firebaseError: any) {
      console.error('Firebase Admin registration error:', firebaseError)
      
      // Handle specific Firebase errors
      if (firebaseError.message.includes('email-already-exists')) {
        return NextResponse.json(
          { success: false, message: 'User already exists' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { success: false, message: firebaseError.message || 'Registration failed' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}


