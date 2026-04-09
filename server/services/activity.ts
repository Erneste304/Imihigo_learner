import { db, saveDb } from '../data/store.js'
import { v4 as uuid } from 'uuid'
// We will emit globally via req.app.get('io') to avoid circular deps

export interface PlatformActivity {
  id: string
  type: 'USER_REGISTER' | 'JOB_POSTED' | 'JOB_APPLIED' | 'ASSESSMENT_COMPLETED' | 'CERTIFICATE_ISSUED' | 'MENTORSHIP_BOOKED'
  message: string
  userId: string
  userName: string
  timestamp: string
  metadata?: any
}

export const logActivity = (io: any, activity: Omit<PlatformActivity, 'id' | 'timestamp'>) => {
  const newActivity: PlatformActivity = {
    ...activity,
    id: uuid(),
    timestamp: new Date().toISOString()
  }

  // Persist
  db.activities = db.activities || []
  db.activities.unshift(newActivity)
  if (db.activities.length > 100) db.activities.pop() // Keep last 100
  
  saveDb()

  // Emit to admins
  if (io) {
    io.emit('platform-activity', newActivity)
  }
}
