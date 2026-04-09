import { db } from '../data/store.js'

// --- Models ---
export interface LearningModule {
  id: string
  title: string
  description: string
  type: 'ASSESSMENT' | 'COURSE' | 'PROJECT' | 'QUIZ'
  contentId: string
  order: number
  completed: boolean
  score?: number
  requiredScore?: number
}

export interface LearningPath {
  id: string
  userId: string
  title: string
  description: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  estimatedHours: number
  progress: number
  modules: LearningModule[]
  createdAt: string
  updatedAt: string
}

export interface SkillGap {
  skill: string
  currentLevel: number
  requiredLevel: number
  gap: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  recommendations: string[]
}

export interface LearningProgress {
  userId: string
  learningPathId: string
  completedModules: string[]
  currentModule: string
  timeSpent: number
  lastActivity: string
  streak: number
  xpEarned: number
}

export const learningPaths: LearningPath[] = []
export const learningProgress: LearningProgress[] = []

export class AILearningService {
  async analyzeSkillGaps(userId: string): Promise<SkillGap[]> {
    const userResults = db.assessments.filter(r => r.userId === userId)
    const skillScores: Record<string, number[]> = {}

    for (const result of userResults) {
      // Find the skill related to this assessment
      const skillContext = db.skills.find(s => s.id === result.skillId)
      if (skillContext) {
        if (!skillScores[skillContext.name]) {
          skillScores[skillContext.name] = []
        }
        skillScores[skillContext.name].push(result.score || 0)
      }
    }

    const skillGaps: SkillGap[] = []
    for (const [skill, scores] of Object.entries(skillScores)) {
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
      const requiredLevel = this.getRequiredLevel(skill)
      const currentLevel = this.scoreToLevel(averageScore)

      if (currentLevel < requiredLevel) {
        skillGaps.push({
          skill,
          currentLevel,
          requiredLevel,
          gap: requiredLevel - currentLevel,
          priority: this.calculatePriority(currentLevel, requiredLevel),
          recommendations: await this.generateRecommendations(skill, currentLevel, requiredLevel)
        })
      }
    }

    return skillGaps.sort((a, b) => b.gap - a.gap)
  }

  async generateLearningPath(userId: string): Promise<LearningPath> {
    const skillGaps = await this.analyzeSkillGaps(userId)
    const modules: LearningModule[] = []

    for (const gap of skillGaps.slice(0, 5)) {
      const recommendedContent = await this.getRecommendedContent(gap.skill, gap.currentLevel)
      modules.push(...recommendedContent)
    }

    const learningPath: LearningPath = {
      id: `path_${Date.now()}`,
      userId,
      title: this.generatePathTitle(skillGaps),
      description: this.generatePathDescription(skillGaps),
      difficulty: this.calculatePathDifficulty(skillGaps),
      estimatedHours: modules.length * 2,
      progress: 0,
      modules: modules.sort((a, b) => a.order - b.order),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Replace if exists
    const existingIndex = learningPaths.findIndex(p => p.userId === userId)
    if (existingIndex !== -1) learningPaths.splice(existingIndex, 1)
    learningPaths.push(learningPath)

    return learningPath
  }

  async getRecommendations(userId: string): Promise<any> {
    const skillGaps = await this.analyzeSkillGaps(userId)
    const learningPathInstance = learningPaths.find(p => p.userId === userId) || await this.generateLearningPath(userId)

    const prioritySkills = skillGaps.filter(g => g.priority === 'HIGH')
    const dailyPractice = prioritySkills.slice(0, 3).map(skill => ({
      skill: skill.skill,
      activity: `Practice ${skill.skill} for 15 minutes`,
      reason: `You're ${skill.gap} levels behind requirement`
    }))

    const quickWins = skillGaps.filter(g => g.gap <= 1).map(skill => ({
      skill: skill.skill,
      action: `Take the ${skill.skill} assessment`,
      estimatedTime: '30 minutes'
    }))

    return {
      skillGaps,
      learningPath: learningPathInstance,
      dailyPractice,
      quickWins,
      overallProgress: this.calculateOverallProgress(userId)
    }
  }

  async updateProgress(userId: string, moduleId: string, score: number): Promise<LearningProgress> {
    let progress = learningProgress.find(p => p.userId === userId)

    if (!progress) {
      progress = {
        userId,
        learningPathId: '',
        completedModules: [],
        currentModule: moduleId,
        timeSpent: 0,
        lastActivity: new Date().toISOString(),
        streak: 1,
        xpEarned: 0
      }
      learningProgress.push(progress)
    }

    if (!progress.completedModules.includes(moduleId)) {
      progress.completedModules.push(moduleId)
      progress.xpEarned += this.calculateXPReward(score)
    }

    progress.lastActivity = new Date().toISOString()
    progress.currentModule = moduleId

    const lastActivityDate = new Date(progress.lastActivity)
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 3600 * 24))

