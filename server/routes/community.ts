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

router.post('/tutorials', authenticate, (req: AuthRequest, res: Response) => {
  const { title, description, category, language, level, duration, tags, videoUrl } = req.body
  if (!title || !description || !category || !language || !level) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6']
  const newTutorial = {
    id: `t_${Date.now()}`,
    authorId: req.user!.id,
    authorName: req.user!.name,
    title,
    description,
    category,
    language: language as 'en' | 'rw' | 'both',
    level,
    duration: duration || '0h 00min',
    tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    likes: 0,
    views: 0,
    createdAt: new Date().toISOString(),
    thumbnailColor: colors[Math.floor(Math.random() * colors.length)],
    videoUrl: videoUrl || '',
  }
  tutorialPosts.unshift(newTutorial)
  res.json({ success: true, data: newTutorial })
})

router.post('/tutorials/:id/view', (req, res: Response) => {
  const post = tutorialPosts.find(p => p.id === req.params.id)
  if (!post) return res.status(404).json({ error: 'Not found' })
  post.views++
  res.json({ views: post.views })
})

router.post('/tutorials/:id/like', authenticate, (req: AuthRequest, res: Response) => {
  const post = tutorialPosts.find(p => p.id === req.params.id)
  if (!post) return res.status(404).json({ error: 'Tutorial not found' })
  post.likes++
  res.json({ likes: post.likes })
})

export default router
