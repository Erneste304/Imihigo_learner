import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { BookOpen, CheckCircle, Clock, Users, Award, ChevronLeft, FileText, Video, Play, Lock } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  type: 'note' | 'video'
  content: string
  videoUrl: string
  order: number
  duration: number
}

interface Course {
  id: string
  title: string
  description: string
  instructorName: string
  category: string
  level: string
  price: number
  certificateFee: number
  enrolledCount: number
  lessons: Lesson[]
  tags: string[]
}

interface Enrollment {
  id: string
  completedLessons: string[]
  completed: boolean
  certificateId?: string
  paid: boolean
}

const levelColor: Record<string, string> = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' }

export default function CourseLearner() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token, user } = useAuth()

  const [course, setCourse] = useState<Course | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/courses/${id}/enrollment`),
    ]).then(([cr, er]) => {
      if (cr.data.success) {
        const c = cr.data.data
        const sorted = [...(c.lessons || [])].sort((a: Lesson, b: Lesson) => a.order - b.order)
        setCourse({ ...c, lessons: sorted })
        if (sorted.length > 0) setActiveLesson(sorted[0])
      }
      if (er.data.success) setEnrollment(er.data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  async function enroll() {
    if (!token) { navigate('/auth'); return }
    setEnrolling(true)
    try {
      const res = await api.post(`/courses/${id}/enroll`, {})
      if (res.data.success) setEnrollment(res.data.data)
    } catch (e: any) {
      if (e?.response?.status === 409) setEnrollment({ id: '', completedLessons: [], completed: false, paid: true })
      else alert(e?.response?.data?.message || 'Failed to enroll.')
    } finally { setEnrolling(false) }
  }

  async function markComplete(lessonId: string) {
    if (!enrollment) return
    setCompleting(true)
    try {
      const res = await api.put(`/courses/${id}/lessons/${lessonId}/complete`, {})
      if (res.data.success) {
        setEnrollment(res.data.data)
        const lessons = course?.lessons || []
        const idx = lessons.findIndex(l => l.id === lessonId)
        if (idx < lessons.length - 1) setActiveLesson(lessons[idx + 1])
      }
    } catch (e) {
      console.error(e)
    } finally { setCompleting(false) }
  }

  if (loading) return <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="spinner" /></div>
  if (!course) return <div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}><p style={{ color: '#94a3b8' }}>Course not found.</p></div>

  const lessons = course.lessons || []
  const totalLessons = lessons.length
  const completedCount = enrollment?.completedLessons?.length || 0
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const isCompleted = (lessonId: string) => enrollment?.completedLessons?.includes(lessonId)
  const isActiveCompleted = activeLesson ? isCompleted(activeLesson.id) : false

  return (
    <div className="page" style={{ padding: 0 }}>

      {/* Top bar */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate('/courses')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.6rem', padding: '0.4rem 0.8rem', cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem' }}>
          <ChevronLeft size={16} /> Back
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>by {course.instructorName}</div>
        </div>
        {enrollment && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{completedCount}/{totalLessons} lessons</div>
            <div style={{ width: 100, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: progressPct === 100 ? '#10b981' : '#6366f1', borderRadius: '100px', width: `${progressPct}%`, transition: 'width 0.4s' }} />
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: progressPct === 100 ? '#10b981' : '#818cf8' }}>{progressPct}%</div>
          </div>
        )}
      </div>

      {/* Not enrolled: info page */}
      {!enrollment ? (
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2.5rem', alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '100px', background: `${levelColor[course.level] || '#6366f1'}22`, color: levelColor[course.level] || '#818cf8', border: `1px solid ${levelColor[course.level] || '#6366f1'}44`, textTransform: 'capitalize' }}>{course.level}</span>
                {course.category && <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '100px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>{course.category}</span>}
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.25 }}>{course.title}</h1>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '1.5rem' }}>{course.description}</p>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BookOpen size={16} /> {totalLessons} lessons</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={16} /> {course.enrolledCount} students</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16} /> {lessons.reduce((s, l) => s + (l.duration || 0), 0)} min total</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Award size={16} /> Certificate included</span>
              </div>

              <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.05rem' }}>Course Content</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {lessons.map((l, i) => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', flexShrink: 0 }}>{i + 1}</span>
                    {l.type === 'video' ? <Video size={15} style={{ color: '#f59e0b', flexShrink: 0 }} /> : <FileText size={15} style={{ color: '#6366f1', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{l.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{l.type === 'video' ? 'Video' : 'Notes'} · {l.duration} min</div>
                    </div>
                    <Lock size={14} style={{ color: '#64748b' }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ minWidth: 280, background: 'var(--bg-card, #1e2235)', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: '5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: course.price === 0 ? '#10b981' : undefined }}>{course.price === 0 ? 'FREE' : `RWF ${course.price.toLocaleString()}`}</div>
                {course.price > 0 && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>One-time payment</div>}
              </div>
              <button onClick={enroll} disabled={enrolling} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex', marginBottom: '1rem' }}>
                {enrolling ? 'Enrolling…' : 'Enrol Now'}
              </button>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', lineHeight: 1.6 }}>
                Includes {totalLessons} lessons · Blockchain certificate · Lifetime access
              </div>
              {course.certificateFee > 0 && <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.5rem' }}>Certificate fee: RWF {course.certificateFee.toLocaleString()}</div>}
            </div>
          </div>
        </div>
      ) : (
        /* Enrolled: learning view */
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 'calc(100vh - 120px)' }}>

          {/* Sidebar */}
          <div style={{ borderRight: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto', padding: '1.25rem' }}>
            {enrollment.completed && enrollment.certificateId && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '1rem', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                <Award size={28} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.88rem', marginBottom: '0.25rem' }}>Course Completed!</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', wordBreak: 'break-all' }}>Certificate: {enrollment.certificateId}</div>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>PROGRESS</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: progressPct === 100 ? '#10b981' : '#818cf8' }}>{progressPct}%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: progressPct === 100 ? '#10b981' : 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: '100px', width: `${progressPct}%`, transition: 'width 0.4s' }} />
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Lessons</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {lessons.map((l, i) => {
                const done = isCompleted(l.id)
                const isActive = activeLesson?.id === l.id
                return (
                  <button key={l.id} onClick={() => setActiveLesson(l)} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.75rem', borderRadius: '0.75rem', border: `1px solid ${isActive ? 'rgba(99,102,241,0.4)' : 'transparent'}`, background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s' }}>
                    {done ? <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} /> : <span style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${isActive ? '#818cf8' : 'rgba(255,255,255,0.2)'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: isActive ? '#818cf8' : '#64748b' }}>{i + 1}</span>}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#e2e8f0' : done ? '#94a3b8' : '#cbd5e1', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                        {l.type === 'video' ? <Video size={10} /> : <FileText size={10} />} {l.duration}min
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lesson viewer */}
          <div style={{ overflowY: 'auto', padding: '2rem 2.5rem' }}>
            {activeLesson ? (
              <div style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {activeLesson.type === 'video' ? <Video size={18} style={{ color: '#f59e0b' }} /> : <FileText size={18} style={{ color: '#6366f1' }} />}
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{activeLesson.type === 'video' ? 'Video Lesson' : 'Notes'}</span>
                  {isActiveCompleted && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}><CheckCircle size={14} /> Completed</span>}
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.3 }}>{activeLesson.title}</h2>

                {activeLesson.type === 'video' && activeLesson.videoUrl && (
                  <div style={{ borderRadius: '1rem', overflow: 'hidden', marginBottom: '1.5rem', background: '#000', aspectRatio: '16/9', position: 'relative' }}>
                    <iframe src={activeLesson.videoUrl} title={activeLesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', inset: 0 }} />
                  </div>
                )}

                {activeLesson.content && (
                  <div
                    style={{ lineHeight: 1.8, color: '#cbd5e1', fontSize: '0.95rem' }}
                    className="prose-content"
                    dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                  />
                )}

                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  {!isActiveCompleted && (
                    <button onClick={() => markComplete(activeLesson.id)} disabled={completing} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={16} /> {completing ? 'Saving…' : 'Mark as Complete'}
                    </button>
                  )}
                  {isActiveCompleted && (() => {
                    const idx = lessons.findIndex(l => l.id === activeLesson.id)
                    const next = lessons[idx + 1]
                    return next ? (
                      <button onClick={() => setActiveLesson(next)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Play size={16} /> Next Lesson
                      </button>
                    ) : null
                  })()}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '4rem', color: '#64748b' }}>
                <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <p>Select a lesson to start learning.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
