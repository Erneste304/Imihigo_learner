import natural from 'natural'

const TfIdf = natural.TfIdf
const tokenizer = new natural.WordTokenizer()

// Simple dictionary of skills we want to detect
const SKILLS_DICT = [
  'javascript', 'typescript', 'react', 'node', 'express', 'python', 'django',
  'java', 'spring', 'go', 'rust', 'c++', 'c#', 'aws', 'docker', 'kubernetes',
  'sql', 'postgresql', 'mongodb', 'redis', 'machine learning', 'data analysis',
  'ui', 'ux', 'agile', 'scrum', 'html', 'css', 'git'
]

export const parseResumeText = (text: string) => {
  const lowercaseText = text.toLowerCase()
  const tokens = tokenizer.tokenize(lowercaseText) || []
  
  // 1. Extract Skills
  const extractedSkills = new Set<string>()
  
  // Basic keyword matching
  SKILLS_DICT.forEach(skill => {
    if (lowercaseText.includes(skill)) {
      extractedSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1))
    }
  })

  // TF-IDF for finding prominent terms that might be relevant (simplified)
  const tfidf = new TfIdf()
  tfidf.addDocument(lowercaseText)
  
  // 2. Extract Years of Experience (heuristic based)
  let yoe = 0
  const expMatch = lowercaseText.match(/(\d+)\+?\s*(years?|yrs?)\s+of\s+experience/i)
  if (expMatch && expMatch[1]) {
    yoe = parseInt(expMatch[1], 10)
  }

  // 3. Extract Education Details (heuristic)
  let hasDegree = false
  if (lowercaseText.includes('bachelor') || lowercaseText.includes('bsc') || lowercaseText.includes('master') || lowercaseText.includes('msc') || lowercaseText.includes('phd')) {
    hasDegree = true
  }

  return {
    skills: Array.from(extractedSkills),
    yearsOfExperience: yoe,
    hasDegree,
    originalWordCount: tokens.length
  }
}
