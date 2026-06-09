import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import humanizeRoutes from './routes/humanize'
import batchRoutes from './routes/batch'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/api/humanize', humanizeRoutes)
app.use('/api/batch', batchRoutes)

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'HumanWrite Pro API is running',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.path} not found`
  })
})

// Error handler middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║     🚀 HumanWrite Pro Backend Server Started        ║
║     Server running on http://localhost:${PORT}          ║
║     API endpoint: http://localhost:${PORT}/api         ║
║     Features: Humanize + Batch Processing           ║
╚═══════════════════════════════════════════════════════╝
  `)
})
