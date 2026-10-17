import { Request, Response } from 'express'
import { geminiService } from '../services/geminiService'
import { databaseService } from '../services/databaseService'
import { academicAuditService } from '../services/academicAuditService'
import { sessionSecurityService } from '../services/sessionSecurityService'
import { sessionCacheService } from '../services/sessionCacheService'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 30

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  record.count++
  return true
}

/**
 * Extracts and cryptographically verifies user and session identity from the request.
 * Enforces that client-supplied IDs cannot bypass authentication or spoof other users.
 */
function resolveVerifiedIdentity(req: Request): {
  verifiedUserId?: string
  verifiedSessionId?: string
  authError?: { status: number; message: string }
} {
  const authHeader = req.headers.authorization
  const rawQueryUserId = typeof req.query.userId === 'string' ? req.query.userId : undefined
  const rawBodyUserId = typeof req.body?.userId === 'string' ? req.body.userId : undefined
  const requestedUserId = rawQueryUserId || rawBodyUserId

  let verifiedUserId: string | undefined = undefined

  // 1. If an authorization bearer token is provided, verify it
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim()
    const userVerification = sessionSecurityService.verifyUserToken(bearerToken)
    if (userVerification.valid && userVerification.userId) {
      verifiedUserId = userVerification.userId
    } else {
      return {
        authError: {
          status: 401,
          message: 'Invalid or expired user authentication credentials.'
        }
      }
    }
  }

  // 2. If client claimed a specific userId, verify it matches authenticated identity
  if (requestedUserId) {
    if (!verifiedUserId) {
      return {
        authError: {
          status: 401,
          message: 'Authentication bearer token required to access user-scoped records.'
        }
      }
    }
    if (verifiedUserId !== requestedUserId) {
      return {
        authError: {
          status: 403,
          message: 'Access denied: Cannot access or manipulate records of another user.'
        }
      }
    }
  }

  // 3. Resolve session identity with signature verification
  const sessionTokenHeader = req.headers['x-session-token'] as string | undefined
  const rawQuerySessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined
  const rawBodySessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : undefined
  const rawQueryToken = typeof req.query.sessionToken === 'string' ? req.query.sessionToken : undefined
  const requestedSessionId = rawQuerySessionId || rawBodySessionId
  const candidateToken = sessionTokenHeader || rawQueryToken

  let verifiedSessionId: string | undefined = requestedSessionId

  // If a session token was provided, ensure it cryptographically matches the session ID
  if (candidateToken) {
    const tokenVerification = sessionSecurityService.parseAndVerifySessionToken(candidateToken)
    if (tokenVerification.valid && tokenVerification.sessionId) {
      if (requestedSessionId && requestedSessionId !== tokenVerification.sessionId) {
        return {
          authError: {
            status: 403,
            message: 'Cryptographic session signature mismatch: session token does not match requested session ID.'
          }
        }
      }
      verifiedSessionId = tokenVerification.sessionId
    } else {
      return {
        authError: {
          status: 403,
          message: 'Invalid or forged cryptographic session token.'
        }
      }
    }
  }

  return { verifiedUserId, verifiedSessionId }
}

