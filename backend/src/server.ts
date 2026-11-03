import path from 'path'
import dotenv from 'dotenv'

// Ensure backend/.env and current working directory .env are loaded before services
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import humanizeRoutes from './routes/humanize'
import batchRoutes from './routes/batch'
import aiRoutes from './routes/ai'
import historyRoutes from './routes/history'
import { detectAILikelihood } from './controllers/aiController'
import { errorHandler } from './middleware/errorHandler'
import { geminiService } from './services/geminiService'
import { databaseService } from './services/databaseService'
import { sessionSecurityService } from './services/sessionSecurityService'
import crypto from 'crypto'

const app: Express = express()
const PORT = process.env.PORT || 5000

// Security headers middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

// CORS and body parser
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Token']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Student Authentication & Identity Endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, fullName } = req.body
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' })
  }
  const userHash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex')
  const userId = `${userHash.substring(0, 8)}-${userHash.substring(8, 12)}-4${userHash.substring(13, 16)}-a${userHash.substring(17, 20)}-${userHash.substring(20, 32)}`
  const token = sessionSecurityService.generateUserToken(userId)
  return res.json({
    success: true,
    user: {
      id: userId,
      email: email.trim(),
      fullName: (typeof fullName === 'string' && fullName.trim()) || email.split('@')[0],
      tier: 'pro',
      monthlyWordLimit: 100000
    },
    token
  })
})

// Routes
app.post('/api/detect', detectAILikelihood)
app.use('/api/ai', aiRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/humanize', humanizeRoutes)
app.use('/api/batch', batchRoutes)


// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const gemini = geminiService.getStatus()
  const db = databaseService.getStatus()

  res.json({
    status: 'ok',
    brand: 'Humanora AI',
    tagline: 'Write Naturally. Express Authentically.',
    message: 'Humanora AI API is running',
    timestamp: new Date().toISOString(),
    services: {
      ai: {
        provider: gemini.provider,
        configured: gemini.isConfigured,
        model: gemini.model
      },
      database: {
        provider: db.provider,
        configured: db.isConfigured,
        tableVerified: db.tableVerified,
        schemaStatus: db.schemaStatus,
        message: db.message
      }
    }
  })
})

// Static file serving for full-stack deployments
const distPath = path.resolve(__dirname, '../../frontend/dist')
const docsPath = path.resolve(__dirname, '../../docs')
const staticFolder = require('fs').existsSync(distPath) ? distPath : docsPath
if (require('fs').existsSync(staticFolder)) {
  app.use(express.static(staticFolder))
}

// 404 handler (API-scoped or fallback to index.html for SPA routes)
app.use((req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.path} not found`
    })
  }
  const indexPath = path.join(staticFolder, 'index.html')
  if (require('fs').existsSync(indexPath)) {
    return res.sendFile(indexPath)
  }
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`
  })
})

// Error handler middleware
app.use(errorHandler)

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║     🚀 Humanora AI Backend Server Started             ║
║     Server running on http://localhost:${PORT}          ║
║     API endpoint: http://localhost:${PORT}/api         ║
║     Tagline: Write Naturally. Express Authentically.   ║
╚═══════════════════════════════════════════════════════╝
    `)
  })
}

export default app
