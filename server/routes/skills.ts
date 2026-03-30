import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { db } from '../data/store.js'

const router = Router()

router.get('/', (_req, res: Response) => {
  res.json(db.skills)
})

router.get('/:id', (req, res: Response) => {
  const skill = db.skills.find(s => s.id === req.params.id)
  if (!skill) return res.status(404).json({ error: 'Skill not found' })
  res.json(skill)
})

router.get('/:id/questions', authenticate, (req: AuthRequest, res: Response) => {
  const skill = db.skills.find(s => s.id === req.params.id)
  if (!skill) return res.status(404).json({ error: 'Skill not found' })

  const questions = generateQuestions(skill.name, skill.questionsCount)
  res.json({ skillId: skill.id, skillName: skill.name, questions })
})

function generateQuestions(skillName: string, count: number) {
  const pool: Record<string, any[]> = {
    'JavaScript Fundamentals': [
      { id: 'q1', text: 'What is the output of `typeof null`?', options: ['null', 'object', 'undefined', 'string'], answer: 1, points: 4 },
      { id: 'q2', text: 'Which method removes the last element of an array?', options: ['shift()', 'pop()', 'slice()', 'splice()'], answer: 1, points: 4 },
      { id: 'q3', text: 'What does `===` do in JavaScript?', options: ['Assigns a value', 'Loose equality', 'Strict equality', 'Compares types only'], answer: 2, points: 4 },
      { id: 'q4', text: 'What is a closure?', options: ['A function with no return', 'A loop structure', 'A function accessing its outer scope', 'An async function'], answer: 2, points: 6 },
      { id: 'q5', text: 'Which is NOT a JavaScript data type?', options: ['String', 'Boolean', 'Float', 'Symbol'], answer: 2, points: 4 },
    ],
    'React Development': [
      { id: 'q1', text: 'What hook manages local component state?', options: ['useEffect', 'useContext', 'useState', 'useRef'], answer: 2, points: 4 },
      { id: 'q2', text: 'What is JSX?', options: ['A JavaScript library', 'A syntax extension for JS', 'A CSS preprocessor', 'A database language'], answer: 1, points: 4 },
      { id: 'q3', text: 'When does useEffect run by default?', options: ['Only on mount', 'Never', 'After every render', 'Only on unmount'], answer: 2, points: 4 },
      { id: 'q4', text: 'What is the key prop used for in lists?', options: ['Styling', 'Unique element identification', 'Event handling', 'State management'], answer: 1, points: 6 },
      { id: 'q5', text: 'What is the Context API used for?', options: ['HTTP requests', 'Global state sharing', 'Routing', 'Form validation'], answer: 1, points: 6 },
    ],
  }

  const defaultQ = Array.from({ length: count }, (_, i) => ({
    id: `q${i + 1}`,
    text: `${skillName} question ${i + 1}: Which approach is best practice?`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    answer: Math.floor(Math.random() * 4),
    points: 4,
  }))

  const questions = pool[skillName] || defaultQ
  return questions.slice(0, Math.min(count, 10))
}

export default router
