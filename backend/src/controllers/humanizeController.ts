import { Request, Response } from 'express'
import { humanizationService } from '../services/serviceFactory'

// Simple in-memory cache for frequently used transformations
const responseCache = new Map<string, any>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCacheKey(text: string, mode: string): string {
  return `${mode}:${text.substring(0, 100)}`
}

export const humanizeText = async (req: Request, res: Response) => {
  try {
    const { text, mode, tone, complexity, vocabulary, highlights } = req.body

    // Validation
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

    // Sanitize and process
    const cleanText = text.trim()
    const normalizedTone = Math.max(0, Math.min(1, tone || 0.5))
    const normalizedComplexity = Math.max(0, Math.min(1, complexity || 0.5))
    const selectedMode = ['standard', 'advanced', 'academic', 'creative'].includes(mode)
      ? mode
      : 'standard'

    // Check cache for faster response
    const cacheKey = getCacheKey(cleanText, selectedMode)
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey)
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return res.json(cached.data)
      } else {
        responseCache.delete(cacheKey)
      }
    }

    // Call humanization service
    const humanizedText = humanizationService.humanize(
      cleanText,
      selectedMode,
      normalizedTone,
      normalizedComplexity,
      vocabulary || false
    )

    // Build response
    const result: any = {
      humanizedText,
      originalText: cleanText,
      mode: selectedMode,
      parameters: {
        tone: normalizedTone,
        complexity: normalizedComplexity,
        vocabulary,
      },
      stats: {
        originalLength: cleanText.length,
        humanizedLength: humanizedText.length,
        originalWords: cleanText.split(/\s+/).length,
        humanizedWords: humanizedText.split(/\s+/).length,
        processingTime: Date.now(),
      },
    }

    if (highlights) {
      result.highlights = findImprovements(cleanText, humanizedText)
    }

    // Cache the result
    responseCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })

    // Clean old cache entries (simple cleanup)
    if (responseCache.size > 100) {
      const firstKey = responseCache.keys().next().value
      if (firstKey) {
        responseCache.delete(firstKey)
      }
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

/**
 * Find and highlight improvements made during humanization
 */
function findImprovements(original: string, humanized: string): any[] {
  const improvements: any[] = []

  // Simple comparison to highlight changed passages
  const origWords = original.split(/\s+/)
  const humanWords = humanized.split(/\s+/)

  for (let i = 0; i < Math.min(origWords.length, humanWords.length); i++) {
    if (origWords[i] !== humanWords[i]) {
      improvements.push({
        index: i,
        original: origWords[i],
        improved: humanWords[i],
        type: 'word',
      })
    }
  }

  return improvements.slice(0, 20) // Return first 20 improvements
}
