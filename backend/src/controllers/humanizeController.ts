import { Request, Response } from 'express'
import { geminiService } from '../services/geminiService'
import { databaseService } from '../services/databaseService'
import { sessionCacheService } from '../services/sessionCacheService'

export const humanizeText = async (req: Request, res: Response) => {
  try {
    const { 
      text, 
      mode, 
      tone, 
      complexity, 
      vocabulary, 
      highlights, 
      sessionId,
      authorVoice 
    } = req.body

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Text is required and must be a string',
      })
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        error: 'Empty text',
        message: 'Please provide some text to humanize',
      })
    }

    if (text.length > 50000) {
      return res.status(400).json({
        error: 'Text too long',
        message: 'Maximum 50,000 characters allowed',
      })
    }

    const cleanText = text.trim()
    const selectedMode = mode || 'standard'
    const intensity = complexity && complexity > 0.6 ? 'deep' : complexity && complexity < 0.4 ? 'subtle' : 'balanced'

    // Compute collision-resistant, parameter-aware cache key
    const cacheKey = sessionCacheService.getCacheKey({
      text: cleanText,
      mode: selectedMode,
      tone: typeof tone === 'number' ? tone : undefined,
      intensity,
      vocabulary: Boolean(vocabulary),
      highlights: Boolean(highlights),
      authorVoice: typeof authorVoice === 'string' ? authorVoice : undefined
    })

    // Thread-safe single-flight cached computation: eliminates stampede & deduplicates concurrent requests
    const transformResult = await sessionCacheService.getOrCompute(cacheKey, async () => {
      return await geminiService.transform({
        text: cleanText,
        mode: selectedMode,
        tone: tone,
        intensity,
        vocabulary: Boolean(vocabulary),
        highlights: Boolean(highlights),
        authorVoice: authorVoice
      })
    })

    const result: any = {
      humanizedText: transformResult.humanizedText,
      originalText: transformResult.originalText,
      mode: transformResult.mode,
      engine: transformResult.engine,
      model: transformResult.model,
      isFallback: transformResult.isFallback,
      parameters: {
        tone: transformResult.parameters.tone,
        complexity: complexity ?? 0.5,
        vocabulary: transformResult.parameters.vocabulary,
        authorVoice: transformResult.parameters.authorVoice
      },
      stats: {
        originalLength: transformResult.stats.originalLength,
        humanizedLength: transformResult.stats.humanizedLength,
        originalWords: transformResult.stats.originalWords,
        humanizedWords: transformResult.stats.humanizedWords,
        processingTime: Date.now(),
      },
      changesExplanation: transformResult.changesExplanation,
      factualIntegrity: transformResult.factualIntegrity,
      academicReport: transformResult.academicReport,
      studentVoiceProfile: transformResult.studentVoiceProfile,
      aiMetrics: transformResult.aiMetrics,
      warning: transformResult.warning,
      highlights: transformResult.highlights || []
    }

    // Record transformation with caller's session identity (preventing cross-session history drop)
    databaseService.saveTransformation({
      sessionId: typeof sessionId === 'string' ? sessionId : undefined,
      mode: transformResult.mode,
      tone: transformResult.parameters.tone,
      originalText: transformResult.originalText,
      humanizedText: transformResult.humanizedText,
      originalWords: transformResult.stats.originalWords,
      humanizedWords: transformResult.stats.humanizedWords,
      originalChars: transformResult.stats.originalLength,
      humanizedChars: transformResult.stats.humanizedLength,
      engine: transformResult.engine,
      modelVersion: transformResult.model,
      latencyMs: transformResult.stats.processingTimeMs
    }).catch(err => console.warn('[humanizeController] Background save warning:', err))

    res.json(result)
  } catch (error) {
    console.error('Humanization error:', error)
    res.status(500).json({
      error: 'Processing failed',
      message: 'An error occurred while processing your text',
    })
  }
}

