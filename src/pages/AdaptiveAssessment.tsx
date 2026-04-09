import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Helmet } from 'react-helmet-async'
import { Brain, ChevronRight, ChevronLeft, CheckCircle, XCircle, TrendingUp, Award, BarChart3 } from 'lucide-react'

interface AdaptiveQuestion {
  id: string
  skill: string
  level: 'easy' | 'medium' | 'hard'
  question: string
  options: string[]
  correct: number
  explanation: string
  points: number
}

// Question bank by difficulty
const questionBank: Record<string, AdaptiveQuestion[]> = {
  easy: [
    { id: 'e1', skill: 'JavaScript', level: 'easy', question: 'Which keyword declares a variable that cannot be reassigned?', options: ['var', 'let', 'const', 'static'], correct: 2, explanation: '`const` prevents reassignment but allows mutation of objects.', points: 10 },
    { id: 'e2', skill: 'JavaScript', level: 'easy', question: 'What does `typeof null` return in JavaScript?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correct: 2, explanation: '`typeof null` is "object" — a historical JavaScript quirk.', points: 10 },
    { id: 'e3', skill: 'JavaScript', level: 'easy', question: 'Which array method creates a new array with every element transformed?', options: ['filter()', 'map()', 'reduce()', 'forEach()'], correct: 1, explanation: '`map()` returns a new array of equal length with transformed values.', points: 10 },
  ],
  medium: [
    { id: 'm1', skill: 'JavaScript', level: 'medium', question: 'What is the output of `[] + []` in JavaScript?', options: ['""', '"[][]"', '"undefined"', 'SyntaxError'], correct: 0, explanation: 'Arrays coerce to empty strings, so `[] + []` produces `""`', points: 20 },
    { id: 'm2', skill: 'JavaScript', level: 'medium', question: 'Which method removes the first element of an array and returns it?', options: ['pop()', 'shift()', 'splice()', 'slice()'], correct: 1, explanation: '`shift()` removes from the start; `pop()` from the end.', points: 20 },
    { id: 'm3', skill: 'JavaScript', level: 'medium', question: 'Which of these correctly creates a deep copy of an object?', options: ['Object.assign({}, obj)', '{ ...obj }', 'JSON.parse(JSON.stringify(obj))', 'obj.copy()'], correct: 2, explanation: 'JSON parse/stringify is a common deep-copy hack for simple objects.', points: 20 },
  ],
  hard: [
    { id: 'h1', skill: 'JavaScript', level: 'hard', question: 'What does the microtask queue process BEFORE in the event loop?', options: ['setTimeout callbacks', 'setInterval callbacks', 'I/O callbacks', 'All of the above'], correct: 3, explanation: 'Microtasks (Promises) always run before any macrotasks in the event loop.', points: 30 },
    { id: 'h2', skill: 'JavaScript', level: 'hard', question: 'What is the result of `(function(){ return typeof arguments })()` ?', options: ['"object"', '"array"', '"undefined"', '"arguments"'], correct: 0, explanation: '`arguments` is an array-like object, so typeof returns "object".', points: 30 },
    { id: 'h3', skill: 'JavaScript', level: 'hard', question: 'Which term describes the JS engine\'s ability to run non-blocking I/O despite being single-threaded?', options: ['Concurrency', 'Parallelism', 'Event Loop', 'Worker Thread'], correct: 2, explanation: 'The Event Loop allows async I/O operations to be handled non-blockingly.', points: 30 },
  ]
}

type DifficultyLevel = 'easy' | 'medium' | 'hard'

export default function AdaptiveAssessment() {
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [started, setStarted] = useState(false)
  const [currentLevel, setCurrentLevel] = useState<DifficultyLevel>('easy')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [wrongStreak, setWrongStreak] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [history, setHistory] = useState<{ question: string; correct: boolean; level: DifficultyLevel }[]>([])
  const [finished, setFinished] = useState(false)

  const TOTAL_QUESTIONS = 9

  const questions = questionBank[currentLevel]
  const currentQ = questions[questionIndex % questions.length]

  const handleConfirm = () => {
    if (selectedOption === null) return
    const isCorrect = selectedOption === currentQ.correct
    setConfirmed(true)

    const newHistory = [...history, { question: currentQ.question, correct: isCorrect, level: currentLevel }]
    setHistory(newHistory)
    setTotalAnswered(prev => prev + 1)

    if (isCorrect) {
      setTotalScore(prev => prev + currentQ.points)
      const newStreak = correctStreak + 1
      setCorrectStreak(newStreak)
      setWrongStreak(0)
      // Level up after 2 correct in a row
      if (newStreak >= 2 && currentLevel === 'easy') {
        setCurrentLevel('medium')
        setCorrectStreak(0)
        setQuestionIndex(0)
      } else if (newStreak >= 2 && currentLevel === 'medium') {
        setCurrentLevel('hard')
        setCorrectStreak(0)
        setQuestionIndex(0)
      }
    } else {
      const newWrong = wrongStreak + 1
      setWrongStreak(newWrong)
      setCorrectStreak(0)
      // Level down after 2 wrong in a row
      if (newWrong >= 2 && currentLevel === 'hard') {
        setCurrentLevel('medium')
        setWrongStreak(0)
        setQuestionIndex(0)
      } else if (newWrong >= 2 && currentLevel === 'medium') {
        setCurrentLevel('easy')
        setWrongStreak(0)
        setQuestionIndex(0)
      }
    }
  }

  const handleNext = () => {
    if (totalAnswered + 1 >= TOTAL_QUESTIONS) {
      setFinished(true)
      return
    }
    setSelectedOption(null)
    setConfirmed(false)
    setQuestionIndex(prev => prev + 1)
  }

  const maxScore = 9 * 30 // All hard
  const percentage = Math.round((totalScore / maxScore) * 100)

  const levelColors: Record<DifficultyLevel, string> = {
    easy: '#10b981',
    medium: '#f59e0b',
    hard: '#ef4444'
  }

  if (!token) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
      <Brain size={48} style={{ color: '#6366f1', opacity: 0.5 }} />
      <p style={{ color: '#94a3b8' }}>Please sign in to take an AI-adaptive assessment.</p>
      <button className="btn btn-primary" onClick={() => navigate('/auth')}>Sign In</button>
    </div>
  )

  if (finished) {
    const grade = percentage >= 70 ? 'Proficient' : percentage >= 50 ? 'Developing' : 'Beginner'
    const gradeColor = percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'

    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 1rem' }}>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '3rem', maxWidth: 600, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧠</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>Assessment Complete!</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2.5rem' }}>Your AI-powered skill evaluation is done. Here are your results.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Score', value: `${totalScore} pts`, icon: '🎯' },
              { label: 'Grade', value: grade, icon: '📊', color: gradeColor },
              { label: 'Rank', value: currentLevel.toUpperCase(), icon: '🏆', color: levelColors[currentLevel] },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#1f2937', borderRadius: 16, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: stat.color || '#fff' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#1f2937', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question Review</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  {h.correct ? <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} /> : <XCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />}
                  <span style={{ flex: 1, lineHeight: '1.3' }}>{h.question}</span>
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 6, background: `${levelColors[h.level]}22`, color: levelColors[h.level], fontWeight: 700, flexShrink: 0 }}>{h.level}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/skills')}>Take Formal Assessment</button>
            <button className="btn btn-primary" onClick={() => { setFinished(false); setStarted(false); setTotalScore(0); setTotalAnswered(0); setCurrentLevel('easy'); setHistory([]); setQuestionIndex(0); setCorrectStreak(0); setWrongStreak(0) }}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!started) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '2rem' }}>
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '3rem', maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          <Brain size={40} style={{ color: '#6366f1' }} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>AI Adaptive Assessment</h1>
        <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '2rem' }}>
          This intelligent assessment adjusts to your skill level in real time. Answer correctly to face harder questions and earn more points. Struggle, and it levels down to help you improve.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { icon: <Brain size={20} style={{ color: '#6366f1' }} />, label: 'AI-Adaptive Difficulty' },
            { icon: <TrendingUp size={20} style={{ color: '#10b981' }} />, label: 'Real-time Level Adjustment' },
            { icon: <Award size={20} style={{ color: '#f59e0b' }} />, label: '9 Questions Total' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#1f2937', borderRadius: 12, padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ marginBottom: '0.5rem' }}>{f.icon}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{f.label}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 800 }} onClick={() => setStarted(true)}>
          Start Adaptive Test <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )

  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', padding: '3rem 1rem' }}>
      <Helmet><title>AI Adaptive Assessment | Imihigo Learn</title></Helmet>
      <div style={{ maxWidth: 720, width: '100%' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>Question {totalAnswered + 1} of {TOTAL_QUESTIONS}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: levelColors[currentLevel], background: `${levelColors[currentLevel]}22`, padding: '0.25rem 0.75rem', borderRadius: 8, border: `1px solid ${levelColors[currentLevel]}44`, textTransform: 'uppercase' }}>
              {currentLevel} Mode
            </span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100 }}>
            <div style={{ height: '100%', background: '#6366f1', borderRadius: 100, width: `${(totalAnswered / TOTAL_QUESTIONS) * 100}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Question Card */}
        <div style={{ background: '#111827', border: `1px solid ${confirmed ? (selectedOption === currentQ.correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)') : 'rgba(255,255,255,0.06)'}`, borderRadius: 24, padding: '2.5rem', marginBottom: '1.5rem', transition: 'border-color 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: 10, padding: '0.5rem' }}>
              <Brain size={20} style={{ color: '#6366f1' }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{currentQ.skill} · {currentQ.level}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 800, color: levelColors[currentLevel] }}>+{currentQ.points} pts</span>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', lineHeight: '1.5', marginBottom: '2rem' }}>
            {currentQ.question}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentQ.options.map((opt, idx) => {
              let bg = 'rgba(255,255,255,0.03)'
              let border = 'rgba(255,255,255,0.08)'
              let color = '#d1d5db'

              if (confirmed) {
                if (idx === currentQ.correct) { bg = 'rgba(16,185,129,0.1)'; border = '#10b981'; color = '#10b981' }
                else if (idx === selectedOption) { bg = 'rgba(239,68,68,0.1)'; border = '#ef4444'; color = '#ef4444' }
              } else if (selectedOption === idx) {
                bg = 'rgba(99,102,241,0.1)'; border = '#6366f1'; color = '#818cf8'
              }

              return (
                <button key={idx} disabled={confirmed}
                  onClick={() => setSelectedOption(idx)}
                  style={{ padding: '1rem 1.25rem', borderRadius: 14, background: bg, border: `1.5px solid ${border}`, color, fontWeight: 600, fontSize: '0.95rem', textAlign: 'left', cursor: confirmed ? 'default' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: border, borderRadius: 6, padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 800, color }}>{String.fromCharCode(65 + idx)}</span>
                  {opt}
                  {confirmed && idx === currentQ.correct && <CheckCircle size={16} style={{ marginLeft: 'auto', color: '#10b981' }} />}
                  {confirmed && idx === selectedOption && idx !== currentQ.correct && <XCircle size={16} style={{ marginLeft: 'auto', color: '#ef4444' }} />}
                </button>
              )
            })}
          </div>

          {confirmed && (
            <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(99,102,241,0.06)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.15)' }}>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.5' }}>
                <span style={{ color: '#818cf8', fontWeight: 700 }}>💡 Explanation: </span>
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
              <CheckCircle size={14} /> {history.filter(h => h.correct).length} correct
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#ef4444', fontWeight: 700 }}>
              <XCircle size={14} /> {history.filter(h => !h.correct).length} wrong
            </div>
          </div>

          {!confirmed ? (
            <button className="btn btn-primary" disabled={selectedOption === null} onClick={handleConfirm}>
              Confirm Answer <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleNext}>
              {totalAnswered + 1 >= TOTAL_QUESTIONS ? 'See Results' : 'Next Question'} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
