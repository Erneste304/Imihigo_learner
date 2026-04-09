import Stripe from 'stripe'
import paypal from '@paypal/checkout-server-sdk'
import { db } from '../data/store.js'

// Initialize Stripe (using placeholders)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-01-27' as any,
})

// Initialize PayPal
const paypalEnvironment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID || 'placeholder',
  process.env.PAYPAL_CLIENT_SECRET || 'placeholder'
)
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment)

export const paymentService = {
  // Create Stripe Payment Intent for a course or certificate
  createStripeIntent: async (userId: string, amount: number, currency: string = 'usd', metadata: any = {}) => {
    try {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency,
        metadata: {
          ...metadata,
          userId
        }
      })
      return { clientSecret: intent.client_secret }
    } catch (err: any) {
      throw new Error(`Stripe Error: ${err.message}`)
    }
  },

  // Create PayPal Order
  createPayPalOrder: async (amount: number, currency: string = 'USD') => {
    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer("return=representation")
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString()
        }
      }]
    })

    try {
      const order = await paypalClient.execute(request)
      return { orderId: order.result.id }
    } catch (err: any) {
      throw new Error(`PayPal Error: ${err.message}`)
    }
  },

  // Handle successful payment
  processSuccessfulPayment: async (userId: string, type: 'course' | 'certificate', itemId: string) => {
    const user = db.users.find(u => u.id === userId)
    if (!user) throw new Error('User not found')

    if (type === 'course') {
      const course = db.courses.find(c => c.id === itemId)
      if (course) {
        course.enrolledCount++
        // logic for user-course relationship would go here
      }
    } else if (type === 'certificate') {
      const cert = db.internationalCertificates.find(c => c.id === itemId)
      if (cert) {
        cert.paymentStatus = 'paid'
      }
    }

    return { success: true }
  },

  // Calculate platform revenue share
  calculateRevenue: (amount: number) => {
    const platformFeeSetting = db.adminSettings.find(s => s.key === 'platform_fee')
    const feePercent = platformFeeSetting ? platformFeeSetting.value : 30
    const platformShare = amount * (feePercent / 100)
    const instructorShare = amount - platformShare
    
    return {
      total: amount,
      platform: platformShare,
      instructor: instructorShare,
      feePercent
    }
  }
}
