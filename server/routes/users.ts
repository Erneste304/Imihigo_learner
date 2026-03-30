import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { db } from '../data/store.js'

const router = Router()

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = db.users.find(u => u.id === req.user?.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const { password: _, ...safe } = user
  res.json(safe)
})

router.put('/me', authenticate, (req: AuthRequest, res: Response) => {
  const idx = db.users.findIndex(u => u.id === req.user?.id)
  if (idx === -1) return res.status(404).json({ error: 'User not found' })
  const { password, ...updates } = req.body
  db.users[idx] = { ...db.users[idx], ...updates }
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
