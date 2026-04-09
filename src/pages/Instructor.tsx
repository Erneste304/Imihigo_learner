import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { BookOpen, Users, DollarSign, Plus, BarChart, Trash2, Edit2, ChevronDown, ChevronRight, Video, FileText, CheckCircle, Clock, X, GraduationCap, Award, Send } from 'lucide-react'

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
  price: number
  certificateFee: number
  category: string
  level: string
  tags: string[]
  enrolledCount: number
  status: string
  active: boolean
  lessons: Lesson[]
}

interface Stats {
  totalCourses: number
  approvedCourses: number
  pendingCourses: number
  totalEnrolls: number
  totalRevenue: number
  platformFee: number
  platformFeePercent: number
}

const BLANK_COURSE = { title: '', description: '', price: '0', certificateFee: '0', category: 'General', level: 'beginner', tags: '' }
const BLANK_LESSON = { title: '', type: 'note' as const, content: '', videoUrl: '', duration: '10' }

export default function Instructor() {
  const { user } = useAuth()
  const [approvalStatus, setApprovalStatus] = useState<any>(null)
  const [approvalLoading, setApprovalLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [courseForm, setCourseForm] = useState({ ...BLANK_COURSE })

  const [showLessonModal, setShowLessonModal] = useState(false)
  const [lessonCourseId, setLessonCourseId] = useState('')
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [lessonForm, setLessonForm] = useState({ ...BLANK_LESSON })

  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)

  const [applyForm, setApplyForm] = useState({ qualification: '', institution: '', specialties: '', bio: '', portfolioUrl: '', yearsExperience: '1' })
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    api.get('/instructors/approval-status')
      .then(r => setApprovalStatus(r.data.data))
      .catch(() => {})
      .finally(() => setApprovalLoading(false))
  }, [])

  useEffect(() => {
    if (approvalStatus?.status !== 'approved' && user?.role !== 'admin') return
    Promise.all([
      api.get('/instructors/my-courses'),
      api.get('/instructors/stats'),
    ]).then(([cr, sr]) => {
      if (cr.data.success) setCourses(cr.data.data)
      if (sr.data.success) setStats(sr.data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [approvalStatus, user])

  async function submitApplication() {
    if (!applyForm.qualification || !applyForm.institution || !applyForm.bio) {
      alert('Please fill in all required fields.')
      return
    }
    setApplying(true)
    try {
      const res = await api.post('/instructors/request-approval', { ...applyForm, yearsExperience: Number(applyForm.yearsExperience) })
      if (res.data.success) setApprovalStatus(res.data.data)
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to submit application.')
    } finally {
      setApplying(false)
    }
  }

  async function saveCourse() {
    const payload = { ...courseForm, price: Number(courseForm.price), certificateFee: Number(courseForm.certificateFee), tags: courseForm.tags.split(',').map(t => t.trim()).filter(Boolean) }
    try {
      if (editingCourse) {
        const res = await api.put(`/instructors/courses/${editingCourse.id}`, payload)
        if (res.data.success) { setCourses(cs => cs.map(c => c.id === editingCourse.id ? { ...c, ...payload } : c)); setShowCourseModal(false) }
      } else {
        const res = await api.post('/instructors/courses', payload)
        if (res.data.success) { setCourses(cs => [res.data.data, ...cs]); setShowCourseModal(false) }
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to save course.')
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm('Delete this course and all its lessons?')) return
    const res = await api.delete(`/instructors/courses/${id}`)
    if (res.data.success) setCourses(cs => cs.filter(c => c.id !== id))
  }

  function openCreateCourse() {
    setEditingCourse(null); setCourseForm({ ...BLANK_COURSE }); setShowCourseModal(true)
  }

  function openEditCourse(c: Course) {
    setEditingCourse(c)
    setCourseForm({ title: c.title, description: c.description || '', price: String(c.price), certificateFee: String(c.certificateFee || 0), category: c.category || 'General', level: c.level || 'beginner', tags: (c.tags || []).join(', ') })
    setShowCourseModal(true)
  }

  function openAddLesson(courseId: string) {
    setLessonCourseId(courseId); setEditingLesson(null); setLessonForm({ ...BLANK_LESSON }); setShowLessonModal(true)
  }

  function openEditLesson(courseId: string, lesson: Lesson) {
    setLessonCourseId(courseId); setEditingLesson(lesson)
    setLessonForm({ title: lesson.title, type: lesson.type, content: lesson.content || '', videoUrl: lesson.videoUrl || '', duration: String(lesson.duration || 10) })
    setShowLessonModal(true)
  }

  async function saveLesson() {
    const payload = { ...lessonForm, duration: Number(lessonForm.duration) }
    try {
      if (editingLesson) {
        const res = await api.put(`/instructors/courses/${lessonCourseId}/lessons/${editingLesson.id}`, payload)
        if (res.data.success) { setCourses(cs => cs.map(c => c.id === lessonCourseId ? { ...c, lessons: (c.lessons || []).map(l => l.id === editingLesson.id ? res.data.data : l) } : c)); setShowLessonModal(false) }
      } else {
        const res = await api.post(`/instructors/courses/${lessonCourseId}/lessons`, payload)
        if (res.data.success) { setCourses(cs => cs.map(c => c.id === lessonCourseId ? { ...c, lessons: [...(c.lessons || []), res.data.data] } : c)); setShowLessonModal(false) }
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to save lesson.')
    }
  }

  async function deleteLesson(courseId: string, lessonId: string) {
    if (!confirm('Delete this lesson?')) return
    const res = await api.delete(`/instructors/courses/${courseId}/lessons/${lessonId}`)
    if (res.data.success) setCourses(cs => cs.map(c => c.id === courseId ? { ...c, lessons: (c.lessons || []).filter(l => l.id !== lessonId) } : c))
  }

  const isApproved = approvalStatus?.status === 'approved' || user?.role === 'admin'

  if (approvalLoading) return <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="spinner" /></div>

  if (!isApproved) {
    return (
      <div className="page">
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#818cf8' }}>
              <GraduationCap size={36} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Become an Instructor</h1>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Share your expertise with thousands of learners across Rwanda. Submit your qualifications to get started.</p>
          </div>

          {approvalStatus?.status === 'pending' ? (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '1.5rem', padding: '2rem', textAlign: 'center' }}>
              <Clock size={40} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#f59e0b' }}>Application Under Review</h3>
              <p style={{ color: '#94a3b8', margin: 0 }}>Your application was submitted on {new Date(approvalStatus.submittedAt).toLocaleDateString()}. Our team will review it shortly.</p>
            </div>
          ) : approvalStatus?.status === 'rejected' ? (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '1.5rem', padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
              <X size={36} style={{ color: '#ef4444', marginBottom: '1rem' }} />
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#ef4444' }}>Application Not Approved</h3>
              <p style={{ color: '#94a3b8', margin: 0 }}>{approvalStatus.reviewNote}</p>
            </div>
          ) : null}

          {approvalStatus?.status !== 'pending' && (
            <div style={{ background: 'var(--bg-card, #1e2235)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.05rem' }}>Instructor Application</h3>
              {[
                { label: 'Highest Qualification *', key: 'qualification', placeholder: 'e.g. Bachelor of Computer Science' },
                { label: 'Institution *', key: 'institution', placeholder: 'e.g. University of Rwanda' },
                { label: 'Specialties (comma-separated) *', key: 'specialties', placeholder: 'e.g. React, Node.js, Python' },
                { label: 'Portfolio or LinkedIn URL', key: 'portfolioUrl', placeholder: 'https://...' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                  <input value={(applyForm as any)[f.key]} onChange={e => setApplyForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'inherit', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Years of Experience</label>
                <input type="number" min="0" max="50" value={applyForm.yearsExperience} onChange={e => setApplyForm(p => ({ ...p, yearsExperience: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'inherit', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Professional Bio *</label>
                <textarea rows={4} value={applyForm.bio} onChange={e => setApplyForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about your experience and why you want to teach..." style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'inherit', outline: 'none', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <button onClick={submitApplication} disabled={applying} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
                <Send size={18} /> {applying ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) return <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="spinner" /></div>

  return (
    <div className="page">
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>Instructor Command Center</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Manage your curriculum and track your impact.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.4rem 0.85rem', borderRadius: '100px', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600 }}>
            <CheckCircle size={14} /> Approved Instructor
          </span>
          <button onClick={openCreateCourse} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> New Course
          </button>
        </div>
      </header>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: '#6366f1' },
            { label: 'Approved', value: stats.approvedCourses, icon: CheckCircle, color: '#10b981' },
            { label: 'Pending Review', value: stats.pendingCourses, icon: Clock, color: '#f59e0b' },
            { label: 'Total Students', value: stats.totalEnrolls, icon: Users, color: '#3b82f6' },
            { label: 'Gross Revenue', value: `RWF ${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: '#ec4899' },
            { label: 'Platform Fees', value: `RWF ${(stats.platformFee || 0).toLocaleString()}`, icon: BarChart, color: '#ef4444' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-card, #1e2235)', borderRadius: '1.25rem', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: '0.75rem' }}>
                <s.icon size={20} />
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Course list */}
      <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.15rem' }}>Your Courses</h2>
      {courses.length === 0 ? (
        <div style={{ background: 'var(--bg-card, #1e2235)', borderRadius: '1.5rem', padding: '3rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
          <BookOpen size={40} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>You haven't created any courses yet.</p>
          <button onClick={openCreateCourse} className="btn btn-primary">Create Your First Course</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {courses.map(c => (
            <div key={c.id} style={{ background: 'var(--bg-card, #1e2235)', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpandedCourse(expandedCourse === c.id ? null : c.id)}>
                  {expandedCourse === c.id ? <ChevronDown size={18} style={{ color: '#94a3b8', flexShrink: 0 }} /> : <ChevronRight size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{c.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span>{c.category}</span>
                      <span style={{ textTransform: 'capitalize' }}>{c.level}</span>
                      <span>{(c.lessons || []).length} lessons</span>
                      <span>{c.enrolledCount} students</span>
                      <span>RWF {c.price?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '100px', background: c.status === 'approved' ? 'rgba(16,185,129,0.12)' : c.status === 'rejected' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)', color: c.status === 'approved' ? '#10b981' : c.status === 'rejected' ? '#ef4444' : '#f59e0b', border: `1px solid ${c.status === 'approved' ? 'rgba(16,185,129,0.3)' : c.status === 'rejected' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                    {c.status === 'approved' ? '✓ Live' : c.status === 'rejected' ? '✕ Rejected' : '⏳ Pending'}
                  </span>
                  <button onClick={() => openEditCourse(c)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '0.5rem', padding: '0.35rem 0.7rem', cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => deleteCourse(c.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.5rem', padding: '0.35rem 0.7rem', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                    <Trash2 size={13} /> Del
                  </button>
                </div>
              </div>

              {expandedCourse === c.id && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontWeight: 600, margin: 0, fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lessons ({(c.lessons || []).length})</h4>
                    <button onClick={() => openAddLesson(c.id)} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '0.5rem', padding: '0.35rem 0.8rem', cursor: 'pointer', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600 }}>
                      <Plus size={14} /> Add Lesson
                    </button>
                  </div>
                  {(c.lessons || []).length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>No lessons yet. Click "Add Lesson" to get started.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[...(c.lessons || [])].sort((a, b) => a.order - b.order).map((l, idx) => (
                        <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#818cf8', flexShrink: 0 }}>{idx + 1}</span>
                            {l.type === 'video' ? <Video size={15} style={{ color: '#f59e0b', flexShrink: 0 }} /> : <FileText size={15} style={{ color: '#6366f1', flexShrink: 0 }} />}
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{l.title}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.type === 'video' ? 'Video' : 'Notes'} · {l.duration} min</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => openEditLesson(c.id, l)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.4rem', padding: '0.25rem 0.55rem', cursor: 'pointer', color: '#818cf8', fontSize: '0.75rem' }}>Edit</button>
                            <button onClick={() => deleteLesson(c.id, l.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.4rem', padding: '0.25rem 0.55rem', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem' }}>Del</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── COURSE MODAL ── */}
      {showCourseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => e.target === e.currentTarget && setShowCourseModal(false)}>
          <div style={{ background: '#1a1f35', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '560px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{editingCourse ? 'Edit Course' : 'Create Course'}</h3>
              <button onClick={() => setShowCourseModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            {[
              { label: 'Title *', key: 'title', type: 'text', placeholder: 'e.g. React for Beginners' },
              { label: 'Description *', key: 'description', type: 'textarea', placeholder: 'What will students learn?' },
              { label: 'Price (RWF)', key: 'price', type: 'number', placeholder: '0 for free' },
              { label: 'Certificate Fee (RWF)', key: 'certificateFee', type: 'number', placeholder: '0' },
              { label: 'Category', key: 'category', type: 'text', placeholder: 'e.g. Frontend, Backend, Data Science' },
              { label: 'Tags (comma-separated)', key: 'tags', type: 'text', placeholder: 'e.g. React, JavaScript, Hooks' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                {f.type === 'textarea'
                  ? <textarea rows={3} value={(courseForm as any)[f.key]} placeholder={f.placeholder} onChange={e => setCourseForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.7rem 1rem', color: 'inherit', outline: 'none', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }} />
                  : <input type={f.type} value={(courseForm as any)[f.key]} placeholder={f.placeholder} onChange={e => setCourseForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.7rem 1rem', color: 'inherit', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                }
              </div>
            ))}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</label>
              <select value={courseForm.level} onChange={e => setCourseForm(p => ({ ...p, level: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.7rem 1rem', color: 'inherit', outline: 'none', fontSize: '0.9rem' }}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCourseModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#94a3b8', fontSize: '0.9rem' }}>Cancel</button>
              <button onClick={saveCourse} className="btn btn-primary">{editingCourse ? 'Save Changes' : 'Create Course'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── LESSON MODAL ── */}
      {showLessonModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => e.target === e.currentTarget && setShowLessonModal(false)}>
          <div style={{ background: '#1a1f35', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '640px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</h3>
              <button onClick={() => setShowLessonModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lesson Title *</label>
              <input value={lessonForm.title} onChange={e => setLessonForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to useState" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.7rem 1rem', color: 'inherit', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lesson Type</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {(['note', 'video'] as const).map(t => (
                  <button key={t} onClick={() => setLessonForm(p => ({ ...p, type: t }))} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.75rem', border: `2px solid ${lessonForm.type === t ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, background: lessonForm.type === t ? 'rgba(99,102,241,0.15)' : 'transparent', color: lessonForm.type === t ? '#818cf8' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.88rem' }}>
                    {t === 'video' ? <Video size={16} /> : <FileText size={16} />} {t === 'video' ? 'Video Lesson' : 'Notes / Article'}
                  </button>
                ))}
              </div>
            </div>

            {lessonForm.type === 'video' ? (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>YouTube Embed URL</label>
                <input value={lessonForm.videoUrl} onChange={e => setLessonForm(p => ({ ...p, videoUrl: e.target.value }))} placeholder="https://www.youtube.com/embed/VIDEO_ID" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.7rem 1rem', color: 'inherit', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem' }}>Use youtube.com/embed/ID format. You can also add notes below for additional context.</div>
              </div>
            ) : null}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lessonForm.type === 'video' ? 'Additional Notes (HTML supported)' : 'Lesson Content (HTML supported)'}</label>
              <textarea rows={8} value={lessonForm.content} onChange={e => setLessonForm(p => ({ ...p, content: e.target.value }))} placeholder="<h2>Introduction</h2><p>In this lesson...</p>" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.7rem 1rem', color: 'inherit', outline: 'none', fontSize: '0.88rem', resize: 'vertical', fontFamily: 'monospace', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration (minutes)</label>
              <input type="number" min="1" value={lessonForm.duration} onChange={e => setLessonForm(p => ({ ...p, duration: e.target.value }))} style={{ width: '140px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.7rem 1rem', color: 'inherit', outline: 'none', fontSize: '0.9rem' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowLessonModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#94a3b8', fontSize: '0.9rem' }}>Cancel</button>
              <button onClick={saveLesson} className="btn btn-primary">{editingLesson ? 'Save Changes' : 'Add Lesson'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
