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
import videoRoutes from './routes/video.js'
import paymentRoutes from './routes/payments.js'
import adminRoutes from './routes/admin.js'
import enterpriseRoutes from './routes/enterprise.js'
import learningRoutes from './routes/learning.js'
import gamificationRoutes from './routes/gamification.js'
import mentorshipRoutes from './routes/mentorship.js'
import codingRoutes from './routes/coding.js'
import studyGroupRoutes from './routes/study-groups.js'
import certificationRoutes from './routes/certification.js'
import instructorRoutes from './routes/instructor.js'
import resumeRoutes from './routes/resume.js'
import coursesRoutes from './routes/courses.js'


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
app.use('/api/video', videoRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/courses', coursesRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/enterprise', enterpriseRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/learning', learningRoutes)
app.use('/api/gamification', gamificationRoutes)
app.use('/api/mentorship', mentorshipRoutes)
app.use('/api/coding', codingRoutes)
app.use('/api/study-groups', studyGroupRoutes)
app.use('/api/certification', certificationRoutes)
app.use('/api/instructors', instructorRoutes)

// Serve uploaded videos locally
app.use('/uploads', express.static(join(process.cwd(), 'uploads')))

const distPath = join(__dirname, '../dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.use((_req, res) => {
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
