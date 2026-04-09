import { Router, Request, Response } from 'express'
import { db, saveDb } from '../data/store.js'
import jwt from 'jsonwebtoken'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'imihigo-learn-secret-2024'

// Real Admin Authorization Middleware
const authorizeAdmin = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })
  
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' })
    }
    // @ts-ignore
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

router.use(authorizeAdmin)

router.get('/stats', (req: Request, res: Response) => {
  const stats = {
    totalUsers: db.users.length,
    totalAssessments: db.skills.reduce((sum, skill) => sum + skill.questionsCount, 0),
    totalAssessmentsTaken: db.assessments.length,
    totalJobs: db.jobs.length,
    totalApplications: db.jobApplications.length,
    totalRevenue: db.internationalCertificates.filter(c => c.paymentStatus === 'paid').length * 60000, // RWF
    platformRevenue: db.internationalCertificates.filter(c => c.paymentStatus === 'paid').length * 18000,
    usersByRole: {
      candidates: db.users.filter(u => u.role === 'jobseeker').length,
      employers: db.users.filter(u => u.role === 'employer').length,
      admins: db.users.filter(u => u.role === 'admin').length,
      instructors: db.users.filter(u => u.role === 'instructor').length
    },
    totalCourses: db.courses.length,
    totalInternationalCerts: db.internationalCertificates.length,
    totalCredentials: db.credentials.length,
    totalMentorSessions: db.mentorshipSessions.length,
    recentCertificates: db.internationalCertificates.slice(-5),
    monetization: {
      platformFee: db.adminSettings.find(s => s.key === 'platform_fee')?.value,
      globalCertFee: db.adminSettings.find(s => s.key === 'global_certificate_fee')?.value,
    }
  }
  
  res.json({ success: true, data: stats })
})

router.get('/users', (req: Request, res: Response) => {
  const safeUsers = db.users.map(u => {
    const { password, ...rest } = u
    return rest
  })
  res.json({ success: true, data: safeUsers })
})

router.put('/users/:userId/role', (req: Request, res: Response) => {
  const { role } = req.body
  const user = db.users.find(u => u.id === req.params.userId)
  
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  
  user.role = role
  saveDb()
  res.json({ success: true, message: 'Role updated', data: user })
})

router.delete('/users/:userId', (req: Request, res: Response) => {
  const index = db.users.findIndex(u => u.id === req.params.userId)
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' })
  
  db.users.splice(index, 1)
  res.json({ success: true, message: 'User deleted' })
})

router.get('/verifications', (req: Request, res: Response) => {
  // Mocking a list of pending video verifications
  const verifications = [
    { id: 'v1', userName: 'John Doe', skill: 'Public Speaking', videoUrl: '/uploads/videos/demo1.mp4', status: 'PENDING', submittedAt: new Date().toISOString() },
    { id: 'v2', userName: 'Mary Jane', skill: 'Carpentry', videoUrl: '/uploads/videos/demo2.mp4', status: 'PENDING', submittedAt: new Date().toISOString() },
  ]
  res.json({ success: true, data: verifications })
})

router.get('/settings', (req: Request, res: Response) => {
  res.json({ success: true, data: db.adminSettings })
})

router.put('/settings/:key', (req: Request, res: Response) => {
  const { value } = req.body
  const setting = db.adminSettings.find(s => s.key === req.params.key)
  if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' })
  
  setting.value = value
  saveDb()
  res.json({ success: true, data: setting })
})

router.get('/activities', (req: Request, res: Response) => {
  res.json({ success: true, data: db.activities || [] })
})

export default router
