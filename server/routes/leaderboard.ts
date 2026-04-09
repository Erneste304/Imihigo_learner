import { Router, Response } from 'express'
import { gamificationService } from '../services/gamification.js'

const router = Router()

router.get('/', async (_req, res: Response) => {
  try {
    const data = await gamificationService.getLeaderboard()
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
