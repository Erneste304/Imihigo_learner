import { v4 as uuid } from 'uuid'
import { db } from '../data/store.js'
import { emailService } from './email.js'
import { smsService } from './sms.js'

export const mentorshipService = {
  // Find mentors based on skills
  findMentors: async (skills: string[], maxRate?: number) => {
    let filteredMentors = db.mentors.filter(mentor => 
      mentor.verified && 
      mentor.skills.some(skill => 
        skills.some(reqSkill => 
          skill.toLowerCase().includes(reqSkill.toLowerCase())
        )
      )
    )
    
    if (maxRate) {
      filteredMentors = filteredMentors.filter(m => m.hourlyRate <= maxRate)
    }
    
    return filteredMentors.sort((a, b) => {
      if (a.rating !== b.rating) return b.rating - a.rating
      return b.totalSessions - a.totalSessions
    })
  },
  
  // Get mentor availability
  getMentorAvailability: async (mentorId: string) => {
    const mentor = db.mentors.find(m => m.id === mentorId)
    return mentor?.availability || []
  },
  
  // Book a mentorship session
  bookSession: async (menteeId: string, mentorId: string, scheduledAt: string, duration: number, topic: string) => {
    const mentor = db.mentors.find(m => m.id === mentorId)
    if (!mentor) throw new Error('Mentor not found')
    
    // Check for conflicts
    const targetDate = new Date(scheduledAt).getTime()
    const conflicting = db.mentorshipSessions.find(s => 
      s.mentorId === mentorId && 
      s.status !== 'cancelled' &&
      Math.abs(new Date(s.scheduledAt).getTime() - targetDate) < duration * 60000
    )
    
    if (conflicting) throw new Error('Mentor is not available at this time')
    
    const session = {
      id: uuid(),
      mentorId,
      menteeId,
      scheduledAt,
      duration,
      status: 'pending' as const,
      topic,
      createdAt: new Date().toISOString(),
      meetingLink: `https://meet.imihigo.rw/${uuid().slice(0,8)}`
    }
    
    db.mentorshipSessions.push(session)
    
    // Notify mentor (simulated)
    const mentorUser = db.users.find(u => u.id === mentor.userId)
    const menteeUser = db.users.find(u => u.id === menteeId)
    if (mentorUser && menteeUser) {
      await emailService.sendEmail(mentorUser.email, 'New Mentorship Request', `You have a new booking from ${menteeUser.name} for ${topic}.`)
    }
    
    return session
  },
  
  // Send a formal mentorship request (long-term)
  sendRequest: async (menteeId: string, mentorId: string, message: string, topics: string[]) => {
    const request = {
      id: uuid(),
      mentorId,
      menteeId,
      message,
      proposedTopics: topics,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    }
    
    db.mentorshipRequests.push(request)
    return request
  },
  
  // Confirm a session
  confirmSession: async (sessionId: string) => {
    const session = db.mentorshipSessions.find(s => s.id === sessionId)
    if (!session) throw new Error('Session not found')
    
    session.status = 'confirmed'
    
    // Notification logic
    const mentorUser = db.users.find(u => u.id === session.mentorId)
    const menteeUser = db.users.find(u => u.id === session.menteeId)
    if (mentorUser && menteeUser) {
      await emailService.sendEmail(menteeUser.email, 'Session Confirmed!', `Your session with ${mentorUser.name} on ${session.topic} is confirmed. Link: ${session.meetingLink}`)
    }
    
    return session
  },
  
  // Submit feedback
  submitFeedback: async (sessionId: string, userId: string, rating: number, comment: string) => {
    const session = db.mentorshipSessions.find(s => s.id === sessionId)
    if (!session) throw new Error('Session not found')
    
    const feedback = {
      rating,
      comment,
      submittedAt: new Date().toISOString()
    }
    
    if (userId === session.mentorId) {
      feedback.mentorRating = rating
    } else {
      feedback.menteeRating = rating
      
      // Update mentor's actual rating
      const mentor = db.mentors.find(m => m.id === session.mentorId)
      if (mentor) {
        const totalRating = mentor.rating * mentor.totalSessions
        mentor.totalSessions++
        mentor.rating = (totalRating + rating) / mentor.totalSessions
      }
    }
    
    session.feedback = { ...session.feedback, ...feedback }
    session.status = 'completed'
    return feedback
  },
  
  getUserSessions: async (userId: string) => {
    return db.mentorshipSessions.filter(s => s.mentorId === userId || s.menteeId === userId)
  }
}
