import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { codingService } from '../services/coding.js'

const router = Router()

// List all coding challenges
router.get('/challenges', authenticate, async (req: AuthRequest, res: Response) => {
  const challenges = await codingService.getChallenges()
  res.json({ success: true, data: challenges })
})

// Get specific challenge detail
router.get('/challenges/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const challenge = await codingService.getChallengeById(req.params.id)
    res.json({ success: true, data: challenge })
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message })
  }
})

// Submit code for evaluation
router.post('/evaluate', authenticate, async (req: AuthRequest, res: Response) => {
  const { challengeId, code } = req.body
  try {
    const result = await codingService.evaluateSubmission(req.user!.id, challengeId, code)
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Get user's submission history
router.get('/my-submissions', authenticate, async (req: AuthRequest, res: Response) => {
  const submissions = await codingService.getUserSubmissions(req.user!.id)
  res.json({ success: true, data: submissions })
})

// AI Voice Tutor - Kinyarwanda Code Advice
router.post('/tutor-voice-help', authenticate, async (req: AuthRequest, res: Response) => {
  const { challengeId, question } = req.body
  try {
    const advice = await codingService.getVoiceAdvice(challengeId, question)
    res.json({ success: true, data: advice })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
