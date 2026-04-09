import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { db, saveDb } from '../data/store.js'

const router = Router()

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = db.users.find(u => u.id === req.user?.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const { password: _, ...safe } = user
  res.json(safe)
})

function calculateTrustScore(user: any) {
  let score = 10 // Baseline
  if (user.name && user.name.length > 5) score += 10
  if (user.bio && user.bio.length > 20) score += 10
  if (user.education && user.education.length > 0) score += Math.min(user.education.length * 10, 20)
  if (user.experience && user.experience.length > 0) score += Math.min(user.experience.length * 10, 30)
  
  const creds = db.credentials.filter(c => c.userId === user.id && c.verified).length
  score += Math.min(creds * 10, 30)
  
  return Math.min(score, 100)
}

router.put('/me', authenticate, (req: AuthRequest, res: Response) => {
  const idx = db.users.findIndex(u => u.id === req.user?.id)
  if (idx === -1) return res.status(404).json({ error: 'User not found' })
  
  const { password, ...updates } = req.body
  db.users[idx] = { ...db.users[idx], ...updates }
  
  // Recalculate trust score
  db.users[idx].trustScore = calculateTrustScore(db.users[idx])
  saveDb()
  
  const { password: _, ...safe } = db.users[idx]
  res.json(safe)
})


router.get('/me/credentials', authenticate, (req: AuthRequest, res: Response) => {
  const creds = db.credentials.filter(c => c.userId === req.user?.id)
  res.json(creds)
})

router.get('/me/assessments', authenticate, (req: AuthRequest, res: Response) => {
  const results = db.assessments.filter(a => a.userId === req.user?.id)
  res.json(results)
})

export default router
