import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { tutorialPosts } from '../data/community-store.js'

const router = Router()

router.get('/tutorials', (_req, res: Response) => {
  const { category, lang } = _req.query
  let posts = [...tutorialPosts]
  if (category && category !== 'All') posts = posts.filter(p => p.category === category)
  if (lang) posts = posts.filter(p => p.language === lang || p.language === 'both')
  res.json(posts.sort((a, b) => b.likes - a.likes))
})

router.post('/tutorials/:id/like', authenticate, (req: AuthRequest, res: Response) => {
  const post = tutorialPosts.find(p => p.id === req.params.id)
  if (!post) return res.status(404).json({ error: 'Tutorial not found' })
  post.likes++
  res.json({ likes: post.likes })
})

export default router
