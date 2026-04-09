import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { aiLearningService, learningPaths } from '../services/ai-learning.js'

const router = Router()

router.post('/path/generate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const learningPath = await aiLearningService.generateLearningPath(userId)
    res.json({ success: true, message: 'Learning path generated successfully', data: learningPath })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate learning path' })
  }
})

router.get('/recommendations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const recommendations = await aiLearningService.getRecommendations(userId)
    res.json({ success: true, data: recommendations })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get recommendations' })
  }
})

router.put('/progress', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { moduleId, score } = req.body
    const progress = await aiLearningService.updateProgress(userId, moduleId, score || 85)
    res.json({ success: true, message: 'Progress updated', data: progress })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update progress' })
  }
})

router.get('/path', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id
    const learningPath = learningPaths.find(p => p.userId === userId)
    if (!learningPath) {
      return res.status(404).json({ success: false, message: 'No learning path found' })
    }
    res.json({ success: true, data: learningPath })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get learning path' })
  }
})

router.get('/skill-gaps', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const skillGaps = await aiLearningService.analyzeSkillGaps(userId)
    res.json({ success: true, data: skillGaps })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get skill gaps' })
  }
})

export default router
