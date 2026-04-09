import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { certificationService } from '../services/certification.js'
import { db } from '../data/store.js'

const router = Router()

// Request issuance of a certificate
router.post('/issue', authenticate, async (req: AuthRequest, res: Response) => {
  const { courseId, level } = req.body
  try {
    const cert = await certificationService.issueCertificate(req.user!.id, courseId, level)
    res.json({ success: true, data: cert })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Public verification endpoint
router.get('/verify/:certId', async (req, res) => {
  try {
    const result = await certificationService.verify(req.params.certId)
    if (!result) return res.status(404).json({ success: false, message: 'Certificate not found' })
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Download PDF (Publicly accessible if certId is known)
router.get('/download/:certId', async (req, res) => {
  const cert = db.internationalCertificates.find(c => c.certificateId === req.params.certId)
  if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' })

  const user = db.users.find(u => u.id === cert.userId)
  if (!user) return res.status(400).json({ success: false, message: 'User not found' })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename=${cert.certificateId}.pdf`)
  
  certificationService.generatePDF(cert, user.name, res)
})

// Get user's certificates
router.get('/my', authenticate, (req: AuthRequest, res: Response) => {
  const myCerts = db.internationalCertificates.filter(c => c.userId === req.user!.id)
  res.json({ success: true, data: myCerts })
})

export default router
