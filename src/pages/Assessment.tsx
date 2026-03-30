import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Assessment.module.css'

interface Question {
  id: string
  text: string
  options: string[]
  answer: number
  points: number
}

export default function Assessment() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const skillId = params.get('skillId')
  const { token } = useAuth()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)
  const [timeLeft, setTimeLeft] = useState(30 * 60)

  useEffect(() => {
    if (!skillId || !token) return
    fetch(`/api/skills/${skillId}/questions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setQuestions(data.questions || []); setLoading(false) })
  }, [skillId, token])

  const handleSubmit = useCallback(async () => {
    if (!token || !id || submitting) return
    setSubmitting(true)
    const res = await fetch(`/api/assessments/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ answers }),
    })
    const data = await res.json()
    setResult({ score: data.score, passed: data.passed })
  }, [token, id, answers, submitting])

  useEffect(() => {
    if (!questions.length || result) return
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); handleSubmit(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [questions.length, result, handleSubmit])

  function selectAnswer(qId: string, optIdx: number) {
    setAnswers(a => ({ ...a, [qId]: optIdx }))
  }

  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><div className="spinner" /></div>

  if (result) {
    return (
      <div className="page">
        <div className={styles.resultPage}>
          <div className={styles.resultCard}>
            <div className={styles.resultIcon}>{result.passed ? '🏅' : '😔'}</div>
            <h1 className={styles.resultTitle}>{result.passed ? 'Assessment Passed!' : 'Not Passed'}</h1>
            <div className={styles.resultScore} style={{ color: result.passed ? '#10b981' : '#ef4444' }}>
              {result.score}%
            </div>
            <p className={styles.resultMsg}>
              {result.passed
                ? 'Congratulations! Your blockchain credential has been issued. Check your profile to see it.'
                : `You need 70% to pass. You scored ${result.score}%. You can try again after 24 hours.`}
            </p>
            {result.passed && (
              <div className={styles.credentialBadge}>
                🔗 Blockchain credential issued · +25 tokens earned
              </div>
            )}
            <div className={styles.resultActions}>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
              <button className="btn btn-secondary" onClick={() => navigate('/skills')}>More Skills</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) return (
    <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
      <div style={{ textAlign:'center' }}>
        <p>No questions found for this skill.</p>
        <button className="btn btn-primary mt-2" onClick={() => navigate('/skills')}>Back to Skills</button>
      </div>
    </div>
  )

  const q = questions[current]

  return (
    <div className="page">
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.progressInfo}>
            Question {current + 1} of {questions.length}
          </div>
          <div className={styles.timer} style={{ color: timeLeft < 120 ? '#ef4444' : '#f9fafb' }}>
            ⏱ {mins}:{secs.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="progress-bar" style={{ marginBottom: '2rem' }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.questionCard}>
          <div className={styles.questionNum}>Question {current + 1}</div>
          <h2 className={styles.questionText}>{q.text}</h2>

          <div className={styles.options}>
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={`${styles.option} ${answers[q.id] === i ? styles.optionSelected : ''}`}
                onClick={() => selectAnswer(q.id, i)}
              >
                <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.navButtons}>
          <button className="btn btn-secondary" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>← Previous</button>
          <div className={styles.dotNav}>
            {questions.map((_, i) => (
              <button key={i} className={`${styles.dot} ${i === current ? styles.dotCurrent : ''} ${answers[questions[i]?.id] !== undefined ? styles.dotAnswered : ''}`} onClick={() => setCurrent(i)} />
            ))}
          </div>
          {current < questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)}>Next →</button>
          ) : (
            <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : '✓ Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
