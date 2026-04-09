import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { db, saveDb } from '../data/store.js'
import { v4 as uuid } from 'uuid'

const router = Router()

const authorizeInstructor = (req: AuthRequest, res: Response, next: Function) => {
  if (req.user?.role !== 'instructor' && req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Instructor access required' })
  }
  next()
}

// ── Approval request ──────────────────────────────────────
router.post('/request-approval', authenticate, (req: AuthRequest, res: Response) => {
  if (!(db as any).instructorRequests) (db as any).instructorRequests = []
  const existing = (db as any).instructorRequests.find((r: any) => r.userId === req.user!.id && r.status === 'pending')
  if (existing) return res.status(409).json({ success: false, message: 'You already have a pending approval request.' })

  const { qualification, institution, specialties, bio, portfolioUrl, yearsExperience } = req.body
  const request = {
    id: uuid(),
    userId: req.user!.id,
    name: req.user!.name || '',
    email: req.user!.email,
    qualification,
    institution,
    specialties: Array.isArray(specialties) ? specialties : specialties?.split(',').map((s: string) => s.trim()) || [],
    bio,
    portfolioUrl: portfolioUrl || '',
    yearsExperience: Number(yearsExperience) || 0,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  }

  ;(db as any).instructorRequests.push(request)
  const user = db.users.find(u => u.id === req.user!.id)
  if (user) user.role = 'instructor'
  saveDb()
  res.json({ success: true, data: request })
})

router.get('/approval-status', authenticate, (req: AuthRequest, res: Response) => {
  if (!(db as any).instructorRequests) (db as any).instructorRequests = []
  const requests = (db as any).instructorRequests.filter((r: any) => r.userId === req.user!.id)
  const latest = requests.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0]
  res.json({ success: true, data: latest || null })
})

// ── Courses ──────────────────────────────────────
router.get('/my-courses', authenticate, authorizeInstructor, (req: AuthRequest, res: Response) => {
  const myCourses = db.courses.filter(c => c.instructorId === req.user!.id || req.user!.role === 'admin')
  res.json({ success: true, data: myCourses })
})

router.post('/courses', authenticate, authorizeInstructor, (req: AuthRequest, res: Response) => {
  if (!(db as any).instructorRequests) (db as any).instructorRequests = []
  const approved = (db as any).instructorRequests.find((r: any) => r.userId === req.user!.id && r.status === 'approved')
  const isAdmin = req.user!.role === 'admin'

  const newCourse = {
    id: uuid(),
    title: req.body.title,
    description: req.body.description,
    price: Number(req.body.price) || 0,
    certificateFee: Number(req.body.certificateFee) || 0,
    category: req.body.category || 'General',
    level: req.body.level || 'beginner',
    tags: req.body.tags || [],
    instructorId: req.user!.id,
    enrolledCount: 0,
    lessons: [],
    createdAt: new Date().toISOString(),
    status: isAdmin ? 'approved' : (approved ? 'pending_approval' : 'pending_approval'),
    active: isAdmin,
    platformFeePercent: 0.01,
  }
  db.courses.push(newCourse as any)
  saveDb()
  res.json({ success: true, data: newCourse })
})

router.put('/courses/:id', authenticate, authorizeInstructor, (req: AuthRequest, res: Response) => {
  const course = db.courses.find(c => c.id === req.params.id)
  if (!course) return res.status(404).json({ success: false, message: 'Not found' })
  if (course.instructorId !== req.user!.id && req.user!.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' })
  Object.assign(course, req.body)
  saveDb()
  res.json({ success: true, data: course })
})

router.delete('/courses/:id', authenticate, authorizeInstructor, (req: AuthRequest, res: Response) => {
  const idx = db.courses.findIndex(c => c.id === req.params.id)
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' })
  if (db.courses[idx].instructorId !== req.user!.id && req.user!.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' })
  db.courses.splice(idx, 1)
  saveDb()
  res.json({ success: true })
})

// ── Lessons ──────────────────────────────────────
router.post('/courses/:id/lessons', authenticate, authorizeInstructor, (req: AuthRequest, res: Response) => {
  const course = db.courses.find(c => c.id === req.params.id)
  if (!course) return res.status(404).json({ success: false, message: 'Not found' })
  if (course.instructorId !== req.user!.id && req.user!.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' })

  if (!course.lessons) course.lessons = []
  const lesson = {
    id: uuid(),
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

router.put('/courses/:id/lessons/:lessonId', authenticate, authorizeInstructor, (req: AuthRequest, res: Response) => {
  const course = db.courses.find(c => c.id === req.params.id)
  if (!course) return res.status(404).json({ success: false, message: 'Not found' })
  if (!course.lessons) course.lessons = []
  const lesson = course.lessons.find(l => l.id === req.params.lessonId)
  if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' })
  Object.assign(lesson, req.body)
  saveDb()
  res.json({ success: true, data: lesson })
})

router.delete('/courses/:id/lessons/:lessonId', authenticate, authorizeInstructor, (req: AuthRequest, res: Response) => {
  const course = db.courses.find(c => c.id === req.params.id)
  if (!course || !course.lessons) return res.status(404).json({ success: false, message: 'Not found' })
  course.lessons = course.lessons.filter(l => l.id !== req.params.lessonId)
  saveDb()
  res.json({ success: true })
})

// ── Stats ──────────────────────────────────────
router.get('/stats', authenticate, authorizeInstructor, (req: AuthRequest, res: Response) => {
  const myCourses = db.courses.filter(c => c.instructorId === req.user!.id)
  const totalEnrolls = myCourses.reduce((sum, c) => sum + c.enrolledCount, 0)
  const totalRevenue = myCourses.reduce((sum, c) => sum + (c.enrolledCount * c.price), 0)
  const platformFeePercent = 0.01

  res.json({
    success: true,
    data: {
      totalCourses: myCourses.length,
      approvedCourses: myCourses.filter(c => c.status === 'approved').length,
      pendingCourses: myCourses.filter(c => c.status === 'pending_approval').length,
      totalEnrolls,
      totalRevenue,
      platformFee: totalRevenue * platformFeePercent,
      platformFeePercent,
    }
  })
})

export default router
