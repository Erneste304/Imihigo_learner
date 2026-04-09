import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.join(__dirname, 'db.json')

// --- CORE USER MODELS ---
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

export interface Education {
  school: string
  degree: string
  field: string
  startYear: string
  endYear?: string
}

export interface Experience {
  company: string
  position: string
  location: string
  startDate: string
  endDate?: string
  current: boolean
  description: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'jobseeker' | 'employer' | 'admin' | 'instructor'
  avatar?: string
  bio?: string
  location?: string
  skills: string[]
  education: Education[]
  experience: Experience[]
  trustScore: number
  verified: boolean
  createdAt: string
  tokens: number
}

// --- SKILL & ASSESSMENT MODELS ---
export interface Skill {
  id: string
  name: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  description: string
  icon: string
  questionsCount: number
}

export interface Assessment {
  id: string
  userId: string
  skillId: string
  status: 'in-progress' | 'completed' | 'failed'
  score: number
  passed: boolean
  startedAt: string
  completedAt?: string
  credentialId?: string
}

export interface Credential {
  id: string
  userId: string
  skillId: string
  skillName: string
  issuedAt: string
  txHash: string
  qrCode: string
  level: string
  verified: boolean
}

// --- JOB MODELS ---
export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'gig'
  salary?: string
  description: string
  requiredSkills: string[]
  remote: boolean
  postedAt: string
  employerId: string
}

export interface JobApplication {
  id: string
  jobId: string
  userId: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  appliedAt: string
  pitch?: string
}

// --- MENTORSHIP MODELS ---
export interface AvailabilitySlot {
  id: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:MM format
  endTime: string
  timezone: string
}

export interface Mentor {
  id: string
  userId: string
  skills: string[]
  hourlyRate: number
  availability: AvailabilitySlot[]
  rating: number
  totalSessions: number
  verified: boolean
  bio: string
  languages: string[]
}

export interface Mentee {
  id: string
  userId: string
  interests: string[]
  preferredSkills: string[]
  budget: number
  learningGoals: string[]
}

export interface SessionFeedback {
  rating: number // 1-5
  comment: string
  mentorRating?: number
  menteeRating?: number
  submittedAt: string
}

export interface MentorshipSession {
  id: string
  mentorId: string
  menteeId: string
  scheduledAt: string
  duration: number // in minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  topic: string
  notes?: string
  meetingLink?: string
  feedback?: SessionFeedback
  createdAt: string
}

export interface MentorshipRequest {
  id: string
  mentorId: string
  menteeId: string
  message: string
  proposedTopics: string[]
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

// --- CODING MODELS ---
export interface TestCase {
  input: any
  expectedOutput: any
  isHidden: boolean
}

export interface CodingChallenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  language: string
  starterCode: string
  testCases: TestCase[]
  timeLimit: number // in minutes
  points: number
}

export interface CodeSubmission {
  id: string
  userId: string
  challengeId: string
  code: string
  language: string
  status: 'pending' | 'passed' | 'failed' | 'error'
  output?: string
  executionTime?: number
  passedTests: number
  totalTests: number
  submittedAt: string
}

// --- STUDY GROUP MODELS ---
export interface GroupResource {
  id: string
  title: string
  description: string
  url: string
  type: 'video' | 'document' | 'link' | 'code'
  uploadedBy: string
  uploadedAt: string
}

export interface DiscussionReply {
  id: string
  userId: string
  message: string
  createdAt: string
}

export interface GroupDiscussion {
  id: string
  groupId: string
  userId: string
  message: string
  replies: DiscussionReply[]
  createdAt: string
}

export interface StudyGroup {
  id: string
  name: string
  description: string
  topic: string
  creatorId: string
  members: { userId: string; role: 'admin' | 'member'; joinedAt: string }[]
  maxMembers: number
  isPublic: boolean
  meetingSchedule: {
    frequency: 'daily' | 'weekly' | 'biweekly'
    dayOfWeek?: number
    time: string
    timezone: string
    nextMeeting: string
  }
  resources: GroupResource[]
  createdAt: string
}

// --- CERTIFICATION & PRICING MODELS ---
export interface InternationalCertificate {
  id: string
  userId: string
  courseId: string
  courseName: string
  certificateId: string // The formal number
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  score: number
  issuedBy: 'IMIHIGO' | 'PARTNER_INSTITUTION'
  isValidGlobally: boolean
  blockchainTx: string
  verificationCode: string
  issuedAt: string
  pdfUrl?: string
  paymentStatus: 'paid' | 'pending' | 'free'
}

export interface Course {
  id: string
  title: string
  instructorId: string
  description: string
  price: number
  certificateFee: number
  enrolledCount: number
  createdAt: string
}

export interface AdminSetting {
  key: string
  value: any
  description: string
}

// --- API & PUBLIC MODELS ---
export interface APIKey {
  id: string
  userId: string
  apiKey: string
  apiSecret: string
  name: string
  permissions: string[]
  rateLimit: number
  createdAt: string
  lastUsed?: string
}


// --- INITIAL DATA SEED ---
const skills: Skill[] = [
  { id: 's1', name: 'JavaScript Fundamentals', category: 'Programming', level: 'beginner', description: 'Core syntax, types, and logic.', icon: '📜', questionsCount: 5 },
  { id: 's2', name: 'React Development', category: 'Frontend', level: 'intermediate', description: 'Components, hooks, and state management.', icon: '⚛️', questionsCount: 5 },
  { id: 's3', name: 'Node.js Backend', category: 'Backend', level: 'intermediate', description: 'Server-side JS with Express.', icon: '🟢', questionsCount: 5 },
]

