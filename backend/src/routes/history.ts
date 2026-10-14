import { Router } from 'express'
import { getHistory, getHistoryItem, deleteHistoryItem } from '../controllers/aiController'

const router = Router()

/**
 * GET /api/history
 * List user or session transformations
 */
router.get('/', getHistory)

/**
 * GET /api/history/:id
 * Retrieve a specific transformed record
 */
router.get('/:id', getHistoryItem)

/**
 * DELETE /api/history/:id
 * Remove a specific transformed record
 */
router.delete('/:id', deleteHistoryItem)

export default router