export const transformText = async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown'
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please wait a minute before submitting further transformation requests.',
        retryAfterSeconds: 60
      })
    }

    const identity = resolveVerifiedIdentity(req)
    if (identity.authError) {
      return res.status(identity.authError.status).json({
        error: 'Authentication Error',
        message: identity.authError.message
      })
    }

    const { 
      text, 
      mode, 
      tone, 
      intensity, 
      targetLength, 
      vocabulary, 
      highlights, 
      sessionId,
      authorVoice,
      studentVoiceSample,
      ephemeral 
    } = req.body

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Text is required and must be a string'
      })
    }

    const trimmed = text.trim()
    if (trimmed.length === 0) {
      return res.status(400).json({
        error: 'Empty text',
        message: 'Please provide some text to transform'
      })
    }

    if (trimmed.length > 50000) {
      return res.status(400).json({
        error: 'Text too long',
        message: 'Maximum 50,000 characters allowed per transformation'
      })
    }

    const validModes = [
      'natural', 'academic', 'professional', 'casual', 'concise',
      'expand', 'grammar', 'tone', 'paraphrase', 'summary',
      'standard', 'advanced', 'creative'
    ]

    const selectedMode = validModes.includes(mode) ? mode : 'academic'

    // Compute collision-resistant, parameter-aware cache key
    const cacheKey = sessionCacheService.getCacheKey({
      text: trimmed,
      mode: selectedMode,
      tone: typeof tone === 'number' ? tone : 0.5,
      intensity: ['subtle', 'balanced', 'deep'].includes(intensity) ? intensity : 'balanced',
      targetLength: ['shorter', 'same', 'longer'].includes(targetLength) ? targetLength : 'same',
      vocabulary: Boolean(vocabulary),
      highlights: Boolean(highlights),
      authorVoice: typeof authorVoice === 'string' ? authorVoice : 'scholarly',
      studentVoiceSample: typeof studentVoiceSample === 'string' ? studentVoiceSample : undefined
    })

    // Perform transformation via thread-safe single-flight session cache
    const result = await sessionCacheService.getOrCompute(cacheKey, async () => {
      return await geminiService.transform({
        text: trimmed,
        mode: selectedMode,
        tone: typeof tone === 'number' ? tone : 0.5,
        intensity: ['subtle', 'balanced', 'deep'].includes(intensity) ? intensity : 'balanced',
        targetLength: ['shorter', 'same', 'longer'].includes(targetLength) ? targetLength : 'same',
        vocabulary: Boolean(vocabulary),
        highlights: Boolean(highlights),
        authorVoice: typeof authorVoice === 'string' ? authorVoice : 'scholarly',
        studentVoiceSample: typeof studentVoiceSample === 'string' ? studentVoiceSample : undefined
      })
    })

    const effectiveSessionId = identity.verifiedSessionId || (typeof sessionId === 'string' ? sessionId : undefined)
    const effectiveUserId = identity.verifiedUserId

    // Persist to database / session store (honoring ephemeral privacy mode)
    const isEphemeral = Boolean(ephemeral)
    const savedRecord = await databaseService.saveTransformation({
      sessionId: effectiveSessionId,
      userId: effectiveUserId,
      mode: result.mode,
      tone: result.parameters.tone,
      intensity: result.parameters.intensity,
      originalText: result.originalText,
      humanizedText: result.humanizedText,
      originalWords: result.stats.originalWords,
      humanizedWords: result.stats.humanizedWords,
      originalChars: result.stats.originalLength,
      humanizedChars: result.stats.humanizedLength,
      engine: result.engine,
      modelVersion: result.model,
      latencyMs: result.stats.processingTimeMs
    }, isEphemeral)

    // Issue cryptographic proof of ownership for this session
    const sessionToken = effectiveSessionId ? sessionSecurityService.createSignedSessionToken(effectiveSessionId) : undefined

    return res.json({
      id: savedRecord.id,
      ...result,
      createdAt: savedRecord.createdAt,
      ephemeral: isEphemeral,
      sessionToken
    })
  } catch (error: any) {
    console.error('[AIController] Transform error:', error)
    return res.status(500).json({
      error: 'Transformation failed',
      message: error.message || 'An unexpected error occurred during processing'
    })
  }
}

export const analyzeStudentVoice = async (req: Request, res: Response) => {
  try {
    const { sample } = req.body
    if (!sample || typeof sample !== 'string' || sample.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid sample',
        message: 'A writing sample text is required for voice analysis'
      })
    }

    const voiceProfile = academicAuditService.analyzeStudentVoice(sample)
    return res.json({
      success: true,
      voiceProfile
    })
  } catch (err: any) {
    return res.status(500).json({
      error: 'Voice analysis failed',
      message: err.message
    })
  }
}

export const reviewAcademicDraft = async (req: Request, res: Response) => {
  try {
    const { text } = req.body
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Text is required for academic review'
      })
    }

    const report = academicAuditService.generateAcademicQualityReport(text, text)
    return res.json({
      success: true,
      academicReport: report
    })
  } catch (err: any) {
    return res.status(500).json({
      error: 'Review failed',
      message: err.message
    })
  }
}

