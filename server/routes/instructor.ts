import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { db } from '../data/store.js'
import { v4 as uuid } from 'uuid'

const router = Router()

// Only allow instructors
const authorizeInstructor = (req: AuthRequest, res: Response, next: Function) => {
  if (req.user?.role !== 'instructor' && req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Instructor access required' })
  }
  next()
}

router.get('/my-courses', authenticate, authorizeInstructor, (req: AuthRequest, res: Response) => {
  const myCourses = db.courses.filter(c => c.instructorId === req.user!.id)
  res.json({ success: true, data: myCourses })
})

router.post('/courses', authenticate, authorizeInstructor, (req: AuthRequest, res: Response) => {
  const newCourse = {
    id: uuid(),
    ...req.body,
    instructorId: req.user!.id,
    enrolledCount: 0,
    createdAt: new Date().toISOString()
  }
  db.courses.push(newCourse)
  res.json({ success: true, data: newCourse })
})

router.get('/stats', authenticate, authorizeInstructor, (req: AuthRequest, res: Response) => {
  const myCourses = db.courses.filter(c => c.instructorId === req.user!.id)
  const totalEnrolls = myCourses.reduce((sum, c) => sum + c.enrolledCount, 0)
  const totalRevenue = myCourses.reduce((sum, c) => sum + (c.enrolledCount * c.price), 0)
  
  res.json({
    success: true,
    data: {
      totalCourses: myCourses.length,
      totalEnrolls,
      totalRevenue,
      platformFee: totalRevenue * 0.2 // 20% mock
    }
  })
})

export default router
