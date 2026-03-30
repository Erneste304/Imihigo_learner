import { Router, Response } from 'express'
import { leaderboard } from '../data/community-store.js'
import { db } from '../data/store.js'

const router = Router()

router.get('/', (_req, res: Response) => {
  const merged = leaderboard.map(entry => {
    const user = db.users.find(u => u.id === entry.userId)
    return {
      ...entry,
      tokens: user?.tokens ?? entry.tokens,
      credentialsCount: db.credentials.filter(c => c.userId === entry.userId).length || entry.credentialsCount,
      assessmentsPassed: db.assessments.filter(a => a.userId === entry.userId && a.passed).length || entry.assessmentsPassed,
    }
  })
  res.json(merged.sort((a, b) => b.tokens - a.tokens).map((e, i) => ({ ...e, rank: i + 1 })))
})

export default router
