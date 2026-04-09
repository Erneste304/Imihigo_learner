import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { db, saveDb } from '../data/store.js'

const router = Router()

// Get all mentors with user details
router.get('/mentors', authenticate, (req: AuthRequest, res: Response) => {
  const mentors = db.mentors.map(m => {
    const user = db.users.find(u => u.id === m.userId)
    return {
      ...m,
      name: user?.name,
      avatar: user?.avatar,
      location: user?.location
    }
  })
  res.json({ success: true, data: mentors })
})

// Book a session
router.post('/book', authenticate, (req: AuthRequest, res: Response) => {
  const { mentorId, topic, scheduledAt, duration = 60 } = req.body
  
  const mentor = db.mentors.find(m => m.id === mentorId)
  if (!mentor) return res.status(404).json({ error: 'Mentor not found' })

  const session = {
    id: uuid(),
    mentorId,
    menteeId: req.user!.id,
    scheduledAt,
    duration,
    status: 'pending' as const,
    topic,
    meetingLink: `https://meet.imihigo.rw/${uuid().slice(0, 8)}`,
    createdAt: new Date().toISOString()
  }

  db.mentorshipSessions.push(session)
  
  // Deduct tokens or simulate payment logic here if needed
  // user.tokens -= mentor.hourlyRate...
  
  saveDb()
  res.json({ success: true, data: session })
})

// Get my sessions (as mentor or mentee)
router.get('/my-sessions', authenticate, (req: AuthRequest, res: Response) => {
  const sessions = db.mentorshipSessions.filter(s => 
    s.menteeId === req.user!.id || s.mentorId === req.user!.id
  ).map(s => {
    const mentor = db.mentors.find(m => m.id === s.mentorId)
    const mentorUser = db.users.find(u => u.id === mentor?.userId)
    const menteeUser = db.users.find(u => u.id === s.menteeId)
    
    return {
      ...s,
      mentorName: mentorUser?.name,
      menteeName: menteeUser?.name
    }
  })
  res.json({ success: true, data: sessions })
})

export default router
