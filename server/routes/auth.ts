import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { db, saveDb } from '../data/store.js'
import { logActivity } from '../services/activity.js'
import { io } from '../index.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'imihigo-learn-secret-2024'

router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password, role = 'jobseeker' } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' })
  if (db.users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already in use' })

  const hashed = await bcrypt.hash(password, 10)
  const user = { id: uuid(), name, email, password: hashed, role, skills: [], verified: false, createdAt: new Date().toISOString(), tokens: 50 }
  db.users.push(user as any)
  saveDb()

  logActivity(io, {
    type: 'USER_REGISTER',
    message: `New user ${name} joined Imihigo Learn as ${role}`,
    userId: user.id,
    userName: name,
    metadata: { role }
  })

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  const { password: _, ...safe } = user
  res.status(201).json({ token, user: safe })
})

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  const user = db.users.find(u => u.email === email)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  const { password: _, ...safe } = user
  res.json({ token, user: safe })
})

export default router
