import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { studyGroupService } from '../services/study-group.js'

const router = Router()

// List all public groups
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const groups = await studyGroupService.getAllGroups()
  res.json({ success: true, data: groups })
})

// Create a new group
router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const group = await studyGroupService.createGroup(req.user!.id, req.body)
    res.json({ success: true, data: group })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Get details + discussions
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const group = await studyGroupService.getGroupDetails(req.params.id)
    res.json({ success: true, data: group })
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message })
  }
})

// Join a group
router.post('/:id/join', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const group = await studyGroupService.joinGroup(req.params.id, req.user!.id)
    res.json({ success: true, data: group })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Post to discussion thread
router.post('/:id/discussions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const discussion = await studyGroupService.createDiscussion(req.params.id, req.user!.id, req.body.message)
    res.json({ success: true, data: discussion })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Reply to a thread
router.post('/discussions/:discussionId/reply', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const reply = await studyGroupService.replyToDiscussion(req.params.discussionId, req.user!.id, req.body.message)
    res.json({ success: true, data: reply })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Add educational resource
router.post('/:id/resources', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const resource = await studyGroupService.addResource(req.params.id, req.user!.id, req.body)
    res.json({ success: true, data: resource })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
