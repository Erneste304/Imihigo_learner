import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { db } from '../data/store.js'

const router = Router()

router.post('/start', authenticate, (req: AuthRequest, res: Response) => {
  const { skillId } = req.body
  const skill = db.skills.find(s => s.id === skillId)
  if (!skill) return res.status(404).json({ error: 'Skill not found' })

  const existing = db.assessments.find(a => a.userId === req.user!.id && a.skillId === skillId && a.status === 'in-progress')
  if (existing) return res.json(existing)

  const assessment = {
    id: uuid(),
    userId: req.user!.id,
    skillId,
    status: 'in-progress' as const,
    score: 0,
    passed: false,
    startedAt: new Date().toISOString(),
  }
  db.assessments.push(assessment)
  res.status(201).json(assessment)
})

router.post('/:id/submit', authenticate, (req: AuthRequest, res: Response) => {
  const { answers } = req.body
  const assessment = db.assessments.find(a => a.id === req.params.id && a.userId === req.user!.id)
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' })

  const totalAnswers = Object.keys(answers || {}).length
  const correct = Math.floor(totalAnswers * (0.5 + Math.random() * 0.5))
  const score = totalAnswers > 0 ? Math.round((correct / totalAnswers) * 100) : Math.floor(60 + Math.random() * 40)
  const passed = score >= 70

  assessment.status = passed ? 'completed' : 'failed'
  assessment.score = score
  assessment.passed = passed
  assessment.completedAt = new Date().toISOString()

  if (passed) {
    const skill = db.skills.find(s => s.id === assessment.skillId)
    const credential = {
      id: uuid(),
      userId: assessment.userId,
      skillId: assessment.skillId,
      skillName: skill?.name || 'Unknown',
      issuedAt: new Date().toISOString(),
      txHash: '0x' + uuid().replace(/-/g, ''),
      qrCode: `QR_${uuid().slice(0, 8)}_verify`,
      level: skill?.level || 'beginner',
      verified: true,
    }
    db.credentials.push(credential)
    assessment.credentialId = credential.id

    const user = db.users.find(u => u.id === assessment.userId)
    if (user) {
      user.tokens += 25
      if (!user.skills.includes(skill?.name || '')) user.skills.push(skill?.name || '')
    }
  }

  res.json({ assessment, passed, score })
})

export default router
