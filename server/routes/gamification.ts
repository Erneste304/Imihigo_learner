import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { gamificationService } from '../services/gamification.js'

const router = Router()

router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const dashboard = await gamificationService.getDashboard(userId)
    res.json({ success: true, data: dashboard })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get gamification profile' })
  }
})

router.post('/claim-daily', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const reward = await gamificationService.claimDailyReward(userId)
    res.json({ success: true, message: 'Daily reward claimed!', data: reward })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to claim reward' })
  }
})

router.get('/leaderboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 50 } = req.query
    const leaderboard = await gamificationService.getLeaderboard(parseInt(limit as string))
    res.json({ success: true, data: leaderboard })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get leaderboard' })
  }
})

router.post('/add-xp', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { amount, source } = req.body
    const result = await gamificationService.addXP(userId, amount, source)
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add XP' })
  }
})

export default router
