import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { db, saveDb } from '../data/store.js'
import { logActivity } from '../services/activity.js'
import { io } from '../index.js'

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

  const userSkills = user.skills.map(s => s.toLowerCase())
  const userCredentials = db.credentials.filter(c => c.userId === user.id && c.verified).map(c => c.skillName.toLowerCase())
  
  const scored = db.jobs.map(job => {
    let matched = 0
    job.requiredSkills.forEach(skill => {
      const s = skill.toLowerCase()
      // Verified credentials carry more weight
      if (userCredentials.includes(s)) matched += 1.2
      else if (userSkills.includes(s)) matched += 0.8
    })

    const matchRate = job.requiredSkills.length > 0 
      ? Math.min(Math.round((matched / job.requiredSkills.length) * 100), 100)
      : 0
      
    const applied = db.jobApplications.some(a => a.jobId === job.id && a.userId === user.id)
    const applications = db.jobApplications.filter(a => a.jobId === job.id).length

    return { ...job, matchRate, applied, applications }
  })

  res.json(scored.sort((a, b) => b.matchRate - a.matchRate))
})

router.post('/:id/apply', authenticate, (req: AuthRequest, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id)
  if (!job) return res.status(404).json({ error: 'Job not found' })
  
  const alreadyApplied = db.jobApplications.find(a => a.jobId === job.id && a.userId === req.user?.id)
  if (alreadyApplied) return res.status(400).json({ error: 'Already applied' })

  const application = {
    id: `app_${Date.now()}`,
    jobId: job.id,
    userId: req.user!.id,
    status: 'pending' as const,
    appliedAt: new Date().toISOString(),
    pitch: req.body.pitch
  }
  
  db.jobApplications.push(application)
  saveDb()

  const user = db.users.find(u => u.id === req.user!.id)
  logActivity(io, {
    type: 'JOB_APPLIED',
    message: `${user?.name} applied for ${job.title} at ${job.company}`,
    userId: req.user!.id,
    userName: user?.name || 'Unknown',
    metadata: { jobId: job.id, jobTitle: job.title }
  })

  res.json({ success: true, application })
})

export default router
