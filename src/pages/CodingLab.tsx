import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { api } from '../services/api'
import { Code, Play, CheckCircle, AlertCircle, Terminal, Loader, Mic, Bot, XCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import styles from './CodingLab.module.css'

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  language: string
  starterCode: string
}

export default function CodingLab() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [code, setCode] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [mentorResponse, setMentorResponse] = useState<string | null>(null)
  const { t } = useLang()
  const { refreshUser } = useAuth()

  useEffect(() => {
    api.get('/coding/challenges')
      .then(res => {
        setChallenges(res.data.data)
        if (res.data.data.length > 0) {
          selectChallenge(res.data.data[0])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const selectChallenge = (ch: Challenge) => {
    setSelectedChallenge(ch)
    setCode(ch.starterCode)
    setResults(null)
    setMentorResponse(null)
  }

  const runCode = async () => {
    if (!selectedChallenge) return
    setEvaluating(true)
    try {
      const res = await api.post('/coding/evaluate', {
        challengeId: selectedChallenge.id,
        code
      })
      setResults(res.data.data)
      if (res.data.data.allPassed) {
        await refreshUser()
      }
    } catch (err) {
      alert('Evaluation failed')
    } finally {
      setEvaluating(false)
    }
  }

  const handleVoiceHelp = () => {
    if (!window.hasOwnProperty('webkitSpeechRecognition')) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript
      if (!selectedChallenge) return

      try {
        const res = await api.post('/coding/tutor-voice-help', {
          challengeId: selectedChallenge.id,
          question: transcript
        })
        setMentorResponse(res.data.data)
      } catch (err) {
        console.error(err)
      }
    }

    recognition.start()
  }

  if (loading) return <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="spinner" /></div>

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.subtitle}>
            <Terminal size={14} /> Innovation Lab
          </div>
          <h1>Live Coding Environment</h1>
        </div>
        <div style={{ color: 'var(--text3)', fontSize: '0.8rem', fontWeight: 600 }}>
          {selectedChallenge?.language.toUpperCase()} ENGINE v1.0
        </div>
      </header>

      <main className={styles.mainGrid}>
        {/* Sidebar: Challenges */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Code size={18} className="text-primary" />
            <h2>Coding Challenges</h2>
          </div>
          <div className={styles.challengeList}>
            {challenges.map(ch => (
              <button
                key={ch.id}
                onClick={() => selectChallenge(ch)}
                className={`${styles.challengeItem} ${selectedChallenge?.id === ch.id ? styles.challengeItemActive : ''}`}
              >
                <div className={styles.challengeTitle}>{ch.title}</div>
                <div className={`${styles.diffBadge} ${styles[ch.difficulty]}`}>
                  {ch.difficulty}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Editor Area */}
        <section className={styles.editorContainer}>
          <div className={styles.editorHeader}>
            <div className={styles.fileName}>
              <Code size={14} /> solution.js
            </div>
            <div className={styles.controls}>
              <button 
                onClick={handleVoiceHelp}
                disabled={isListening}
                className={`btn btn-sm ${isListening ? `btn-danger ${styles.pulse}` : 'btn-secondary'}`}
                style={{ borderRadius: '12px' }}
              >
                <Mic size={14} />
                {isListening ? 'Listening...' : 'Voice Guidance'}
              </button>
              <button 
                onClick={runCode}
                disabled={evaluating}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: '12px', paddingLeft: '1.2rem', paddingRight: '1.2rem' }}
              >
                {evaluating ? <Loader className="animate-spin" size={14} /> : <Play size={14} fill="currentColor" />}
                Run Tests
              </button>
            </div>
          </div>
          
          <div style={{ flex: 1, position: 'relative' }}>
            {/* AI Mentor Notification */}
            {mentorResponse && (
              <div className={styles.mentorOverlay}>
                <div className={styles.mentorHeader}>
                  <div className={styles.mentorId}>
                    <Bot size={18} />
                    <span>AI Coding Tutor</span>
                  </div>
                  <button onClick={() => setMentorResponse(null)} className={styles.closeMentor}>
                    <XCircle size={18} />
                  </button>
                </div>
                <div className={styles.mentorContent}>
                  {mentorResponse}
                </div>
              </div>
            )}
            
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                padding: { top: 20 },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
              }}
            />
          </div>
        </section>

        {/* Info & Results Panel */}
        <section className={styles.infoPanel}>
          <div className={`${styles.card} ${styles.challengeDescContainer}`}>
            <h2>{selectedChallenge?.title}</h2>
            <div className={styles.descriptionText}>
              {selectedChallenge?.description}
            </div>
          </div>

          <div className={styles.card} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className={styles.outputHeader}>
              <span className={styles.outputTitle}>Compiler Output</span>
              {results && (
                <span style={{ 
                  color: results.success ? 'var(--success)' : 'var(--danger)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em'
                }}>
                  {results.success ? 'PASSED' : 'FAILED'}
                </span>
              )}
            </div>
            
            <div className={styles.outputBody}>
              {results ? (
                <div className="space-y-4">
                  {results.results.map((r: any, i: number) => (
                    <div key={i} className={`${styles.testCase} ${r.passed ? styles.testCasePassed : styles.testCaseFailed}`}>
                      {r.passed ? <CheckCircle className="text-success" size={16} /> : <AlertCircle className="text-danger" size={16} />}
                      <div className={styles.testInfo}>
                        <p style={{ color: r.passed ? 'var(--text)' : 'var(--danger)', fontWeight: 600 }}>
                          Test Case {i + 1}
                        </p>
                        {!r.passed && (
                          <div className={styles.testActual}>
                            Expected: {JSON.stringify(r.expected)} | Got: {JSON.stringify(r.actual || r.error)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {results.success && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                      <Sparkles size={24} className="text-success" style={{ margin: '0 auto 0.5rem' }} />
                      <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>Challenge Completed!</div>
                      <div style={{ color: 'var(--text2)', fontSize: '0.75rem' }}>+10 Imihigo Tokens earned</div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)', border: '2px dashed var(--border)', borderRadius: '16px' }}>
                  <Play size={24} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>Submit your solution to see test results</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
