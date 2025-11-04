// Edge Runtime compatible JWT verification using Web Crypto API
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

// Convert string to ArrayBuffer
function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder()
  const uint8Array = encoder.encode(str)
  return uint8Array.buffer
}

// Convert ArrayBuffer to base64url
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Convert base64url to ArrayBuffer
function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  // Add padding if needed
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4)
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + padding
  
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// Parse JWT token
function parseJWT(token: string): { header: any; payload: any; signature: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    
    return {
      header,
      payload,
      signature: parts[2]
    }
  } catch {
    return null
  }
}

// Verify JWT signature using Web Crypto API
export async function verifyTokenEdge(token: string): Promise<{ userId: string } | null> {
  try {
    const parsed = parseJWT(token)
    if (!parsed) {
      return null
    }

    const { header, payload, signature } = parsed

    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }

    // Verify signature using HMAC-SHA256
    const parts = token.split('.')
    const message = `${parts[0]}.${parts[1]}`
    
    const key = await crypto.subtle.importKey(
      'raw',
      stringToArrayBuffer(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )

    const messageBuffer = stringToArrayBuffer(message)
    const signatureBuffer = base64UrlToArrayBuffer(signature)

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      messageBuffer
    )

    if (!isValid) {
      return null
    }

    return { userId: payload.userId }

  } catch (error) {
    console.error('verifyTokenEdge: Verification failed:', error)
    return null
  }
}

// Generate JWT token using Web Crypto API
export async function generateTokenEdge(userId: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  }

  const headerBase64 = btoa(JSON.stringify(header))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const payloadBase64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const message = `${headerBase64}.${payloadBase64}`

  const key = await crypto.subtle.importKey(
    'raw',
    stringToArrayBuffer(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, stringToArrayBuffer(message))
  const signatureBase64 = arrayBufferToBase64Url(signature)

  return `${message}.${signatureBase64}`
}