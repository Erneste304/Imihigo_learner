export interface User {
  id: string
  name: string
  email: string
  role: 'jobseeker' | 'employer' | 'admin'
  avatar?: string
  bio?: string
  location?: string
  skills: string[]
  verified: boolean
  createdAt: string
  tokens: number
}

export interface Skill {
  id: string
  name: string
  category: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  questionsCount: number
  duration: number
  icon: string
  tags: string[]
}

export interface Assessment {
  id: string
  userId: string
  skillId: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  score: number
  passed: boolean
  startedAt: string
  completedAt?: string
  credentialId?: string
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'gig'
  salary: string
  description: string
  requiredSkills: string[]
  postedAt: string
  deadline: string
  remote: boolean
  employerId: string
  applications: number
  matchRate?: number
}

export interface Credential {
  id: string
  userId: string
  skillId: string
  skillName: string
  issuedAt: string
  expiresAt?: string
  txHash: string
  qrCode: string
  level: string
  verified: boolean
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => void
  loading: boolean
}
