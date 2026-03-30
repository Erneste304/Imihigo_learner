import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import authRoutes from './routes/auth.js'
import skillRoutes from './routes/skills.js'
import jobRoutes from './routes/jobs.js'
import userRoutes from './routes/users.js'
import assessmentRoutes from './routes/assessments.js'
import communityRoutes from './routes/community.js'
import leaderboardRoutes from './routes/leaderboard.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' },
})

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: '*' }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', platform: 'Imihigo Learn', version: '1.0.0' })
})

app.use('/api/auth', authRoutes)
app.use('/api/skills', skillRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)
app.use('/api/assessments', assessmentRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/leaderboard', leaderboardRoutes)

const distPath = join(__dirname, '../dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('join-assessment', (assessmentId: string) => {
    socket.join(`assessment-${assessmentId}`)
  })

  socket.on('assessment-progress', (data: { assessmentId: string; progress: number }) => {
    io.to(`assessment-${data.assessmentId}`).emit('progress-update', data)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Imihigo Learn API running on http://localhost:${PORT}`)
})

export { io }
