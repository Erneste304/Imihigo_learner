import { Router, Request, Response } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')
import { parseResumeText } from '../services/ai-parser.js'
import { db } from '../data/store.js'

const router = Router()

const uploadDir = path.join(process.cwd(), 'uploads', 'resumes')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only standard PDF format is allowed'))
  }
})

router.post('/upload', upload.single('resume'), async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file provided' })
    }

    const userId = req.body.userId || 'anon'
    
    // Read PDF contents and parse text
    const dataBuffer = fs.readFileSync(req.file.path)
    const pdfFn = pdfParse as any
    const pdfData = await pdfFn(dataBuffer)

    // Run Natural Language Processing on the extracted text
    const aiAnalysis = parseResumeText(pdfData.text)

    // Update the mock database user if found
    const user = db.users.find(u => u.id === userId)
    if (user) {
      // Append new skills extracted from the resume
      const currentSkills = new Set(user.skills)
      aiAnalysis.skills.forEach(s => currentSkills.add(s))
      user.skills = Array.from(currentSkills)
    }

    return res.json({ 
      success: true, 
      message: 'Resume parsed successfully', 
      data: {
        filename: req.file.filename,
        resumeTextLength: pdfData.text.length,
        extracted: aiAnalysis
      }
    })

  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Parsing failed', error: error.message })
  }
})

export default router
