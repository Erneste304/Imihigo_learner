import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { db } from '../data/store.js'

const router = Router()

router.get('/', (_req, res: Response) => {
  const { type, skill, remote } = _req.query
  let jobs = [...db.jobs]
  if (type) jobs = jobs.filter(j => j.type === type)
  if (skill) jobs = jobs.filter(j => j.requiredSkills.some(s => s.toLowerCase().includes((skill as string).toLowerCase())))
  if (remote === 'true') jobs = jobs.filter(j => j.remote)
  res.json(jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()))
})

router.get('/:id', (req, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id)
  if (!job) return res.status(404).json({ error: 'Job not found' })
  res.json(job)
})

router.get('/match/:userId', authenticate, (req: AuthRequest, res: Response) => {
  const user = db.users.find(u => u.id === req.params.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })

  const userCredentials = db.credentials.filter(c => c.userId === user.id).map(c => c.skillName)
  const scored = db.jobs.map(job => {
    const matched = job.requiredSkills.filter(s => userCredentials.includes(s)).length
    const matchRate = job.requiredSkills.length > 0 ? Math.round((matched / job.requiredSkills.length) * 100) : 0
    return { ...job, matchRate, matched }
  })

  res.json(scored.sort((a, b) => b.matchRate - a.matchRate))
})

export default router
