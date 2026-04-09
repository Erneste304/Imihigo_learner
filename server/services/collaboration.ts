import { v4 as uuid } from 'uuid'
import { db } from '../data/store.js'

export const collaborationService = {
  // Mentorship
  getMentors: () => {
    return db.mentors
  },

  bookSession: (mentorId: string, userId: string, topic: string) => {
    const mentor = db.mentors.find(m => m.id === mentorId)
    if (!mentor) throw new Error('Mentor not found')
    
    // In a real app, we'd add a 'sessions' object to store this.
    // For now, we simulate a success message and update total sessions.
    mentor.totalSessions += 1
    return {
      id: uuid(),
      mentorId,
      userId,
      topic,
      scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      status: 'confirmed'
    }
  },

  // Study Groups
  getGroups: () => {
    return db.studyGroups
  },

  joinGroup: (groupId: string, userId: string) => {
    const group = db.studyGroups.find(g => g.id === groupId)
    if (!group) throw new Error('Group not found')
    
    group.membersCount += 1
    return { success: true, group }
  },
  
  createGroup: (userId: string, data: { name: string, topic: string, description: string }) => {
    const newGroup = {
      id: uuid(),
      ...data,
      ownerId: userId,
      membersCount: 1,
      isPublic: true,
      createdAt: new Date().toISOString()
    }
    db.studyGroups.push(newGroup)
    return newGroup
  }
}
