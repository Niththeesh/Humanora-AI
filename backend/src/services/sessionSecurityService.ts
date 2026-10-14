import crypto from 'crypto'

/**
 * Humanora AI — Session & Identity Security Service
 * Enforces cryptographic proof-of-ownership for guest sessions and verifies authenticated tokens.
 * Guarantees that an untrusted client parameter (e.g. raw sessionId or userId) cannot be used
 * as the sole security boundary to access another user's or guest's writing history.
 */

const SESSION_SIGNING_SECRET = process.env.SESSION_SECRET || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'humanora-academic-default-session-hmac-key-2026'

export class SessionSecurityService {
  private secret: string

  constructor(secret?: string) {
    this.secret = secret || SESSION_SIGNING_SECRET
  }

  /**
   * Generates an HMAC-SHA256 signature for a session ID.
   */
  public generateSessionSignature(sessionId: string): string {
    return crypto
      .createHmac('sha256', this.secret)
      .update(`session:${sessionId}`)
      .digest('hex')
  }

  /**
   * Generates a combined signed session token: <sessionId>.<signature>
   */
  public createSignedSessionToken(sessionId: string): string {
    const signature = this.generateSessionSignature(sessionId)
    return `${sessionId}.${signature}`
  }

  /**
   * Verifies that a session ID and signature match cryptographically.
   */
  public verifySessionSignature(sessionId: string, signature: string): boolean {
    if (!sessionId || !signature) return false
    try {
      const expected = this.generateSessionSignature(sessionId)
      const expectedBuf = Buffer.from(expected, 'hex')
      const actualBuf = Buffer.from(signature, 'hex')
      if (expectedBuf.length !== actualBuf.length) return false
      return crypto.timingSafeEqual(expectedBuf, actualBuf)
    } catch {
      return false
    }
  }

  /**
   * Parses and validates a combined session token string.
   */
  public parseAndVerifySessionToken(token: string): { valid: boolean; sessionId?: string } {
    if (!token || typeof token !== 'string') return { valid: false }
    const parts = token.split('.')
    if (parts.length !== 2) return { valid: false }
    const [sessionId, signature] = parts
    const valid = this.verifySessionSignature(sessionId, signature)
    return valid ? { valid: true, sessionId } : { valid: false }
  }

  /**
   * Generates a signed token for an authenticated user.
   */
  public generateUserToken(userId: string): string {
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(`user:${userId}`)
      .digest('hex')
    return `${userId}.${signature}`
  }

  /**
   * Verifies a user authentication token.
   */
  public verifyUserToken(token: string): { valid: boolean; userId?: string } {
    if (!token || typeof token !== 'string') return { valid: false }
    const parts = token.split('.')
    if (parts.length !== 2) return { valid: false }
    const [userId, signature] = parts
    try {
      const expected = crypto
        .createHmac('sha256', this.secret)
        .update(`user:${userId}`)
        .digest('hex')
      const expectedBuf = Buffer.from(expected, 'hex')
      const actualBuf = Buffer.from(signature, 'hex')
      if (expectedBuf.length !== actualBuf.length) return { valid: false }
      const valid = crypto.timingSafeEqual(expectedBuf, actualBuf)
      return valid ? { valid: true, userId } : { valid: false }
    } catch {
      return { valid: false }
    }
  }
}

export const sessionSecurityService = new SessionSecurityService()
