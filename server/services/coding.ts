import { v4 as uuid } from 'uuid'
import { db, saveDb } from '../data/store.js'

export const codingService = {
  // Get all challenges
  getChallenges: async () => {
    return db.codeChallenges
  },

  // Get single challenge
  getChallengeById: async (id: string) => {
    const challenge = db.codeChallenges.find(ch => ch.id === id)
    if (!challenge) throw new Error('Challenge not found')
    return challenge
  },

  // Evaluate user submission
  evaluateSubmission: async (userId: string, challengeId: string, code: string) => {
    const challenge = db.codeChallenges.find(ch => ch.id === challengeId)
    if (!challenge) throw new Error('Challenge not found')

    let passedTests = 0
    const totalTests = challenge.testCases.length
    const results = []

    for (const test of challenge.testCases) {
      try {
        // Safe evaluation path using new Function sandbox (client-side style logic on server)
        // Note: For real production, we'd use 'isolated-vm' or a Docker runner.
        const runner = new Function('a', 'b', `${code}; return sum(a, b);`)
        const output = runner(test.input[0], test.input[1])
        const passed = JSON.stringify(output) === JSON.stringify(test.expectedOutput)
        
        if (passed) passedTests++
        
        results.push({
          input: test.isHidden ? '[HIDDEN]' : test.input,
          expected: test.isHidden ? '[HIDDEN]' : test.expectedOutput,
          actual: test.isHidden ? '[HIDDEN]' : output,
          passed
        })
      } catch (err: any) {
        results.push({
          error: err.message,
          passed: false
        })
      }
    }

    const submission = {
      id: uuid(),
      userId,
      challengeId,
      code,
      language: 'javascript',
      status: passedTests === totalTests ? ('passed' as const) : ('failed' as const),
      passedTests,
      totalTests,
      submittedAt: new Date().toISOString()
    }

    db.codeSubmissions.push(submission)

    // Update user tokens if passed
    if (submission.status === 'passed') {
      const user = db.users.find(u => u.id === userId)
      if (user) {
        user.tokens += challenge.points
      }
    }

    saveDb()

    return {
      submission,
      results
    }
  },

  // Get user's submission history
  getUserSubmissions: async (userId: string) => {
    return db.codeSubmissions.filter(s => s.userId === userId)
  },

  // AI Voice Tutor Logic
  getVoiceAdvice: async (challengeId: string, question: string) => {
    const challenge = db.codeChallenges.find(ch => ch.id === challengeId)
    const qLower = question.toLowerCase()
    
    // Simulate specialized coding AI for Kinyarwanda
    if (qLower.includes('loop') || qLower.includes('gusubiramo')) {
      return "Kugira ngo ukore 'loop' muri JavaScript, urugero nka 'for loop', ukoresha: for(let i=0; i < imyirondoro.length; i++). Ibi bigufasha gusubiramo ibintu byinshi mu buryo bworoshye."
    }
    if (qLower.includes('function') || qLower.includes('imikorere')) {
      return "Function ni nk'imashini. Uyigaburira amakuru (arguments) ikagusubiza igisubizo (return). Urugero: function mukore(a, b) { return a + b; }"
    }
    if (qLower.includes('variable') || qLower.includes('ihindurwa')) {
      return "Variable ni nk'agasanduku ubitsamo amakuru y'igihe gito. Ukoresha 'let' cyanga 'const' kugira ngo ukore variable nshya."
    }

    return `Ku kibazo cyawe kijyanye na '${challenge?.title || 'Coding'}', dore inama: ${question.length > 10 ? 'Gerageza kureba niba imikorere yawe yubahiriza amategeko ya logic.' : 'Nyamuneka saba ibisobanuro byimbitse.'} Imihigo Learn AI igufasha kumenya coding mu Kinyarwanda.`
  }
}