const users: User[] = [
  {
    id: 'u1',
    name: 'Alice Uwimana',
    email: 'alice@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'instructor',
    location: 'Kigali, Rwanda',
    bio: 'Lead Engineer and Mentor at Imihigo Learn.',
    skills: ['JavaScript', 'React', 'Node.js'],
    education: [
      { school: 'University of Rwanda', degree: 'Bachelors', field: 'Computer Science', startYear: '2018', endYear: '2022' }
    ],
    experience: [
      { company: 'Kigali Tech Hub', position: 'Senior Developer', location: 'Kigali', startDate: '2022-01-01', current: true, description: 'Leading frontend teams.' }
    ],
    trustScore: 85,
    verified: true,
    createdAt: new Date().toISOString(),
    tokens: 1500,
  },
  {
    id: 'u2',
    name: 'Bob Nkurunziza',
    email: 'bob@employer.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'admin',
    location: 'Kigali, Rwanda',
    bio: 'Platform Administrator',
    skills: [],
    education: [],
    experience: [],
    trustScore: 100,
    verified: true,
    createdAt: new Date().toISOString(),
    tokens: 0,
  },
]

const jobs: Job[] = [
  {
    id: 'j1',
    title: 'Frontend Developer',
    company: 'Innovate Rwanda',
    location: 'Kigali',
    type: 'full-time',
    salary: '$1200 - $1800',
    description: 'Looking for a React expert to build modern web apps.',
    requiredSkills: ['React Development', 'JavaScript Fundamentals'],
    remote: true,
    postedAt: new Date().toISOString(),
    employerId: 'u2'
  },
  {
    id: 'j2',
    title: 'Backend Engineer',
    company: 'Rwanda Digitals',
    location: 'Remera',
    type: 'contract',
    salary: '$1000',
    description: 'Help us scale our Node.js microservices.',
    requiredSkills: ['Node.js Backend'],
    remote: false,
    postedAt: new Date().toISOString(),
    employerId: 'u2'
  }
]

const assessments: Assessment[] = []
const credentials: Credential[] = []
const mentors: Mentor[] = [
  {
    id: 'mentor_1',
    userId: 'u1',
    skills: ['React', 'Node.js', 'TypeScript', 'Full Stack Development'],
    hourlyRate: 25,
    availability: [
      { id: 'av1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', timezone: 'Africa/Kigali' },
      { id: 'av2', dayOfWeek: 3, startTime: '09:00', endTime: '12:00', timezone: 'Africa/Kigali' },
    ],
    rating: 4.8,
    totalSessions: 45,
    verified: true,
    bio: 'Senior Full Stack Developer with 7+ years experience. Passionate about teaching.',
    languages: ['English', 'Kinyarwanda']
  }
]

const codeChallenges: CodingChallenge[] = [
  {
    id: 'challenge_1',
    title: 'Sum of Two Numbers',
    description: 'Write a function that takes two numbers and returns their sum.',
    difficulty: 'easy',
    language: 'javascript',
    starterCode: `function sum(a, b) {\n  // Your code here\n  \n}`,
    testCases: [
      { input: [1, 2], expectedOutput: 3, isHidden: false },
      { input: [5, 7], expectedOutput: 12, isHidden: false },
      { input: [-1, 1], expectedOutput: 0, isHidden: true }
    ],
    timeLimit: 5,
    points: 10
  }
]

const adminSettings: AdminSetting[] = [
  { key: 'global_certificate_fee', value: 50, description: 'International Certificate Fee (USD)' },
  { key: 'instructor_revenue_share', value: 70, description: 'Percentage share for instructors (%)' },
  { key: 'platform_fee', value: 30, description: 'Platform fee percentage (%)' },
]

// Empty lists for operation
const mentees: Mentee[] = []
const mentorshipSessions: MentorshipSession[] = []
const mentorshipRequests: MentorshipRequest[] = []
const codeSubmissions: CodeSubmission[] = []
const studyGroups: StudyGroup[] = []
const groupDiscussions: GroupDiscussion[] = []
const internationalCertificates: InternationalCertificate[] = []
const apiKeys: APIKey[] = []
const courses: Course[] = [
  { id: 'co1', title: 'React Mastery', instructorId: 'u1', description: 'Advanced React patterns and performance.', price: 50, certificateFee: 20, enrolledCount: 124, createdAt: new Date().toISOString() }
]

const defaultDb = { 
  users, 
  skills,
  jobs,
  assessments,
  credentials,
  mentors, 
  mentees, 
  mentorshipSessions, 
  mentorshipRequests, 
  codeChallenges, 
  codeSubmissions, 
  studyGroups, 
  groupDiscussions, 
  internationalCertificates, 
  courses, 
  adminSettings,
  apiKeys,
  jobApplications: [] as JobApplication[],
  activities: [] as any[],
  gamificationProfiles: [] as GamificationProfile[]
}

export let db = defaultDb

// Initialize from file if exists
if (fs.existsSync(DB_FILE)) {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8')
    db = JSON.parse(data)
    console.log('✅ Mock Database loaded from persistence.')
  } catch (e) {
    console.error('❌ Failed to load persistence, using defaults.')
  }
}

export const saveDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
  } catch (e) {
    console.error('❌ Failed to save persistence.')
  }
}

