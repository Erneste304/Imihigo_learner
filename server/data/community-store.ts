export interface TutorialPost {
  id: string
  authorId: string
  authorName: string
  title: string
  description: string
  category: string
  language: 'en' | 'rw' | 'both'
  likes: number
  views: number
  duration: string
  level: string
  tags: string[]
  createdAt: string
  thumbnailColor: string
  videoUrl?: string
}

export interface LeaderboardEntry {
  userId: string
  name: string
  tokens: number
  credentialsCount: number
  assessmentsPassed: number
  rank: number
  badge: string
  joinedAt: string
}

export const tutorialPosts: TutorialPost[] = [
  { id: 't1', authorId: 'u1', authorName: 'Alice Uwimana', title: 'JavaScript mu Kinyarwanda - Intangiriro', description: 'Iga JavaScript uhereye ku ntangiriro. Isomo ryose rifite amavideo.', category: 'Programming', language: 'rw', likes: 142, views: 1823, duration: '2h 15min', level: 'beginner', tags: ['js', 'kinyarwanda'], createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), thumbnailColor: '#f59e0b' },
  { id: 't2', authorId: 'u1', authorName: 'Alice Uwimana', title: 'React Hooks Explained', description: 'Deep dive into useState, useEffect, useContext and custom hooks.', category: 'Frontend', language: 'en', likes: 89, views: 1102, duration: '1h 45min', level: 'intermediate', tags: ['react', 'hooks'], createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), thumbnailColor: '#6366f1' },
  { id: 't3', authorId: 'u2', authorName: 'Bob Nkurunziza', title: 'Gukora API na Node.js', description: 'Wige gukora REST API ukoresha Node.js na Express muri Kinyarwanda.', category: 'Backend', language: 'rw', likes: 211, views: 2940, duration: '3h 00min', level: 'intermediate', tags: ['node', 'api', 'kinyarwanda'], createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), thumbnailColor: '#10b981' },
  { id: 't4', authorId: 'u1', authorName: 'Alice Uwimana', title: 'Introduction to Data Analysis', description: 'Learn how to analyze business data using modern tools.', category: 'Data Science', language: 'en', likes: 67, views: 890, duration: '1h 30min', level: 'beginner', tags: ['data', 'analytics'], createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), thumbnailColor: '#8b5cf6' },
  { id: 't5', authorId: 'u2', authorName: 'Bob Nkurunziza', title: 'UI/UX Design Principles', description: 'Design thinking and user-centered approaches for African products.', category: 'Design', language: 'en', likes: 54, views: 720, duration: '1h 00min', level: 'beginner', tags: ['design', 'ui'], createdAt: new Date().toISOString(), thumbnailColor: '#ef4444' },
  { id: 't6', authorId: 'u1', authorName: 'Alice Uwimana', title: 'TypeScript Intangiriro - Igice 1', description: 'Wige TypeScript uhereye ku ntangiriro. Bifasha cyane!', category: 'Programming', language: 'both', likes: 176, views: 2100, duration: '2h 30min', level: 'intermediate', tags: ['typescript', 'kinyarwanda'], createdAt: new Date(Date.now() - 86400000).toISOString(), thumbnailColor: '#3b82f6' },
]

export const leaderboard: LeaderboardEntry[] = [
  { userId: 'u3', name: 'Marie Claire Ingabire', tokens: 980, credentialsCount: 7, assessmentsPassed: 9, rank: 1, badge: '🥇 Champion', joinedAt: new Date(Date.now() - 86400000 * 90).toISOString() },
  { userId: 'u4', name: 'Jean Paul Habimana', tokens: 750, credentialsCount: 6, assessmentsPassed: 7, rank: 2, badge: '🥈 Expert', joinedAt: new Date(Date.now() - 86400000 * 60).toISOString() },
  { userId: 'u5', name: 'Diane Mukamana', tokens: 610, credentialsCount: 5, assessmentsPassed: 6, rank: 3, badge: '🥉 Skilled', joinedAt: new Date(Date.now() - 86400000 * 45).toISOString() },
  { userId: 'u1', name: 'Alice Uwimana', tokens: 120, credentialsCount: 2, assessmentsPassed: 2, rank: 4, badge: '⭐ Rising', joinedAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { userId: 'u6', name: 'Olivier Niyonkuru', tokens: 95, credentialsCount: 1, assessmentsPassed: 2, rank: 5, badge: '🌱 Starter', joinedAt: new Date(Date.now() - 86400000 * 20).toISOString() },
  { userId: 'u7', name: 'Claudine Uwase', tokens: 75, credentialsCount: 1, assessmentsPassed: 1, rank: 6, badge: '🌱 Starter', joinedAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  { userId: 'u8', name: 'Emmanuel Bizimana', tokens: 50, credentialsCount: 0, assessmentsPassed: 0, rank: 7, badge: '🌱 Starter', joinedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
]
