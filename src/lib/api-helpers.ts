import { NextResponse } from 'next/server'
import { prisma } from './db'

export function createDatabaseUnavailableResponse() {
  return NextResponse.json(
    { 
      error: 'Database unavailable', 
      message: 'The database is not configured. Please set the DATABASE_URL environment variable.' 
    },
    { status: 503 }
  )
}

export function isDatabaseAvailable(): boolean {
  return prisma !== null
}

export function requireDatabase() {
  if (!isDatabaseAvailable()) {
    throw new Error('Database not available')
  }
  return prisma!
}