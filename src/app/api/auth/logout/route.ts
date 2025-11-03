import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // For JWT-based auth, logout is handled client-side
    // This endpoint exists for consistency and future token blacklisting
    
    return NextResponse.json({
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}