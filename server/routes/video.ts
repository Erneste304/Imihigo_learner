import { Router, Response } from 'express'
import multer from 'multer'
import { v4 as uuid } from 'uuid'
import { authenticate, AuthRequest } from '../middleware/auth.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

// In-memory simulation of video processing states
const videoJobs = new Map<string, any>()

router.post('/upload', authenticate, upload.single('video'), (req: AuthRequest, res: Response) => {
  const videoId = `vid_${uuid().slice(0, 8)}`
  
  videoJobs.set(videoId, {
    id: videoId,
    status: 'PROCESSING',
    userId: req.user?.id,
    createdAt: new Date().toISOString()
  })

  // Simulate AI Analysis logic
  setTimeout(() => {
    const job = videoJobs.get(videoId)
    if (job) {
      videoJobs.set(videoId, {
        ...job,
        status: 'COMPLETED',
        aiAnalysis: {
          confidence: Math.floor(Math.random() * 15) + 82, // 82-97
          clarity: Math.floor(Math.random() * 10) + 85,    // 85-95
          relevance: Math.floor(Math.random() * 10) + 90,  // 90-100
          feedback: "Great eye contact and technical precision. The candidate demonstrated the 'Component Composition' skill accurately with clear explanation in Kinyarwanda/English mix."
        }
      })
    }
  }, 8000) // 8 second simulation

  res.json({ success: true, data: { videoId } })
})

router.get('/status/:id', (req, res: Response) => {
  const job = videoJobs.get(req.params.id)
  if (!job) return res.status(404).json({ error: 'Video Job not found' })
  res.json({ success: true, data: job })
})

export default router
