import { Request, Response } from 'express'
import { geminiService } from '../services/geminiService'
import { databaseService } from '../services/databaseService'

const responseCache = new Map<string, any>()
const CACHE_DURATION = 5 * 60 * 1000

function getCacheKey(text: string, mode: string): string {
  return `${mode}:${text.substring(0, 100)}`
}

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

    const cacheKey = getCacheKey(cleanText, selectedMode)
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey)
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return res.json(cached.data)
      } else {
        responseCache.delete(cacheKey)
      }
    }

    const transformResult = await geminiService.transform({
      text: cleanText,
      mode: selectedMode,
      tone: tone,
      intensity: complexity && complexity > 0.6 ? 'deep' : complexity && complexity < 0.4 ? 'subtle' : 'balanced',
      vocabulary: Boolean(vocabulary),
      highlights: Boolean(highlights),
      authorVoice: authorVoice
    })

    const result: any = {
      humanizedText: transformResult.humanizedText,
      originalText: transformResult.originalText,
      mode: transformResult.mode,
      engine: transformResult.engine,
      model: transformResult.model,
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
      warning: transformResult.warning,
      highlights: transformResult.highlights || []
    }

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

    responseCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })

    if (responseCache.size > 100) {
      const firstKey = responseCache.keys().next().value
      if (firstKey) responseCache.delete(firstKey)
    }

    res.json(result)
  } catch (error) {
    console.error('Humanization error:', error)
    res.status(500).json({
      error: 'Processing failed',
      message: 'An error occurred while processing your text',
    })
  }
}
