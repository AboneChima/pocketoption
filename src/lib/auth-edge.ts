import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export function verifyToken(token: string): { userId: string } | null {
  try {
    console.log('verifyToken: JWT_SECRET available:', JWT_SECRET ? 'Yes' : 'No')
    console.log('verifyToken: JWT_SECRET length:', JWT_SECRET.length)
    console.log('verifyToken: Token to verify:', token.substring(0, 50) + '...')
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    console.log('verifyToken: Successfully decoded token for user:', decoded.userId)
    return decoded
  } catch (error) {
    console.error('verifyToken: JWT verification failed:', error)
    return null
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}