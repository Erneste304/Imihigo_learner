import { db, saveDb } from '../data/store.js'

export interface GamificationProfile {
  userId: string
  level: number
  xp: number
  xpToNextLevel: number
  badges: any[]
  coins: number
  streak: number
  lastLoginDate: string
  statistics: any
}

export const badgeDefinitions = {
  first_assessment: { name: 'First Step', description: 'Completed your first assessment', icon: '🏆', xpReward: 50 },
  perfect_score: { name: 'Perfect Mastery', description: 'Scored 100% on an assessment', icon: '⭐', xpReward: 100 },
  assessment_master: { name: 'Assessment Master', description: 'Completed 10 assessments', icon: '📚', xpReward: 200 },
  job_landed: { name: 'Career Starter', description: 'Received your first job offer', icon: '💼', xpReward: 500 },
  streak_7: { name: 'Consistent Learner', description: '7 day learning streak', icon: '🔥', xpReward: 100 },
  streak_30: { name: 'Dedicated Scholar', description: '30 day learning streak', icon: '🌟', xpReward: 500 }
}

export class GamificationService {
  async getProfile(userId: string): Promise<GamificationProfile> {
    db.gamificationProfiles = db.gamificationProfiles || []
    let profile = db.gamificationProfiles.find((p: GamificationProfile) => p.userId === userId)
    if (!profile) {
      profile = {
        userId,
        level: 1,
        xp: 0,
        xpToNextLevel: 1000,
        badges: [],
        coins: 0,
        streak: 0,
        lastLoginDate: new Date().toISOString(),
        statistics: {
          totalAssessments: 0,
          perfectScores: 0,
          coursesCompleted: 0,
          certificatesEarned: 0,
          jobsApplied: 0
        }
      }
      db.gamificationProfiles.push(profile)
      saveDb()
    }
    return profile
  }

  async addXP(userId: string, amount: number, _source: string): Promise<any> {
    const profile = await this.getProfile(userId)
    const oldLevel = profile.level
    
    profile.xp += amount
    let leveledUp = false
    while (profile.xp >= profile.xpToNextLevel) {
      profile.xp -= profile.xpToNextLevel
      profile.level++
      profile.xpToNextLevel = Math.floor(profile.xpToNextLevel * 1.2)
      leveledUp = true
    }

    saveDb()
    return { xp: profile.xp, newLevel: profile.level, leveledUp, oldLevel, xpToNextLevel: profile.xpToNextLevel }
  }

  async awardBadge(userId: string, badgeId: string): Promise<boolean> {
    const profile = await this.getProfile(userId)
    if (profile.badges.some(b => b.id === badgeId)) return false

    const badgeDef = badgeDefinitions[badgeId as keyof typeof badgeDefinitions]
    if (!badgeDef) return false

    profile.badges.push({ id: badgeId, ...badgeDef, earnedAt: new Date().toISOString() })
    await this.addXP(userId, badgeDef.xpReward, `Badge: ${badgeDef.name}`)
    saveDb()
    return true
  }

  async updateStreak(userId: string): Promise<number> {
    const profile = await this.getProfile(userId)
    const today = new Date()
    const lastLogin = new Date(profile.lastLoginDate)
    
    // Normalize to start of day relative diff to avoid partial day issues
    const todayStr = today.toISOString().split('T')[0]
    const lastLoginStr = lastLogin.toISOString().split('T')[0]
    
    if (todayStr !== lastLoginStr) {
      const diffDays = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 3600 * 24))
      
      if (diffDays <= 1) {
        profile.streak++
        await this.addXP(userId, 10 * Math.min(profile.streak, 7), 'Daily Streak Bonus')
      } else {
        profile.streak = 1
      }
      
      profile.lastLoginDate = today.toISOString()
      
      if (profile.streak >= 7) await this.awardBadge(userId, 'streak_7')
      if (profile.streak >= 30) await this.awardBadge(userId, 'streak_30')

      saveDb()
    }

    return profile.streak
  }

  async claimDailyReward(userId: string): Promise<any> {
    const profile = await this.getProfile(userId)
    const streak = await this.updateStreak(userId)
    
    // Cap streak multiplier at 7 for daily reward
    const cappedStreak = Math.min(streak, 7)
    const reward = { coins: 10 * cappedStreak, xp: 50 * cappedStreak, streak }
    
    profile.coins += reward.coins
    await this.addXP(userId, reward.xp, 'Daily Reward')
    
    saveDb()
    return reward
  }

  async getLeaderboard(limit: number = 50): Promise<any[]> {
    db.gamificationProfiles = db.gamificationProfiles || []
    
    const sorted = [...db.gamificationProfiles].sort((a: GamificationProfile, b: GamificationProfile) => {
      if (b.xp !== a.xp) return b.xp - a.xp
      return b.badges.length - a.badges.length // tiebreaker
    })
    
    return sorted.slice(0, limit).map((profile: GamificationProfile, index) => {
      const user = db.users.find(u => u.id === profile.userId)
      // Get additional stats like credentials
      const credentialsCount = db.credentials?.filter(c => c.userId === profile.userId).length || 0
      const assessmentsPassed = profile.statistics?.totalAssessments || 0
      
      let badge = 'Novice'
      if (profile.level >= 10) badge = 'Master'
      else if (profile.level >= 5) badge = 'Pro'

      return { 
        userId: profile.userId,
        name: user?.name || 'Unknown',
        xp: profile.xp,
        tokens: user?.tokens || profile.coins,
        level: profile.level,
        badges: profile.badges.length,
        credentialsCount,
        assessmentsPassed,
        joinedAt: user?.createdAt || new Date().toISOString(),
        badge,
        rank: index + 1 
      }
    })
  }

  async getDashboard(userId: string): Promise<any> {
    const profile = await this.getProfile(userId)
    const allLeaderboards = await this.getLeaderboard(10)
    const userRank = allLeaderboards.findIndex(l => l.userId === userId) + 1 || allLeaderboards.length + 1

    const allBadges = Object.keys(badgeDefinitions)
    const earnedBadges = profile.badges.map(b => b.id)
    const nextBadges = allBadges.filter(b => !earnedBadges.includes(b)).slice(0, 3).map(badgeId => ({
      id: badgeId,
      ...badgeDefinitions[badgeId as keyof typeof badgeDefinitions],
      progress: Math.floor(Math.random() * 100) // Mocking progress
    }))

    return {
      profile,
      rank: userRank,
      nextBadges,
      achievements: {
        nextLevel: {
          currentXP: profile.xp,
          neededXP: profile.xpToNextLevel - profile.xp,
          progress: (profile.xp / profile.xpToNextLevel) * 100
        }
      }
    }
  }
}

export const gamificationService = new GamificationService()
