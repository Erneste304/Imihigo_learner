import { Router, Request, Response } from 'express'
import { db } from '../data/store.js'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const activeCourses = db.courses
    .filter(c => c.active !== false)
    .map(c => {
      const instructor = db.users.find(u => u.id === c.instructorId)
      return { ...c, instructorName: instructor?.name || 'Imihigo Instructor' }
    })
  res.json({ success: true, data: activeCourses })
})

export default router
