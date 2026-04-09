import { Router, Request, Response } from 'express'
import { db, saveDb } from '../data/store.js'
import { tutorialPosts } from '../data/community-store.js'
import jwt from 'jsonwebtoken'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'imihigo-learn-secret-2024'

const authorizeAdmin = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden: Admins only' })
    // @ts-ignore
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

router.use(authorizeAdmin)

// ── Stats ──────────────────────────────────────
router.get('/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalUsers: db.users.length,
      totalAssessmentsTaken: db.assessments.length,
      totalJobs: db.jobs.length,
      totalApplications: db.jobApplications.length,
      totalRevenue: db.internationalCertificates.filter(c => c.paymentStatus === 'paid').length * 60000,
      totalPendingVideos: 2,
      usersByRole: {
        candidates: db.users.filter(u => u.role === 'jobseeker').length,
        employers: db.users.filter(u => u.role === 'employer').length,
        admins: db.users.filter(u => u.role === 'admin').length,
        instructors: db.users.filter(u => u.role === 'instructor').length,
      },
      totalCourses: db.courses.length,
      totalInternationalCerts: db.internationalCertificates.length,
      totalCredentials: db.credentials.length,
      totalTutorials: tutorialPosts.length,
      suspendedUsers: db.users.filter(u => u.suspended).length,
      activeJobs: db.jobs.filter(j => j.active !== false).length,
      activeCourses: db.courses.filter(c => c.active !== false).length,
    }
  })
})

// ── Users ──────────────────────────────────────
router.get('/users', (_req: Request, res: Response) => {
  const safeUsers = db.users.map(({ password, ...rest }) => rest)
  res.json({ success: true, data: safeUsers })
})

router.put('/users/:userId/role', (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === req.params.userId)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  user.role = req.body.role
  saveDb()
  res.json({ success: true })
})

router.put('/users/:userId/suspend', (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === req.params.userId)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  user.suspended = !user.suspended
  saveDb()
  res.json({ success: true, suspended: user.suspended })
})

router.delete('/users/:userId', (req: Request, res: Response) => {
  const index = db.users.findIndex(u => u.id === req.params.userId)
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' })
  db.users.splice(index, 1)
  saveDb()
  res.json({ success: true })
})

// ── Courses ──────────────────────────────────────
router.get('/courses', (_req: Request, res: Response) => {
  const enriched = db.courses.map(c => {
    const instructor = db.users.find(u => u.id === c.instructorId)
    return { ...c, active: c.active !== false, instructorName: instructor?.name || 'Unknown' }
  })
  res.json({ success: true, data: enriched })
})

router.put('/courses/:id/toggle', (req: Request, res: Response) => {
  const course = db.courses.find(c => c.id === req.params.id)
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
  course.active = !(course.active !== false)
  saveDb()
  res.json({ success: true, active: course.active })
})

// ── Tutorials (Community) ──────────────────────────────────────
router.get('/tutorials', (_req: Request, res: Response) => {
  const enriched = tutorialPosts.map(t => ({ ...t, active: (t as any).active !== false }))
  res.json({ success: true, data: enriched })
})

router.put('/tutorials/:id/toggle', (req: Request, res: Response) => {
  const tutorial = tutorialPosts.find(t => t.id === req.params.id)
  if (!tutorial) return res.status(404).json({ success: false, message: 'Tutorial not found' })
  ;(tutorial as any).active = !((tutorial as any).active !== false)
  res.json({ success: true, active: (tutorial as any).active })
})

router.delete('/tutorials/:id', (req: Request, res: Response) => {
  const idx = tutorialPosts.findIndex(t => t.id === req.params.id)
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' })
  tutorialPosts.splice(idx, 1)
  res.json({ success: true })
})

// ── Jobs ──────────────────────────────────────
router.get('/jobs', (_req: Request, res: Response) => {
  const enriched = db.jobs.map(j => ({
    ...j,
    active: j.active !== false,
    applications: db.jobApplications.filter(a => a.jobId === j.id).length,
  }))
  res.json({ success: true, data: enriched })
})

router.put('/jobs/:id/toggle', (req: Request, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id)
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' })
  job.active = !(job.active !== false)
  saveDb()
  res.json({ success: true, active: job.active })
})

router.delete('/jobs/:id', (req: Request, res: Response) => {
  const idx = db.jobs.findIndex(j => j.id === req.params.id)
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' })
  db.jobs.splice(idx, 1)
  saveDb()
  res.json({ success: true })
})

// ── Skills / Assessments ──────────────────────────────────────
router.get('/skills', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.skills })
})

// ── Verifications ──────────────────────────────────────
router.get('/verifications', (_req: Request, res: Response) => {
  const verifications = [
    { id: 'v1', userName: 'John Doe', skill: 'Public Speaking', videoUrl: '/uploads/videos/demo1.mp4', status: 'PENDING', submittedAt: new Date().toISOString() },
    { id: 'v2', userName: 'Mary Jane', skill: 'Carpentry', videoUrl: '/uploads/videos/demo2.mp4', status: 'PENDING', submittedAt: new Date().toISOString() },
  ]
  res.json({ success: true, data: verifications })
})

// ── Settings ──────────────────────────────────────
router.get('/settings', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.adminSettings })
})

router.put('/settings/:key', (req: Request, res: Response) => {
  const setting = db.adminSettings.find(s => s.key === req.params.key)
  if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' })
  setting.value = req.body.value
  saveDb()
  res.json({ success: true, data: setting })
})

// ── Activities ──────────────────────────────────────
router.get('/activities', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.activities || [] })
})

export default router
