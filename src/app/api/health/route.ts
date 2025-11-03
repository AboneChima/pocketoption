import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Check if prisma is available
    if (!prisma) {
      return NextResponse.json({
        status: 'partial',
        timestamp: new Date().toISOString(),
        database: 'not_configured',
        service: 'pocketoption-backend',
        message: 'Database not configured - set DATABASE_URL environment variable'
      })
    }

    // Test database connection
    await prisma.$connect()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      service: 'pocketoption-backend'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Database connection failed',
        service: 'pocketoption-backend'
      },
      { status: 500 }
    )
  }
}