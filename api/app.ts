/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { initDatabase } from './db/index.js'
import authRoutes, { initSeedData } from './routes/auth.js'
import stationRoutes from './routes/stations.js'
import workOrderRoutes from './routes/workorders.js'
import gridRoutes from './routes/grid.js'
import predictionRoutes from './routes/predictions.js'
import reportRoutes from './routes/reports.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.join(__dirname, '../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// load env
dotenv.config()

const app: express.Application = express()

initDatabase()
initSeedData()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/stations', stationRoutes)
app.use('/api/workorders', workOrderRoutes)
app.use('/api/grid', gridRoutes)
app.use('/api/predictions', predictionRoutes)
app.use('/api/reports', reportRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
