import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection by attempting to connect
    await prisma.$connect()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed'
    }, { status: 503 })
  }
}