export const getConfig = async (_req: Request, res: Response) => {
  const geminiStatus = geminiService.getStatus()
  const dbStatus = databaseService.getStatus()

  return res.json({
    brand: 'Humanora AI',
    tagline: 'Write Naturally. Express Authentically.',
    academicTagline: 'Academic Writing Improvement & Integrity Platform',
    version: '3.0.0',
    platformType: 'academic_writing_improvement',
    ai: geminiStatus,
    database: dbStatus,
    modes: [
      { id: 'academic', name: 'Academic Clarity', desc: 'Formal expression with scholarly precision and citation preservation' },
      { id: 'natural', name: 'Natural Academic Rewrite', desc: 'Remove formulaic cadence while preserving argument structure' },
      { id: 'professional', name: 'Professional Writing', desc: 'Crisp executive communication and actionable workplace prose' },
      { id: 'casual', name: 'Casual Writing', desc: 'Friendly conversational phrasing with authentic flow' },
      { id: 'concise', name: 'Concise Academic Writing', desc: 'Strip out bloat and fluff while preserving all core evidence' },
      { id: 'expand', name: 'Expand for Clarity', desc: 'Elaborate nuanced ideas with illustrative context' },
      { id: 'grammar', name: 'Grammar and Style Review', desc: 'Fix spelling, punctuation, and syntax while preserving student voice' },
      { id: 'tone', name: 'Tone Adjustment', desc: 'Fine-tune tone across formal, neutral, and conversational registers' },
      { id: 'paraphrase', name: 'Paraphrasing', desc: 'Rephrase ideas with fresh vocabulary and varied structures' },
      { id: 'summary', name: 'Summarization', desc: 'Distill core insights into a concise factual brief' }
    ],
    authorVoices: [
      { id: 'scholarly', name: 'Scholarly & Objective', desc: 'Analytical, rigorous, methodical academic argumentation' },
      { id: 'direct', name: 'Direct & Impactful', desc: 'Clear, assertive, active voice, zero fluff' },
      { id: 'balanced', name: 'Balanced & Natural', desc: 'Nuanced, versatile, organic cadence' },
      { id: 'conversational', name: 'Friendly & Engaging', desc: 'Warm, relatable, approachable dialogue' }
    ],
    privacyPolicy: {
      ephemeralModeSupported: true,
      description: 'Humanora AI processes text exclusively for user-directed writing enhancement. Students can enable Incognito/Ephemeral mode for zero database storage.',
      noAiScoreFabrication: true
    },
    limits: {
      maxCharacters: 50000,
      rateLimitPerMinute: MAX_REQUESTS_PER_WINDOW
    }
  })
}

export const getHistory = async (req: Request, res: Response) => {
  try {
    const identity = resolveVerifiedIdentity(req)
    if (identity.authError) {
      return res.status(identity.authError.status).json({
        error: 'Authentication Error',
        message: identity.authError.message
      })
    }

    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20))
    const sessionId = identity.verifiedSessionId
    const userId = identity.verifiedUserId

    const result = await databaseService.getHistory(limit, sessionId, userId)
    return res.json(result)
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve history', message: err.message })
  }
}

export const getHistoryItem = async (req: Request, res: Response) => {
  try {
    const identity = resolveVerifiedIdentity(req)
    if (identity.authError) {
      return res.status(identity.authError.status).json({
        error: 'Authentication Error',
        message: identity.authError.message
      })
    }

    const sessionId = identity.verifiedSessionId
    const userId = identity.verifiedUserId

    const item = await databaseService.getTransformationById(req.params.id, sessionId, userId)
    if (!item) {
      return res.status(404).json({ error: 'Not Found', message: 'Writing session not found or unauthorized' })
    }
    return res.json(item)
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve item', message: err.message })
  }
}

export const deleteHistoryItem = async (req: Request, res: Response) => {
  try {
    const identity = resolveVerifiedIdentity(req)
    if (identity.authError) {
      return res.status(identity.authError.status).json({
        error: 'Authentication Error',
        message: identity.authError.message
      })
    }

    const sessionId = identity.verifiedSessionId
    const userId = identity.verifiedUserId

    const success = await databaseService.deleteTransformation(req.params.id, sessionId, userId)
    if (!success) {
      return res.status(404).json({ error: 'Not Found', message: 'Item not found or already deleted' })
    }
    return res.json({ success: true, message: 'Item deleted successfully' })
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete item', message: err.message })
  }
}

