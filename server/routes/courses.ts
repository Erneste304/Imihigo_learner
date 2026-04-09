import { Router, Request, Response } from 'express'
import { db, saveDb } from '../data/store.js'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { v4 as uuid } from 'uuid'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const activeCourses = db.courses
    .filter(c => c.active !== false && c.status === 'approved')
    .map(c => {
      const instructor = db.users.find(u => u.id === c.instructorId)
      const enrolledCount = (db as any).enrollments?.filter((e: any) => e.courseId === c.id).length ?? c.enrolledCount
      const { lessons, ...rest } = c
      return { ...rest, instructorName: instructor?.name || 'Imihigo Instructor', enrolledCount, lessonCount: lessons?.length || 0 }
    })
  res.json({ success: true, data: activeCourses })
})

router.get('/:id', (req: Request, res: Response) => {
  const course = db.courses.find(c => c.id === req.params.id)
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
  const instructor = db.users.find(u => u.id === course.instructorId)
  const enrolledCount = (db as any).enrollments?.filter((e: any) => e.courseId === course.id).length ?? course.enrolledCount
  res.json({ success: true, data: { ...course, instructorName: instructor?.name || 'Unknown', enrolledCount } })
})

router.post('/:id/enroll', authenticate, (req: AuthRequest, res: Response) => {
  const course = db.courses.find(c => c.id === req.params.id)
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' })

  if (!(db as any).enrollments) (db as any).enrollments = []
  const existing = (db as any).enrollments.find((e: any) => e.userId === req.user!.id && e.courseId === req.params.id)
  if (existing) return res.status(409).json({ success: false, message: 'Already enrolled' })

  const enrollment = {
    id: uuid(),
    userId: req.user!.id,
    courseId: req.params.id,
    enrolledAt: new Date().toISOString(),
    completedLessons: [],
    completed: false,
    paid: course.price === 0,
  }

  ;(db as any).enrollments.push(enrollment)
  course.enrolledCount = (course.enrolledCount || 0) + 1
  saveDb()
  res.json({ success: true, data: enrollment })
})

router.get('/:id/enrollment', authenticate, (req: AuthRequest, res: Response) => {
  const enrollment = (db as any).enrollments?.find((e: any) => e.userId === req.user!.id && e.courseId === req.params.id)
  res.json({ success: true, data: enrollment || null })
})

router.put('/:id/lessons/:lessonId/complete', authenticate, (req: AuthRequest, res: Response) => {
  if (!(db as any).enrollments) (db as any).enrollments = []
  const enrollment = (db as any).enrollments.find((e: any) => e.userId === req.user!.id && e.courseId === req.params.id)
  if (!enrollment) return res.status(404).json({ success: false, message: 'Not enrolled' })

  if (!enrollment.completedLessons.includes(req.params.lessonId)) {
    enrollment.completedLessons.push(req.params.lessonId)
  }

  const course = db.courses.find(c => c.id === req.params.id)
  const totalLessons = course?.lessons?.length || 0
  if (totalLessons > 0 && enrollment.completedLessons.length >= totalLessons && !enrollment.completed) {
    enrollment.completed = true
    enrollment.completedAt = new Date().toISOString()
    if (course) {
      const certId = `CERT-${course.id.toUpperCase()}-${req.user!.id.slice(0, 6).toUpperCase()}-${Date.now()}`
      enrollment.certificateId = certId
      const cert = {
        id: uuid(),
        userId: req.user!.id,
        courseId: course.id,
        courseName: course.title,
        certificateId: certId,
        level: course.level || 'beginner',
        score: 100,
        issuedBy: 'IMIHIGO',
        isValidGlobally: true,
        blockchainTx: `0x${Math.random().toString(16).slice(2, 42)}`,
        verificationCode: certId,
        issuedAt: new Date().toISOString(),
        paymentStatus: course.price > 0 ? 'paid' : 'free',
      }
      db.internationalCertificates.push(cert as any)
    }
  }

  saveDb()
  res.json({ success: true, data: enrollment })
})

export default router
