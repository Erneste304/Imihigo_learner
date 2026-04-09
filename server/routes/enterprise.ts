import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { db, saveDb } from '../data/store.js'
import { v4 as uuid } from 'uuid'

const router = Router()

// API Keys Management
router.get('/api-keys', authenticate, (req: AuthRequest, res: Response) => {
  const keys = db.apiKeys.filter(k => k.userId === req.user?.id)
  res.json(keys)
})

router.post('/api-keys', authenticate, (req: AuthRequest, res: Response) => {
  const newKey = {
    id: `ak_${uuid().slice(0, 8)}`,
    userId: req.user!.id,
    apiKey: `im_live_${uuid().replace(/-/g, '').slice(0, 16)}`,
    apiSecret: `secret_${uuid().replace(/-/g, '')}`,
    name: req.body.name || 'New API Key',
    permissions: ['READ_CREDENTIALS', 'VERIFY_USER'],
    rateLimit: 1000,
    createdAt: new Date().toISOString()
  }
  db.apiKeys.push(newKey)
  saveDb()
  res.json(newKey)
})

// Bulk Certificate Generation Simulation
router.post('/bulk-generate', authenticate, (req: AuthRequest, res: Response) => {
  const { data } = req.body // Expecting array of {name, email, skill, level}
  
  const results = data.map((item: any) => {
    // Find skill
    const skill = db.skills.find(s => s.name.toLowerCase() === item.skill.toLowerCase())
    if (!skill) return { ...item, status: 'FAILED', error: 'Skill not found' }

    // Issue dummy credential
    const credId = `cred_${uuid().slice(0, 8)}`
    db.credentials.push({
      id: credId,
      userId: 'pending_email_' + item.email, // In a real app we'd link to user ID
      skillId: skill.id,
      skillName: skill.name,
      issuedAt: new Date().toISOString(),
      txHash: `0x${uuid().replace(/-/g, '')}`,
      qrCode: `QR_${credId}_verify`,
      level: item.level || 'intermediate',
      verified: true
    })

    return { ...item, status: 'SUCCESS', credentialId: credId }
  })
  
  saveDb()

  res.json({ success: true, processed: results.length, results })
})

export default router
