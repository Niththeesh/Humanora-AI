import { Router } from 'express'
import { humanizeText } from '../controllers/humanizeController'

const router = Router()

/**
 * POST /api/humanize
 * Main humanization endpoint
 */
router.post('/', humanizeText)

export default router
