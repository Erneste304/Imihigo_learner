import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { db, saveDb } from '../data/store.js'
import { issueCredentialOnChain } from '../services/blockchain.js'
import { sendAssessmentResultEmail } from '../services/email.js'
import { sendSMS } from '../services/sms.js'
import { logActivity } from '../services/activity.js'
import { io } from '../index.js'
import { gamificationService } from '../services/gamification.js'

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
  saveDb()
  res.status(201).json(assessment)
})

router.post('/:id/submit', authenticate, async (req: AuthRequest, res: Response) => {
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

  let blockchainTx = '0x' + uuid().replace(/-/g, '')
  if (passed) {
    // Attempt real mock transaction
    const blockchainRes = await issueCredentialOnChain(assessment.userId, assessment.skillId, score)
    if (blockchainRes.success && blockchainRes.txHash) {
      blockchainTx = blockchainRes.txHash
    }

    const skill = db.skills.find(s => s.id === assessment.skillId)
    const credential = {
      id: uuid(),
      userId: assessment.userId,
      skillId: assessment.skillId,
      skillName: skill?.name || 'Unknown',
      issuedAt: new Date().toISOString(),
      txHash: blockchainTx,
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

      // Gamification Hooks
      gamificationService.addXP(user.id, 50, 'Assessment Passed')
      if (score === 100) gamificationService.awardBadge(user.id, 'perfect_score')
      
      const totalPassed = db.assessments.filter(a => a.userId === user.id && a.passed).length
      if (totalPassed === 1) gamificationService.awardBadge(user.id, 'first_assessment')
      if (totalPassed === 10) gamificationService.awardBadge(user.id, 'assessment_master')
    }
  }

  // Trigger Notifications (Async)
  const user = db.users.find(u => u.id === assessment.userId)
  const skill = db.skills.find(s => s.id === assessment.skillId)
  if (user) {
    sendAssessmentResultEmail(user.email, user.name, skill?.name || 'Skill', score, passed)
    sendSMS(user.email, `Imihigo Learn: You scored ${score}% on ${skill?.name}. ${passed ? 'Blockchain credential issued!' : 'Try again soon.'}`) // Mocking phone with email for SMS demo
  }

  saveDb()

  // Log activity for the live admin feed
  const actUser = db.users.find(u => u.id === assessment.userId)
  const actSkill = db.skills.find(s => s.id === assessment.skillId)
  logActivity(io, {
    type: passed ? 'CERTIFICATE_ISSUED' : 'ASSESSMENT_COMPLETED',
    message: passed
      ? `${actUser?.name} earned a blockchain credential for ${actSkill?.name}`
      : `${actUser?.name} completed the ${actSkill?.name} assessment with ${score}%`,
    userId: assessment.userId,
    userName: actUser?.name || 'Unknown',
    metadata: { score, skillId: assessment.skillId }
  })

  res.json({ assessment, passed, score, txHash: blockchainTx })
})

export default router
