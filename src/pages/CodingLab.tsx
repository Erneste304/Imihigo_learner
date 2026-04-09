import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { api } from '../services/api'
import { Code, Play, CheckCircle, AlertCircle, Terminal, Loader, Mic, Bot, XCircle } from 'lucide-react'
import { useLang } from '../context/LangContext'

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
    recognition.lang = 'en-US' // Standard for mix, but we can detect Kinyarwanda rhythm
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

  if (loading) return <div className="page flex justify-center py-20"><div className="spinner" /></div>

  return (
    <div className="page" style={{ maxWidth: '1400px' }}>
      <header className="mb-8 border-b dark:border-gray-800 pb-6">
        <div className="flex items-center gap-3 text-blue-600 mb-2">
          <Terminal size={24} />
          <span className="font-bold tracking-widest uppercase text-xs">Innovation Lab</span>
        </div>
        <h1 className="text-3xl font-bold dark:text-white">Live Coding Environment</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[700px]">
        {/* Sidebar: Challenges */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 overflow-hidden flex flex-col">
          <div className="p-6 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-bold flex items-center gap-2">
              <Code size={18} /> Challenges
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {challenges.map(ch => (
              <button
                key={ch.id}
                onClick={() => selectChallenge(ch)}
                className={`w-full text-left p-4 rounded-2xl transition-all ${
                  selectedChallenge?.id === ch.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="font-bold mb-1 truncate">{ch.title}</div>
                <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block ${
                  selectedChallenge?.id === ch.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {ch.difficulty}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Description & Output */}
            <div className="flex flex-col gap-6 h-full overflow-hidden">
              <div className="bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 p-6 flex-1 overflow-y-auto shadow-sm">
                <h3 className="text-xl font-bold mb-4 dark:text-white">{selectedChallenge?.title}</h3>
                <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-400">
                  {selectedChallenge?.description}
                </div>
              </div>

              <div className="bg-gray-900 rounded-3xl p-6 h-64 overflow-y-auto font-mono text-sm shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
                  <span className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Compiler Output</span>
                  {results && (
                    <span className={results.success ? 'text-green-500' : 'text-red-500'}>
                      {results.success ? 'PASSED' : 'FAILED'}
                    </span>
                  )}
                </div>
                {results ? (
                  <div className="space-y-4">
                    {results.results.map((r: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        {r.passed ? <CheckCircle className="text-green-500 mt-1" size={14} /> : <AlertCircle className="text-red-500 mt-1" size={14} />}
                        <div>
                          <p className="text-gray-400">Test Case {i + 1}: {r.passed ? 'Success' : 'Fail'}</p>
                          {!r.passed && (
                            <p className="text-red-400 text-xs mt-1">Expected: {r.expected} | Got: {r.actual || r.error}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-600 italic">Run your code to see results...</div>
                )}
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 overflow-hidden flex flex-col shadow-sm">
              <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/30">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">solution.js</div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleVoiceHelp}
                    disabled={isListening}
                    className={`btn btn-sm flex items-center gap-2 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-green-600 text-white'}`}
                  >
                    <Mic size={14} />
                    {isListening ? 'Listening...' : 'Voice Guidance'}
                  </button>
                  <button 
                    onClick={runCode}
                    disabled={evaluating}
                    className="btn btn-primary btn-sm flex items-center gap-2"
                  >
                    {evaluating ? <Loader className="animate-spin" size={14} /> : <Play size={14} fill="currentColor" />}
                    Run Tests
                  </button>
                </div>
              </div>
              
              {/* Mentor Chat Bubble */}
              {mentorResponse && (
                <div className="absolute top-20 left-10 right-10 z-20 bg-blue-900/95 text-white p-6 rounded-3xl border border-blue-400 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <Bot size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-200 mb-1 flex items-center justify-between">
                        AI Coding Tutor (Kinyarwanda)
                        <button onClick={() => setMentorResponse(null)} className="text-blue-300 hover:text-white">
                          <XCircle size={20} />
                        </button>
                      </h4>
                      <p className="text-sm leading-relaxed">{mentorResponse}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex-1">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 20 },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
