import { Router } from 'express'
import { transformText, getConfig, analyzeStudentVoice, reviewAcademicDraft, detectAILikelihood } from '../controllers/aiController'

const router = Router()

/**
 * POST /api/ai/transform
 * Primary text transformation endpoint using configured Gemini model or linguistic fallback
 */
router.post('/transform', transformText)

/**
 * POST /api/ai/detect
 * Evaluates text for AI writing patterns, burstiness, TTR, and formulaic markers
 */
router.post('/detect', detectAILikelihood)

/**
 * POST /api/ai/analyze-voice
 * Analyzes student writing sample to detect formality, vocabulary, and sentence length patterns
 */
router.post('/analyze-voice', analyzeStudentVoice)

/**
 * POST /api/ai/academic-review
 * Pure academic review returning 5-pillar Academic Quality Report
 */
router.post('/academic-review', reviewAcademicDraft)

/**
 * GET /api/ai/config
 * Returns public AI model, capabilities, and system quotas
 */
router.get('/config', getConfig)

export default router
