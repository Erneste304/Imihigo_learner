import { Router, Request, Response } from 'express'
import { db, saveDb } from '../data/store.js'
import { tutorialPosts } from '../data/community-store.js'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'

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

router.post('/tutorials', (req: Request, res: Response) => {
  const newTutorial = {
    id: `t_${Date.now()}`,
    authorId: 'admin',
    authorName: 'Administrator',
    title: req.body.title,
    description: req.body.description,
    category: req.body.category || 'General',
    language: req.body.language || 'en',
    likes: 0,
    views: 0,
    duration: '0m',
    level: req.body.level || 'beginner',
    tags: [],
    createdAt: new Date().toISOString(),
    thumbnailColor: '#6366f1',
    videoUrl: req.body.videoUrl || '',
    active: true
  }
  tutorialPosts.unshift(newTutorial as any)
  res.json({ success: true, data: newTutorial })
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

router.post('/skills', (req: Request, res: Response) => {
  const newSkill = {
    id: `s_${Date.now()}`,
    name: req.body.name,
    category: req.body.category || 'General',
    level: req.body.level || 'beginner',
    description: req.body.description,
    icon: req.body.icon || '📜',
    questionsCount: Number(req.body.questionsCount) || 5,
  }
  db.skills.push(newSkill as any)
  saveDb()
  res.json({ success: true, data: newSkill })
})

router.delete('/skills/:id', (req: Request, res: Response) => {
  const idx = db.skills.findIndex(s => s.id === req.params.id)
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' })
  db.skills.splice(idx, 1)
  saveDb()
  res.json({ success: true })
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

// ── Admin CRUD: Courses ──────────────────────────────────────
router.post('/courses', (req: Request, res: Response) => {
  const course = {
    id: `co_${Date.now()}`,
    title: req.body.title,
    description: req.body.description,
    price: Number(req.body.price) || 0,
    certificateFee: Number(req.body.certificateFee) || 0,
    category: req.body.category || 'General',
    level: req.body.level || 'beginner',
    tags: req.body.tags || [],
    instructorId: req.body.instructorId || 'admin',
    enrolledCount: 0,
    lessons: [],
    createdAt: new Date().toISOString(),
    status: 'approved',
    active: true,
    platformFeePercent: 0.01,
  }
  db.courses.push(course as any)
  saveDb()
  res.json({ success: true, data: course })
})

router.put('/courses/:id', (req: Request, res: Response) => {
  const course = db.courses.find(c => c.id === req.params.id)
  if (!course) return res.status(404).json({ success: false, message: 'Not found' })
  Object.assign(course, req.body)
  saveDb()
  res.json({ success: true, data: course })
})

router.delete('/courses/:id', (req: Request, res: Response) => {
  const idx = db.courses.findIndex(c => c.id === req.params.id)
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' })
  db.courses.splice(idx, 1)
  saveDb()
  res.json({ success: true })
})

// ── Admin CRUD: Lessons ──────────────────────────────────────
router.post('/courses/:id/lessons', (req: Request, res: Response) => {
  const course = db.courses.find(c => c.id === req.params.id)
  if (!course) return res.status(404).json({ success: false, message: 'Not found' })
  if (!course.lessons) course.lessons = []
  const lesson = {
    id: `l_${Date.now()}`,
    courseId: course.id,
    title: req.body.title,
    type: req.body.type || 'note',
    content: req.body.content || '',
    videoUrl: req.body.videoUrl || '',
    order: course.lessons.length + 1,
    duration: Number(req.body.duration) || 0,
    createdAt: new Date().toISOString(),
  }
  course.lessons.push(lesson)
  saveDb()
  res.json({ success: true, data: lesson })
})

router.put('/courses/:id/lessons/:lessonId', (req: Request, res: Response) => {
  const course = db.courses.find(c => c.id === req.params.id)
  if (!course || !course.lessons) return res.status(404).json({ success: false, message: 'Not found' })
  const lesson = course.lessons.find(l => l.id === req.params.lessonId)
  if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' })
  Object.assign(lesson, req.body)
  saveDb()
  res.json({ success: true, data: lesson })
})

router.delete('/courses/:id/lessons/:lessonId', (req: Request, res: Response) => {
  const course = db.courses.find(c => c.id === req.params.id)
  if (!course || !course.lessons) return res.status(404).json({ success: false, message: 'Not found' })
  course.lessons = course.lessons.filter(l => l.id !== req.params.lessonId)
  saveDb()
  res.json({ success: true })
})

// ── Admin CRUD: Jobs ──────────────────────────────────────
router.post('/jobs', (req: Request, res: Response) => {
  const job = {
    id: `j_${Date.now()}`,
    title: req.body.title,
    company: req.body.company,
    location: req.body.location || 'Kigali, Rwanda',
    type: req.body.type || 'full-time',
    salary: req.body.salary || '',
    description: req.body.description,
    requiredSkills: req.body.requiredSkills || [],
    remote: req.body.remote === true || req.body.remote === 'true',
    postedAt: new Date().toISOString(),
    employerId: 'admin',
    active: true,
    status: 'approved',
  }
  db.jobs.push(job as any)
  saveDb()
  res.json({ success: true, data: job })
})

router.put('/jobs/:id', (req: Request, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id)
  if (!job) return res.status(404).json({ success: false, message: 'Not found' })
  Object.assign(job, req.body)
  saveDb()
  res.json({ success: true, data: job })
})

// ── Instructor Approval Requests ──────────────────────────────────────
router.get('/instructor-requests', (_req: Request, res: Response) => {
  if (!(db as any).instructorRequests) (db as any).instructorRequests = []
  const requests = (db as any).instructorRequests.map((r: any) => {
    const user = db.users.find(u => u.id === r.userId)
    return { ...r, userRole: user?.role, userSuspended: user?.suspended }
  })
  res.json({ success: true, data: requests })
})

router.post('/instructor-requests', (req: Request, res: Response) => {
  if (!(db as any).instructorRequests) (db as any).instructorRequests = []
  
  const newReq = {
    id: `ir_${Date.now()}`,
    userId: `u_${Date.now()}`,
    name: req.body.name,
    email: req.body.email,
    qualification: req.body.qualification,
    institution: req.body.institution,
    specialties: req.body.specialties ? req.body.specialties.split(',').map((s:string) => s.trim()) : [],
    yearsExperience: Number(req.body.yearsExperience) || 0,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  }
  
  ;(db as any).instructorRequests.unshift(newReq)
  saveDb()
  res.json({ success: true, data: newReq })
})

router.put('/instructor-requests/:id/approve', (req: Request, res: Response) => {
  if (!(db as any).instructorRequests) (db as any).instructorRequests = []
  const request = (db as any).instructorRequests.find((r: any) => r.id === req.params.id)
  if (!request) return res.status(404).json({ success: false, message: 'Not found' })

  request.status = 'approved'
  request.reviewedAt = new Date().toISOString()
  request.reviewNote = req.body.note || 'Approved by admin.'

  const user = db.users.find(u => u.id === request.userId)
  if (user) {
    user.role = 'instructor'
    user.verified = true
  }
  saveDb()
  res.json({ success: true })
})

router.put('/instructor-requests/:id/reject', (req: Request, res: Response) => {
  if (!(db as any).instructorRequests) (db as any).instructorRequests = []
  const request = (db as any).instructorRequests.find((r: any) => r.id === req.params.id)
  if (!request) return res.status(404).json({ success: false, message: 'Not found' })

  request.status = 'rejected'
  request.reviewedAt = new Date().toISOString()
  request.reviewNote = req.body.note || 'Not approved at this time.'
  saveDb()
  res.json({ success: true })
})

// ── Course Approval Queue ──────────────────────────────────────
router.get('/course-approvals', (_req: Request, res: Response) => {
  const pending = db.courses
    .filter(c => c.status === 'pending_approval')
    .map(c => {
      const instructor = db.users.find(u => u.id === c.instructorId)
      return { ...c, instructorName: instructor?.name || 'Unknown', instructorEmail: instructor?.email }
    })
  res.json({ success: true, data: pending })
})

router.post('/course-approvals', (req: Request, res: Response) => {
  const newCourse = {
    id: `co_${Date.now()}`,
    title: req.body.title,
    description: req.body.description,
    price: Number(req.body.price) || 0,
    category: req.body.category || 'General',
    level: req.body.level || 'beginner',
    instructorId: `u_${Date.now()}`, 
    instructorName: req.body.instructorName,
    enrolledCount: 0,
    lessons: [],
    createdAt: new Date().toISOString(),
    status: 'pending_approval',
    active: false,
    certificateFee: 0,
    platformFeePercent: 0.01
  }
  db.courses.unshift(newCourse as any)
  saveDb()
  res.json({ success: true, data: newCourse })
})

router.put('/course-approvals/:id/approve', (req: Request, res: Response) => {
  const course = db.courses.find(c => c.id === req.params.id)
  if (!course) return res.status(404).json({ success: false, message: 'Not found' })
  course.status = 'approved'
  course.active = true
  course.approvalNote = req.body.note || 'Approved by admin.'
  saveDb()
  res.json({ success: true })
})

router.put('/course-approvals/:id/reject', (req: Request, res: Response) => {
  const course = db.courses.find(c => c.id === req.params.id)
  if (!course) return res.status(404).json({ success: false, message: 'Not found' })
  course.status = 'rejected'
  course.active = false
  course.approvalNote = req.body.note || 'Rejected. Please revise and resubmit.'
  saveDb()
  res.json({ success: true })
})

// ── Fix Verifications (approve/reject) ──────────────────────────────────────
router.put('/verifications/:id/approve', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Verification approved.' })
})

router.put('/verifications/:id/reject', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Verification rejected.' })
})

// ── Terms & Conditions Compliance ──────────────────────────────────────
router.get('/terms-compliance', (_req: Request, res: Response) => {
  const data = db.users.map(({ password, ...u }) => ({
    ...u,
    tcAccepted: (u as any).tcAccepted === true,
    tcAcceptedAt: (u as any).tcAcceptedAt || null,
  }))
  const stats = {
    total: data.length,
    accepted: data.filter(u => u.tcAccepted).length,
    pending: data.filter(u => !u.tcAccepted).length,
    suspended: data.filter(u => u.suspended).length,
  }
  res.json({ success: true, data, stats })
})

router.put('/users/:userId/tc-deactivate', (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === req.params.userId)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  user.suspended = true
  saveDb()
  res.json({ success: true, message: 'User deactivated for T&C non-compliance' })
})

router.put('/users/:userId/tc-activate', (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === req.params.userId)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  user.suspended = false
  saveDb()
  res.json({ success: true, message: 'User reactivated' })
})

router.put('/users/:userId/tc-accept', (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === req.params.userId)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  ;(user as any).tcAccepted = true
  ;(user as any).tcAcceptedAt = new Date().toISOString()
  saveDb()
  res.json({ success: true, message: 'T&C marked as accepted for user' })
})

export default router
