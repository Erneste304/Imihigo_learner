import { v4 as uuid } from 'uuid'
import { db } from '../data/store.js'

export const studyGroupService = {
  // Global listing
  getAllGroups: async () => {
    return db.studyGroups.filter(g => g.isPublic)
  },

  // Create a new group
  createGroup: async (creatorId: string, data: any) => {
    const group = {
      id: uuid(),
      name: data.name,
      description: data.description,
      topic: data.topic,
      creatorId,
      members: [{ userId: creatorId, role: 'admin' as const, joinedAt: new Date().toISOString() }],
      maxMembers: data.maxMembers || 50,
      isPublic: data.isPublic !== false,
      meetingSchedule: data.meetingSchedule || {
        frequency: 'weekly',
        time: '18:00',
        timezone: 'Africa/Kigali',
        nextMeeting: new Date(Date.now() + 86400000 * 7).toISOString()
      },
      resources: [],
      createdAt: new Date().toISOString()
    }
    
    db.studyGroups.push(group)
    return group
  },

  // Join a group
  joinGroup: async (groupId: string, userId: string) => {
    const group = db.studyGroups.find(g => g.id === groupId)
    if (!group) throw new Error('Group not found')
    
    if (group.members.length >= group.maxMembers) throw new Error('Group is full')
    if (group.members.some(m => m.userId === userId)) throw new Error('Already a member')
    
    group.members.push({
      userId,
      role: 'member' as const,
      joinedAt: new Date().toISOString()
    })
    
    return group
  },

  // Post to discussion board
  createDiscussion: async (groupId: string, userId: string, message: string) => {
    const discussion = {
      id: uuid(),
      groupId,
      userId,
      message,
      replies: [],
      createdAt: new Date().toISOString()
    }
    
    db.groupDiscussions.push(discussion)
    return discussion
  },

  // Reply to a thread
  replyToDiscussion: async (discussionId: string, userId: string, message: string) => {
    const discussion = db.groupDiscussions.find(d => d.id === discussionId)
    if (!discussion) throw new Error('Discussion not found')
    
    const reply = {
      id: uuid(),
      userId,
      message,
      createdAt: new Date().toISOString()
    }
    
    discussion.replies.push(reply)
    return reply
  },

  // Add learning resources
  addResource: async (groupId: string, userId: string, data: any) => {
    const group = db.studyGroups.find(g => g.id === groupId)
    if (!group) throw new Error('Group not found')
    
    const resource = {
      id: uuid(),
      title: data.title,
      description: data.description,
      url: data.url,
      type: data.type || 'link',
      uploadedBy: userId,
      uploadedAt: new Date().toISOString()
    }
    
    group.resources.push(resource)
    return resource
  },

  // Get details + discussions
  getGroupDetails: async (groupId: string) => {
    const group = db.studyGroups.find(g => g.id === groupId)
    if (!group) throw new Error('Group not found')
    
    const discussions = db.groupDiscussions.filter(d => d.groupId === groupId)
    
    return {
      ...group,
      discussions
    }
  },

  // Get user's active groups
  getUserGroups: async (userId: string) => {
    return db.studyGroups.filter(g => g.members.some(m => m.userId === userId))
  }
}
