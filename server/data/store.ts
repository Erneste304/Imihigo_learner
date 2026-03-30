import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  name: string
  email: string
  password: string
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

const users: User[] = [
  {
    id: 'u1',
    name: 'Alice Uwimana',
    email: 'alice@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'jobseeker',
    location: 'Kigali, Rwanda',
    bio: 'Full-stack developer passionate about EdTech solutions',
    skills: ['JavaScript', 'React', 'Node.js'],
    verified: true,
    createdAt: new Date().toISOString(),
    tokens: 120,
  },
  {
    id: 'u2',
    name: 'Bob Nkurunziza',
    email: 'bob@employer.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'employer',
    location: 'Kigali, Rwanda',
    bio: 'HR Manager at TechRwanda Ltd.',
    skills: [],
    verified: true,
    createdAt: new Date().toISOString(),
    tokens: 0,
  },
]

const skills: Skill[] = [
  { id: 's1', name: 'JavaScript Fundamentals', category: 'Programming', description: 'Core JS concepts: variables, functions, DOM, async.', level: 'beginner', questionsCount: 25, duration: 45, icon: '⚡', tags: ['web', 'frontend'] },
  { id: 's2', name: 'React Development', category: 'Frontend', description: 'Component-based UI development with React and hooks.', level: 'intermediate', questionsCount: 30, duration: 60, icon: '⚛️', tags: ['web', 'frontend', 'react'] },
  { id: 's3', name: 'Node.js & APIs', category: 'Backend', description: 'Build RESTful APIs with Node.js, Express, and databases.', level: 'intermediate', questionsCount: 28, duration: 55, icon: '🟢', tags: ['backend', 'api'] },
  { id: 's4', name: 'Python Basics', category: 'Programming', description: 'Data types, control flow, OOP, and standard library.', level: 'beginner', questionsCount: 20, duration: 40, icon: '🐍', tags: ['data', 'scripting'] },
  { id: 's5', name: 'Data Analysis', category: 'Data Science', description: 'Statistical analysis and visualization with modern tools.', level: 'intermediate', questionsCount: 25, duration: 50, icon: '📊', tags: ['data', 'analytics'] },
  { id: 's6', name: 'UI/UX Design', category: 'Design', description: 'User-centered design principles and prototyping.', level: 'beginner', questionsCount: 22, duration: 40, icon: '🎨', tags: ['design', 'ui'] },
  { id: 's7', name: 'DevOps & CI/CD', category: 'Operations', description: 'Docker, CI/CD pipelines, and cloud deployment.', level: 'advanced', questionsCount: 35, duration: 70, icon: '🚀', tags: ['devops', 'cloud'] },
  { id: 's8', name: 'TypeScript', category: 'Programming', description: 'Typed JavaScript for large-scale applications.', level: 'intermediate', questionsCount: 28, duration: 55, icon: '🔷', tags: ['web', 'typing'] },
]

const jobs: Job[] = [
  { id: 'j1', title: 'Junior Frontend Developer', company: 'TechRwanda Ltd', location: 'Kigali', type: 'full-time', salary: 'RWF 400,000-600,000/mo', description: 'Build modern web apps for Rwanda\'s fastest-growing tech startup.', requiredSkills: ['JavaScript Fundamentals', 'React Development'], postedAt: new Date(Date.now() - 86400000 * 2).toISOString(), deadline: new Date(Date.now() + 86400000 * 30).toISOString(), remote: false, employerId: 'u2', applications: 18 },
  { id: 'j2', title: 'Backend API Engineer', company: 'Andela Rwanda', location: 'Remote', type: 'full-time', salary: 'USD 1,200-1,800/mo', description: 'Design and maintain scalable REST APIs for pan-African clients.', requiredSkills: ['Node.js & APIs', 'TypeScript'], postedAt: new Date(Date.now() - 86400000).toISOString(), deadline: new Date(Date.now() + 86400000 * 14).toISOString(), remote: true, employerId: 'u2', applications: 42 },
  { id: 'j3', title: 'Data Analyst', company: 'Rwanda Revenue Authority', location: 'Kigali', type: 'full-time', salary: 'RWF 700,000-900,000/mo', description: 'Analyze tax and economic data to support government decisions.', requiredSkills: ['Data Analysis', 'Python Basics'], postedAt: new Date(Date.now() - 86400000 * 5).toISOString(), deadline: new Date(Date.now() + 86400000 * 21).toISOString(), remote: false, employerId: 'u2', applications: 29 },
  { id: 'j4', title: 'UI/UX Designer', company: 'Zipline Rwanda', location: 'Kigali', type: 'contract', salary: 'RWF 500,000/mo', description: 'Design intuitive interfaces for medical delivery systems.', requiredSkills: ['UI/UX Design'], postedAt: new Date().toISOString(), deadline: new Date(Date.now() + 86400000 * 10).toISOString(), remote: false, employerId: 'u2', applications: 11 },
  { id: 'j5', title: 'DevOps Engineer', company: 'MTN Rwanda', location: 'Kigali', type: 'full-time', salary: 'RWF 1,200,000-1,500,000/mo', description: 'Manage cloud infrastructure and CI/CD pipelines for mobile money platform.', requiredSkills: ['DevOps & CI/CD'], postedAt: new Date(Date.now() - 86400000 * 3).toISOString(), deadline: new Date(Date.now() + 86400000 * 25).toISOString(), remote: false, employerId: 'u2', applications: 7 },
  { id: 'j6', title: 'Gig: Web Content Entry', company: 'Various Clients', location: 'Remote', type: 'gig', salary: 'RWF 2,000-5,000/task', description: 'Short-term data entry and web tasks. Get paid per task completed.', requiredSkills: ['JavaScript Fundamentals'], postedAt: new Date().toISOString(), deadline: new Date(Date.now() + 86400000 * 7).toISOString(), remote: true, employerId: 'u2', applications: 55 },
]

const assessments: Assessment[] = [
  { id: 'a1', userId: 'u1', skillId: 's1', status: 'completed', score: 88, passed: true, startedAt: new Date(Date.now() - 86400000 * 3).toISOString(), completedAt: new Date(Date.now() - 86400000 * 3 + 3600000).toISOString(), credentialId: 'c1' },
  { id: 'a2', userId: 'u1', skillId: 's2', status: 'completed', score: 75, passed: true, startedAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 86400000 + 4200000).toISOString(), credentialId: 'c2' },
]

const credentials: Credential[] = [
  { id: 'c1', userId: 'u1', skillId: 's1', skillName: 'JavaScript Fundamentals', issuedAt: new Date(Date.now() - 86400000 * 3).toISOString(), txHash: '0x' + uuid().replace(/-/g, ''), qrCode: 'QR_c1_verify', level: 'beginner', verified: true },
  { id: 'c2', userId: 'u1', skillId: 's2', skillName: 'React Development', issuedAt: new Date(Date.now() - 86400000).toISOString(), txHash: '0x' + uuid().replace(/-/g, ''), qrCode: 'QR_c2_verify', level: 'intermediate', verified: true },
]

export const db = { users, skills, assessments, credentials, jobs }
