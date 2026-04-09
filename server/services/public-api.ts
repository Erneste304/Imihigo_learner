import { v4 as uuid } from 'uuid'
import crypto from 'crypto'
import { db } from '../data/store.js'

export const publicApiService = {
  // Generate a new API key pair
  generateKey: async (userId: string, name: string) => {
    const apiKey = `im_live_${crypto.randomBytes(16).toString('hex')}`
    const apiSecret = crypto.randomBytes(32).toString('hex')
    
    const newKey = {
      id: uuid(),
      userId,
      apiKey,
      apiSecret: crypto.createHash('sha256').update(apiSecret).digest('hex'),
      name,
      permissions: ['read:certificates', 'verify:skills'],
      rateLimit: 1000,
      createdAt: new Date().toISOString()
    }
    
    db.apiKeys.push(newKey)
    return { apiKey, apiSecret, name: newKey.name }
  },

  // Validate an incoming API key
  validateKey: async (apiKey: string) => {
    const keyRecord = db.apiKeys.find(k => k.apiKey === apiKey)
    if (!keyRecord) return null
    
    keyRecord.lastUsed = new Date().toISOString()
    return keyRecord
  },

  // Trigger outbound webhooks (simulated)
  triggerWebhook: async (apiKeyId: string, event: string, payload: any) => {
    // In a real app, this would query a webhooks table and send a POST request
    console.log(`[PUBLIC API] Event ${event} triggered for Key ${apiKeyId}`, payload)
    return { status: 'queued' }
  }
}