    if (diffDays === 1) progress.streak++
    else if (diffDays > 1) progress.streak = 1

    const learningPath = learningPaths.find(p => p.userId === userId)
    if (learningPath) {
      const completedCount = progress.completedModules.filter(m => learningPath.modules.some(mod => mod.id === m)).length
      learningPath.progress = (completedCount / learningPath.modules.length) * 100
    }

    return progress
  }

  private scoreToLevel(score: number): number {
    if (score >= 90) return 5
    if (score >= 75) return 4
    if (score >= 60) return 3
    if (score >= 40) return 2
    return 1
  }

  private getRequiredLevel(skill: string): number {
    const requirements: Record<string, number> = {
      'Programming': 4,
      'Web Development': 4,
      'Data Science': 3,
      'Design': 3,
      'Marketing': 2
    }
    return requirements[skill] || 3
  }

  private calculatePriority(current: number, required: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    const gap = required - current
    if (gap >= 2) return 'HIGH'
    if (gap >= 1) return 'MEDIUM'
    return 'LOW'
  }

  private async generateRecommendations(skill: string, current: number, _required: number): Promise<string[]> {
    const recommendations: string[] = []
    if (current < 2) {
      recommendations.push(`Start with ${skill} fundamentals course`)
      recommendations.push(`Complete basic ${skill} tutorials`)
    }
    if (current < 3) {
      recommendations.push(`Take intermediate ${skill} projects`)
      recommendations.push(`Join ${skill} study group`)
    }
    if (current < 4) {
      recommendations.push(`Work on real-world ${skill} projects`)
      recommendations.push(`Get mentorship in ${skill}`)
    }
    recommendations.push(`Take ${skill} certification assessment`)
    return recommendations
  }

  private async getRecommendedContent(skill: string, currentLevel: number): Promise<LearningModule[]> {
    const modules: LearningModule[] = []
    if (currentLevel < 2) {
      modules.push({
        id: `mod_${Date.now()}_1_${skill}`,
        title: `${skill} Fundamentals`,
        description: `Learn the basics of ${skill}`,
        type: 'COURSE',
        contentId: `course_${skill}_basic`,
        order: 1,
        completed: false,
        requiredScore: 70
      })
    }
    if (currentLevel < 3) {
      modules.push({
        id: `mod_${Date.now()}_2_${skill}`,
        title: `${skill} Intermediate`,
        description: `Deepen your ${skill} knowledge`,
        type: 'ASSESSMENT',
        contentId: `assessment_${skill}_intermediate`,
        order: 2,
        completed: false,
        requiredScore: 75
      })
    }
    modules.push({
      id: `mod_${Date.now()}_3_${skill}`,
      title: `${skill} Project`,
      description: `Apply ${skill} in a real project`,
      type: 'PROJECT',
      contentId: `project_${skill}`,
      order: modules.length + 1,
      completed: false,
      requiredScore: 80
    })
    return modules
  }

  private generatePathTitle(gaps: SkillGap[]): string {
    if (gaps.length === 0) return 'Master Your Skills'
    return `Become a ${gaps[0].skill} Professional`
  }

  private generatePathDescription(gaps: SkillGap[]): string {
    if (gaps.length === 0) return "Explore fundamentals to solidify your knowledge base."
    const skills = gaps.slice(0, 3).map(g => g.skill).join(', ')
    return `Personalized learning path to improve ${skills}. Complete modules at your own pace.`
  }

  private calculatePathDifficulty(gaps: SkillGap[]): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
    if (gaps.length === 0) return 'BEGINNER'
    const avgGap = gaps.reduce((sum, g) => sum + g.gap, 0) / gaps.length
    if (avgGap <= 1) return 'BEGINNER'
    if (avgGap <= 2) return 'INTERMEDIATE'
    return 'ADVANCED'
  }

  private calculateOverallProgress(userId: string): number {
    const progress = learningProgress.find(p => p.userId === userId)
    if (!progress) return 0
    const learningPath = learningPaths.find(p => p.userId === userId)
    if (!learningPath) return 0
    return (progress.completedModules.length / learningPath.modules.length) * 100
  }

  private calculateXPReward(score: number): number {
    if (score >= 90) return 100
    if (score >= 75) return 75
    if (score >= 60) return 50
    return 25
  }
}

export const aiLearningService = new AILearningService()
