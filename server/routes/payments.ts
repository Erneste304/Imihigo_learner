import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { paymentService } from '../services/payment.js'

const router = Router()

// Create Stripe Payment Intent
router.post('/stripe/create-intent', authenticate, async (req: AuthRequest, res: Response) => {
  const { amount, currency, type, itemId } = req.body
  try {
    const result = await paymentService.createStripeIntent(req.user!.id, amount, currency, { type, itemId })
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Create PayPal Order
router.post('/paypal/create-order', authenticate, async (req: AuthRequest, res: Response) => {
  const { amount, currency } = req.body
  try {
    const result = await paymentService.createPayPalOrder(amount, currency)
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Webhook or Callback for success (simplified for prototype)
router.post('/confirm', authenticate, async (req: AuthRequest, res: Response) => {
  const { type, itemId } = req.body
  try {
    const result = await paymentService.processSuccessfulPayment(req.user!.id, type, itemId)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
