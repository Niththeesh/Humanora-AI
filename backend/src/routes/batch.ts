import { Router, Request, Response } from 'express'
import { humanizationService } from '../services/serviceFactory'

const router = Router()

interface BatchRequest {
  documents: Array<{
    id: string
    text: string
    mode: string
    tone: number
    complexity: number
    vocabulary: boolean
  }>
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { documents } = req.body as BatchRequest

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        error: 'Invalid batch request',
        message: 'Documents array is required and must not be empty',
      })
    }

    if (documents.length > 10) {
      return res.status(400).json({
        error: 'Too many documents',
        message: 'Maximum 10 documents per batch request',
      })
    }

    // Process all documents
    const results = documents.map(doc => {
      try {
        const cleanText = doc.text.trim()
        if (!cleanText) {
          return {
            id: doc.id,
            error: 'Empty text provided',
            success: false,
          }
        }

        const normalizedTone = Math.max(0, Math.min(1, doc.tone || 0.5))
        const normalizedComplexity = Math.max(0, Math.min(1, doc.complexity || 0.5))
        const mode = ['standard', 'advanced', 'academic', 'creative'].includes(doc.mode)
          ? doc.mode
          : 'standard'

        const humanizedText = humanizationService.humanize(
          cleanText,
          mode,
          normalizedTone,
          normalizedComplexity,
          doc.vocabulary || false
        )

        return {
          id: doc.id,
          humanizedText,
          success: true,
          stats: {
            originalLength: cleanText.length,
            humanizedLength: humanizedText.length,
            originalWords: cleanText.split(/\s+/).length,
            humanizedWords: humanizedText.split(/\s+/).length,
          },
        }
      } catch (error) {
        return {
          id: doc.id,
          error: 'Processing failed',
          success: false,
        }
      }
    })

    res.json({
      total: documents.length,
      successful: results.filter(r => r.success).length,
      results,
    })
  } catch (error) {
    console.error('Batch processing error:', error)
    res.status(500).json({
      error: 'Batch processing failed',
      message: 'An error occurred while processing the batch',
    })
  }
})

export default router
