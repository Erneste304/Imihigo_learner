import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import styles from './Admin.module.css'
import { Users, BookOpen, Briefcase, DollarSign, CheckCircle, Activity, Shield, Video, Trash2, ToggleLeft, ToggleRight, Star, FileText, Plus, Edit2, X, GraduationCap, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { io as connectSocket } from 'socket.io-client'

interface Stats {
  totalUsers: number
  totalAssessmentsTaken: number
  totalJobs: number
  totalApplications: number
  totalRevenue: number
  usersByRole: { candidates: number; employers: number; instructors: number; admins: number }
  totalCourses: number
  totalInternationalCerts: number
  totalTutorials: number
  suspendedUsers: number
  activeJobs: number
  activeCourses: number
}

type Tab = 'overview' | 'users' | 'courses' | 'instructor-approvals' | 'course-approvals' | 'tutorials' | 'assignments' | 'jobs' | 'verifications' | 'terms' | 'settings'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',             label: 'Overview',            icon: <Activity size={15} /> },
  { id: 'users',                label: 'Users',               icon: <Users size={15} /> },
  { id: 'courses',              label: 'Courses',             icon: <BookOpen size={15} /> },
  { id: 'instructor-approvals', label: 'Instructors',         icon: <GraduationCap size={15} /> },
  { id: 'course-approvals',     label: 'Course Queue',        icon: <Clock size={15} /> },
  { id: 'tutorials',            label: 'Tutorials',           icon: <Video size={15} /> },
  { id: 'assignments',          label: 'Assignments',         icon: <FileText size={15} /> },
  { id: 'jobs',                 label: 'Jobs',                icon: <Briefcase size={15} /> },
  { id: 'verifications',        label: 'Verifications',       icon: <CheckCircle size={15} /> },
  { id: 'terms',                label: 'T&C Compliance',      icon: <FileText size={15} /> },
  { id: 'settings',             label: 'Settings',            icon: <DollarSign size={15} /> },
]

const roleColor: Record<string, string> = {
  jobseeker: '#6366f1', employer: '#10b981', admin: '#ef4444', instructor: '#f59e0b'
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
      background: active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
      color: active ? '#10b981' : '#ef4444',
      border: `1px solid ${active ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export default function Admin() {
  const { token, user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [tutorials, setTutorials] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [verifications, setVerifications] = useState<any[]>([])
  const [settings, setSettings] = useState<any[]>([])
  const [activityFeed, setActivityFeed] = useState<any[]>([])
  const [tcUsers, setTcUsers] = useState<any[]>([])
  const [tcStats, setTcStats] = useState<any>(null)
  const [tcFilter, setTcFilter] = useState<'all' | 'accepted' | 'pending'>('all')
  const [instructorRequests, setInstructorRequests] = useState<any[]>([])
  const [courseApprovals, setCourseApprovals] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const feedRef = useRef<HTMLDivElement>(null)

  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [courseForm, setCourseForm] = useState({ title: '', description: '', price: '0', certificateFee: '0', category: 'General', level: 'beginner', tags: '' })

  const [showJobModal, setShowJobModal] = useState(false)
  const [editingJob, setEditingJob] = useState<any>(null)
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: 'Kigali, Rwanda', type: 'full-time', salary: '', description: '' })

  const [showInstructorModal, setShowInstructorModal] = useState(false)
  const [instructorForm, setInstructorForm] = useState({ name: '', email: '', qualification: '', institution: '', specialties: '', yearsExperience: '0' })

  const [showQueueModal, setShowQueueModal] = useState(false)
  const [queueForm, setQueueForm] = useState({ title: '', description: '', instructorName: '', category: 'General', level: 'beginner', price: '0' })

  const [showTutorialModal, setShowTutorialModal] = useState(false)
  const [tutorialForm, setTutorialForm] = useState({ title: '', description: '', category: 'Programming', level: 'beginner', language: 'en', videoUrl: '' })

  const [showSkillModal, setShowSkillModal] = useState(false)
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Programming', level: 'beginner', description: '', icon: '📜', questionsCount: '5' })


  useEffect(() => {
    if (!token) return
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/courses'),
      api.get('/admin/tutorials'),
      api.get('/admin/jobs'),
      api.get('/admin/verifications'),
      api.get('/admin/settings'),
      api.get('/admin/activities'),
      api.get('/admin/terms-compliance'),
      api.get('/admin/instructor-requests'),
      api.get('/admin/course-approvals'),
      api.get('/admin/skills'),
    ]).then(([st, us, co, tu, jo, ve, se, ac, tc, ir, ca, sk]) => {
      if (st.data.success) setStats(st.data.data)
      if (us.data.success) setUsers(us.data.data)
      if (co.data.success) setCourses(us.data.success ? co.data.data : []) // safer check
      if (tu.data.success) setTutorials(tu.data.data)
      if (jo.data.success) setJobs(jo.data.data)
      if (ve.data.success) setVerifications(ve.data.data)
      if (se.data.success) setSettings(se.data.data)
      if (ac.data.success) setActivityFeed(ac.data.data)
      if (tc.data.success) { setTcUsers(tc.data.data); setTcStats(tc.data.stats) }
      if (ir.data.success) setInstructorRequests(ir.data.data)
      if (ca.data.success) setCourseApprovals(ca.data.data)
      if (sk?.data?.success) setSkills(sk.data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    const socket = connectSocket(window.location.origin)
    socket.on('platform-activity', (a: any) => {
      setActivityFeed(prev => [a, ...prev].slice(0, 50))
      if (feedRef.current) feedRef.current.scrollTop = 0
    })
    return () => { socket.disconnect() }
  }, [])

  async function toggleUserSuspend(userId: string) {
    const res = await api.put(`/admin/users/${userId}/suspend`, {})
    if (res.data.success) setUsers(us => us.map(u => u.id === userId ? { ...u, suspended: res.data.suspended } : u))
  }

  async function changeRole(userId: string, role: string) {
    const res = await api.put(`/admin/users/${userId}/role`, { role })
    if (res.data.success) setUsers(us => us.map(u => u.id === userId ? { ...u, role } : u))
  }

  async function deleteUser(userId: string) {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return
    const res = await api.delete(`/admin/users/${userId}`)
    if (res.data.success) setUsers(us => us.filter(u => u.id !== userId))
  }

  async function toggleCourse(id: string) {
    const res = await api.put(`/admin/courses/${id}/toggle`, {})
    if (res.data.success) setCourses(cs => cs.map(c => c.id === id ? { ...c, active: res.data.active } : c))
  }

  async function toggleTutorial(id: string) {
    const res = await api.put(`/admin/tutorials/${id}/toggle`, {})
    if (res.data.success) setTutorials(ts => ts.map(t => t.id === id ? { ...t, active: res.data.active } : t))
  }

  async function deleteTutorial(id: string) {
    if (!confirm('Delete this tutorial permanently?')) return
    const res = await api.delete(`/admin/tutorials/${id}`)
    if (res.data.success) setTutorials(ts => ts.filter(t => t.id !== id))
  }

  async function toggleJob(id: string) {
    const res = await api.put(`/admin/jobs/${id}/toggle`, {})
    if (res.data.success) setJobs(js => js.map(j => j.id === id ? { ...j, active: res.data.active } : j))
  }

  async function deleteJob(id: string) {
    if (!confirm('Delete this job listing permanently?')) return
    const res = await api.delete(`/admin/jobs/${id}`)
    if (res.data.success) setJobs(js => js.filter(j => j.id !== id))
  }

  async function updateSetting(key: string, value: any) {
    await api.put(`/admin/settings/${key}`, { value })
    setSettings(ss => ss.map(s => s.key === key ? { ...s, value } : s))
  }

  async function tcDeactivate(userId: string) {
    const res = await api.put(`/admin/users/${userId}/tc-deactivate`, {})
    if (res.data.success) setTcUsers(ts => ts.map(u => u.id === userId ? { ...u, suspended: true } : u))
  }

  async function tcActivate(userId: string) {
    const res = await api.put(`/admin/users/${userId}/tc-activate`, {})
    if (res.data.success) setTcUsers(ts => ts.map(u => u.id === userId ? { ...u, suspended: false } : u))
  }

  async function tcMarkAccepted(userId: string) {
    const res = await api.put(`/admin/users/${userId}/tc-accept`, {})
    if (res.data.success) setTcUsers(ts => ts.map(u => u.id === userId ? { ...u, tcAccepted: true, tcAcceptedAt: new Date().toISOString() } : u))
  }

  async function approveInstructor(id: string) {
    const note = prompt('Approval note (optional):') || ''
    const res = await api.put(`/admin/instructor-requests/${id}/approve`, { note })
    if (res.data.success) setInstructorRequests(rs => rs.map(r => r.id === id ? { ...r, status: 'approved', reviewedAt: new Date().toISOString(), reviewNote: note } : r))
  }

  async function rejectInstructor(id: string) {
    const note = prompt('Rejection reason:') || 'Not approved at this time.'
    const res = await api.put(`/admin/instructor-requests/${id}/reject`, { note })
    if (res.data.success) setInstructorRequests(rs => rs.map(r => r.id === id ? { ...r, status: 'rejected', reviewedAt: new Date().toISOString(), reviewNote: note } : r))
  }

  async function approveCourse(id: string) {
    const note = prompt('Approval note (optional):') || ''
    const res = await api.put(`/admin/course-approvals/${id}/approve`, { note })
    if (res.data.success) setCourseApprovals(cs => cs.filter(c => c.id !== id))
  }

  async function rejectCourse(id: string) {
    const note = prompt('Rejection reason:') || 'Please revise and resubmit.'
    const res = await api.put(`/admin/course-approvals/${id}/reject`, { note })
    if (res.data.success) setCourseApprovals(cs => cs.filter(c => c.id !== id))
  }

  async function deleteCourse(id: string) {
    if (!confirm('Permanently delete this course?')) return
    const res = await api.delete(`/admin/courses/${id}`)
    if (res.data.success) setCourses(cs => cs.filter(c => c.id !== id))
  }

  async function saveCourse() {
    const payload = { ...courseForm, price: Number(courseForm.price), certificateFee: Number(courseForm.certificateFee), tags: courseForm.tags.split(',').map(t => t.trim()).filter(Boolean) }
    if (editingCourse) {
      const res = await api.put(`/admin/courses/${editingCourse.id}`, payload)
      if (res.data.success) { setCourses(cs => cs.map(c => c.id === editingCourse.id ? res.data.data : c)); setShowCourseModal(false) }
    } else {
      const res = await api.post('/admin/courses', payload)
      if (res.data.success) { setCourses(cs => [res.data.data, ...cs]); setShowCourseModal(false) }
    }
  }

  function openCreateCourse() {
    setEditingCourse(null)
    setCourseForm({ title: '', description: '', price: '0', certificateFee: '0', category: 'General', level: 'beginner', tags: '' })
    setShowCourseModal(true)
  }

  function openEditCourse(c: any) {
    setEditingCourse(c)
    setCourseForm({ title: c.title, description: c.description || '', price: String(c.price), certificateFee: String(c.certificateFee || 0), category: c.category || 'General', level: c.level || 'beginner', tags: (c.tags || []).join(', ') })
    setShowCourseModal(true)
  }

  async function saveJob() {
    if (editingJob) {
      const res = await api.put(`/admin/jobs/${editingJob.id}`, jobForm)
      if (res.data.success) { setJobs(js => js.map(j => j.id === editingJob.id ? res.data.data : j)); setShowJobModal(false) }
    } else {
      const res = await api.post('/admin/jobs', jobForm)
      if (res.data.success) { setJobs(js => [res.data.data, ...js]); setShowJobModal(false) }
    }
  }

  function openCreateJob() {
    setEditingJob(null)
    setJobForm({ title: '', company: '', location: 'Kigali, Rwanda', type: 'full-time', salary: '', description: '' })
    setShowJobModal(true)
  }

  function openEditJob(j: any) {
    setEditingJob(j)
    setJobForm({ title: j.title, company: j.company, location: j.location || 'Kigali, Rwanda', type: j.type || 'full-time', salary: j.salary || '', description: j.description || '' })
    setShowJobModal(true)
  }

  async function approveVerification(id: string) {
    await api.put(`/admin/verifications/${id}/approve`, {})
    setVerifications(vs => vs.map(v => v.id === id ? { ...v, status: 'approved' } : v))
  }

  async function rejectVerification(id: string) {
    await api.put(`/admin/verifications/${id}/reject`, {})
    setVerifications(vs => vs.map(v => v.id === id ? { ...v, status: 'rejected' } : v))
  }

  async function saveInstructor() {
    const res = await api.post('/admin/instructor-requests', instructorForm)
    if (res.data.success) {
      setInstructorRequests(rs => [res.data.data, ...rs])
      setShowInstructorModal(false)
    }
  }

  async function saveQueue() {
    const res = await api.post('/admin/course-approvals', queueForm)
    if (res.data.success) {
      setCourseApprovals(cs => [res.data.data, ...cs])
      setShowQueueModal(false)
    }
  }

  async function saveTutorial() {
    if (!tutorialForm.title) return alert('Tutorial title is required.')
    try {
      const res = await api.post('/admin/tutorials', tutorialForm)
      if (res.data.success) {
        setTutorials(ts => [res.data.data, ...ts])
        setShowTutorialModal(false)
        setTutorialForm({ title: '', description: '', category: 'Programming', level: 'beginner', language: 'en', videoUrl: '' })
      }
    } catch (err) {
      alert('Failed to save tutorial. Please try again.')
    }
  }

  async function saveSkill() {
    if (!skillForm.name) return alert('Skill name is required.')
    try {
      const res = await api.post('/admin/skills', skillForm)
      if (res.data.success) {
        setSkills(ss => [res.data.data, ...ss])
        setShowSkillModal(false)
        setSkillForm({ name: '', category: 'Programming', level: 'beginner', description: '', icon: '📜', questionsCount: '5' })
      }
    } catch (err) {
      alert('Failed to save skill assignment. Please try again.')
    }
  }

  async function deleteSkill(id: string) {
    if (!confirm('Permanently delete this skill assessment?')) return
    const res = await api.delete(`/admin/skills/${id}`)
    if (res.data.success) {
      setSkills(ss => ss.filter(s => s.id !== id))
    }
  }

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><div className="spinner" /></div>

  if (user?.role !== 'admin') return (
    <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column', gap:'1rem' }}>
      <Shield size={48} style={{ color: '#ef4444' }} />
      <h2>Access Denied</h2>
      <p className="text-muted">You need Administrator privileges to view this page.</p>
      <button className="btn btn-primary" onClick={() => window.history.back()}>Go Back</button>
    </div>
  )

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div className={styles.adminHeader}>
          <div>
            <h1 className={styles.adminTitle}>Platform Administration</h1>
            <p className={styles.adminSub}>Mission Control — Imihigo Learn</p>
          </div>
          <div className={styles.onlinePill}>
            <span className={styles.onlineDot} /> System Online
          </div>
        </div>

        {/* Tab nav */}
        <div className={styles.tabNav}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.tabBtn} ${activeTab === t.id ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            {[
              { icon: <Users size={22} />, color: '#6366f1', label: 'Total Users', value: stats?.totalUsers ?? 0 },
              { icon: <BookOpen size={22} />, color: '#8b5cf6', label: 'Active Courses', value: stats?.activeCourses ?? 0 },
              { icon: <Briefcase size={22} />, color: '#10b981', label: 'Active Jobs', value: stats?.activeJobs ?? 0 },
              { icon: <Video size={22} />, color: '#f59e0b', label: 'Tutorials', value: stats?.totalTutorials ?? 0 },
              { icon: <Star size={22} />, color: '#ec4899', label: 'Certificates Issued', value: stats?.totalInternationalCerts ?? 0 },
              { icon: <DollarSign size={22} />, color: '#14b8a6', label: 'Platform Revenue', value: `${((stats?.totalRevenue ?? 0) / 1000).toFixed(0)}K RWF` },
              { icon: <CheckCircle size={22} />, color: '#3b82f6', label: 'Assessments Taken', value: stats?.totalAssessmentsTaken ?? 0 },
              { icon: <Shield size={22} />, color: '#ef4444', label: 'Suspended Users', value: stats?.suspendedUsers ?? 0 },
            ].map(s => (
              <div key={s.label} className={styles.overviewCard}>
                <div className={styles.overviewIcon} style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
                <div className={styles.overviewValue}>{s.value}</div>
                <div className={styles.overviewLabel}>{s.label}</div>
              </div>
            ))}

            <div className={styles.feedCard}>
              <div className={styles.feedHeader}>
                <div className={styles.feedDot} /> Live Activity Feed
                <span className={styles.feedTag}>Real-time</span>
              </div>
              <div ref={feedRef} className={styles.feedBody}>
                {activityFeed.length === 0 ? (
                  <div className={styles.feedEmpty}>No activity yet. Events appear here in real-time.</div>
                ) : activityFeed.map((a, i) => (
                  <div key={a.id || i} className={styles.feedItem}>
                    <span className={styles.feedEmoji}>
                      {a.type === 'CERTIFICATE_ISSUED' ? '🏆' : a.type === 'JOB_APPLIED' ? '💼' : a.type === 'USER_REGISTER' ? '👤' : a.type === 'ASSESSMENT_COMPLETED' ? '📋' : '⚡'}
                    </span>
                    <div>
                      <p className={styles.feedMsg}>{a.message}</p>
                      <p className={styles.feedTime}>{new Date(a.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.roleCard}>
              <div className={styles.roleTitle}><Shield size={16} /> User Breakdown</div>
              {[
                { label: 'Job Seekers', count: stats?.usersByRole?.candidates ?? 0, color: '#6366f1' },
                { label: 'Employers',   count: stats?.usersByRole?.employers ?? 0,  color: '#10b981' },
                { label: 'Instructors', count: stats?.usersByRole?.instructors ?? 0, color: '#f59e0b' },
                { label: 'Admins',      count: stats?.usersByRole?.admins ?? 0,     color: '#ef4444' },
              ].map(r => (
                <div key={r.label} className={styles.roleRow}>
                  <div className={styles.roleRowTop}>
                    <span>{r.label}</span><strong>{r.count}</strong>
                  </div>
                  <div className={styles.roleBar}>
                    <div className={styles.roleBarFill} style={{ width: `${stats?.totalUsers ? Math.round((r.count / stats.totalUsers) * 100) : 0}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><Users size={20} /> User Management</h2>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                <input
                  className={styles.searchInput}
                  placeholder="Search name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select className={styles.filterSelect} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="jobseeker">Job Seekers</option>
                  <option value="employer">Employers</option>
                  <option value="instructor">Instructors</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ opacity: u.suspended ? 0.6 : 1 }}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.userAvatar} style={{ background: roleColor[u.role] + '33', color: roleColor[u.role] }}>
                            {u.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                          </div>
                          <div>
                            <div className={styles.userName}>{u.name}</div>
                            <div className={styles.userEmail}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className={styles.roleSelect}
                          value={u.role}
                          onChange={e => changeRole(u.id, e.target.value)}
                          disabled={u.id === user?.id}
                          style={{ borderColor: roleColor[u.role] + '66' }}
                        >
                          <option value="jobseeker">Job Seeker</option>
                          <option value="employer">Employer</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td><StatusPill active={!u.suspended} /></td>
                      <td className={styles.dateCell}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button
                            className={`${styles.actionBtn} ${u.suspended ? styles.actionBtnGreen : styles.actionBtnAmber}`}
                            onClick={() => toggleUserSuspend(u.id)}
                            disabled={u.id === user?.id}
                            title={u.suspended ? 'Reactivate' : 'Suspend'}
                          >
                            {u.suspended ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                            {u.suspended ? 'Activate' : 'Suspend'}
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnRed}`}
                            onClick={() => deleteUser(u.id)}
                            disabled={u.id === user?.id}
                            title="Delete user"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className={styles.emptyRow}>No users match your search.</div>}
            </div>
          </div>
        )}

        {/* ── COURSES ── */}
        {activeTab === 'courses' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><BookOpen size={20} /> Course Management</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={styles.countBadge}>{courses.length} total</span>
                <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={openCreateCourse}>
                  <Plus size={14} /> New Course
                </button>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Course</th><th>Instructor</th><th>Category</th><th>Enrolled</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id} style={{ opacity: c.active ? 1 : 0.55 }}>
                      <td>
                        <div className={styles.userName}>{c.title}</div>
                        <div className={styles.userEmail}>{c.description?.slice(0, 50)}{c.description?.length > 50 ? '…' : ''}</div>
                      </td>
                      <td className={styles.dateCell}>{c.instructorName}</td>
                      <td className={styles.dateCell}>{c.category || '—'}</td>
                      <td className={styles.dateCell}>{c.enrolledCount}</td>
                      <td className={styles.dateCell}>RWF {c.price?.toLocaleString()}</td>
                      <td><StatusPill active={!!c.active} /></td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button className={`${styles.actionBtn} ${c.active ? styles.actionBtnAmber : styles.actionBtnGreen}`} onClick={() => toggleCourse(c.id)}>
                            {c.active ? <><ToggleLeft size={14} /> Off</> : <><ToggleRight size={14} /> On</>}
                          </button>
                          <button className={`${styles.actionBtn}`} onClick={() => openEditCourse(c)} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                            <Edit2 size={13} /> Edit
                          </button>
                          <button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => deleteCourse(c.id)}>
                            <Trash2 size={13} /> Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {courses.length === 0 && <div className={styles.emptyRow}>No courses found.</div>}
            </div>
          </div>
        )}

        {/* ── TUTORIALS ── */}
        {activeTab === 'tutorials' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><Video size={20} /> Community Tutorial Moderation</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={styles.countBadge}>{tutorials.length} total</span>
                <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={() => setShowTutorialModal(true)}>
                  <Plus size={14} /> New Tutorial
                </button>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Tutorial</th><th>Author</th><th>Category</th><th>Views / Likes</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {tutorials.map(t => (
                    <tr key={t.id} style={{ opacity: t.active ? 1 : 0.55 }}>
                      <td>
                        <div className={styles.userName}>{t.title}</div>
                        <div className={styles.userEmail}>{t.level} · {t.language === 'rw' ? '🇷🇼 Kinyarwanda' : t.language === 'both' ? '🇷🇼 + EN' : 'English'}</div>
                      </td>
                      <td className={styles.dateCell}>{t.authorName}</td>
                      <td className={styles.dateCell}>{t.category}</td>
                      <td className={styles.dateCell}>👁 {t.views.toLocaleString()} · ❤️ {t.likes}</td>
                      <td><StatusPill active={t.active} /></td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button
                            className={`${styles.actionBtn} ${t.active ? styles.actionBtnAmber : styles.actionBtnGreen}`}
                            onClick={() => toggleTutorial(t.id)}
                          >
                            {t.active ? <><ToggleLeft size={14} /> Hide</> : <><ToggleRight size={14} /> Show</>}
                          </button>
                          <button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => deleteTutorial(t.id)}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tutorials.length === 0 && <div className={styles.emptyRow}>No tutorials found.</div>}
            </div>
          </div>
        )}

        {/* ── ASSIGNMENTS (SKILLS) ── */}
        {activeTab === 'assignments' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><FileText size={20} /> Skill Assignment Management</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={styles.countBadge}>{skills.length} total</span>
                <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={() => setShowSkillModal(true)}>
                  <Plus size={14} /> New Assignment
                </button>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Skill/Assignment</th><th>Category</th><th>Level</th><th>Questions</th><th>Actions</th></tr></thead>
                <tbody>
                  {skills.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className={styles.userName}>{s.icon} {s.name}</div>
                        <div className={styles.userEmail}>{s.description?.slice(0, 60)}{s.description?.length > 60 ? '…' : ''}</div>
                      </td>
                      <td className={styles.dateCell}>{s.category}</td>
                      <td className={styles.dateCell}><span className="badge badge-gray">{s.level}</span></td>
                      <td className={styles.dateCell}>{s.questionsCount}</td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => deleteSkill(s.id)}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {skills.length === 0 && <div className={styles.emptyRow}>No skill assignments found.</div>}
            </div>
          </div>
        )}

        {/* ── JOBS ── */}
        {activeTab === 'jobs' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><Briefcase size={20} /> Job Listing Management</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={styles.countBadge}>{jobs.length} total</span>
                <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={openCreateJob}>
                  <Plus size={14} /> New Job
                </button>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Job</th><th>Company</th><th>Type</th><th>Applications</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j.id} style={{ opacity: j.active ? 1 : 0.55 }}>
                      <td>
                        <div className={styles.userName}>{j.title}</div>
                        <div className={styles.userEmail}>{j.location} {j.salary ? `· ${j.salary}` : ''}</div>
                      </td>
                      <td className={styles.dateCell}>{j.company}</td>
                      <td className={styles.dateCell}><span className="badge badge-gray">{j.type}</span></td>
                      <td className={styles.dateCell}>{j.applications ?? 0}</td>
                      <td><StatusPill active={!!j.active} /></td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button className={`${styles.actionBtn} ${j.active ? styles.actionBtnAmber : styles.actionBtnGreen}`} onClick={() => toggleJob(j.id)}>
                            {j.active ? <><ToggleLeft size={14} /> Off</> : <><ToggleRight size={14} /> On</>}
                          </button>
                          <button className={`${styles.actionBtn}`} onClick={() => openEditJob(j)} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                            <Edit2 size={13} /> Edit
                          </button>
                          <button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => deleteJob(j.id)}>
                            <Trash2 size={13} /> Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {jobs.length === 0 && <div className={styles.emptyRow}>No jobs found.</div>}
            </div>
          </div>
        )}

        {/* ── INSTRUCTOR APPROVALS ── */}
        {activeTab === 'instructor-approvals' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><GraduationCap size={20} /> Instructor Applications</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={styles.countBadge}>{instructorRequests.filter(r => r.status?.toLowerCase() === 'pending').length} pending</span>
                <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={() => setShowInstructorModal(true)}>
                  <Plus size={14} /> New Instructor
                </button>
              </div>
            </div>
            {instructorRequests.length === 0 ? (
              <div className={styles.emptyRow}>No instructor applications yet.</div>
            ) : instructorRequests.map(r => (
              <div key={r.id} className={styles.verifyRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div className={styles.userName}>{r.name} <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.82rem' }}>({r.email})</span></div>
                    <div className={styles.userEmail}>{r.qualification} · {r.institution} · {r.yearsExperience} yrs exp</div>
                    <div className={styles.userEmail} style={{ marginTop: '0.25rem' }}>Specialties: {(r.specialties || []).join(', ')}</div>
                    {r.portfolioUrl && <a href={r.portfolioUrl} target="_blank" rel="noopener" style={{ fontSize: '0.75rem', color: '#818cf8' }}>{r.portfolioUrl}</a>}
                    {r.reviewNote && <div className={styles.userEmail} style={{ marginTop: '0.25rem', color: r.status === 'approved' ? '#10b981' : r.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>Note: {r.reviewNote}</div>}
                  </div>
                  <div className={styles.actionBtns} style={{ alignSelf: 'flex-start' }}>
                    <span className={styles.pendingBadge} style={{ background: r.status === 'approved' ? 'rgba(16,185,129,0.15)' : r.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: r.status === 'approved' ? '#10b981' : r.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>
                      {r.status === 'approved' ? '✓ Approved' : r.status === 'rejected' ? '✕ Rejected' : '⏳ Pending'}
                    </span>
                    {r.status === 'pending' && <>
                      <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={() => approveInstructor(r.id)}>✓ Approve</button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => rejectInstructor(r.id)}>✕ Reject</button>
                    </>}
                  </div>
                </div>
                {r.bio && <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{r.bio}</p>}
              </div>
            ))}
          </div>
        )}

        {/* ── COURSE APPROVAL QUEUE ── */}
        {activeTab === 'course-approvals' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><Clock size={20} /> Course Approval Queue</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={styles.countBadge}>{courseApprovals.length} pending</span>
                <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={() => setShowQueueModal(true)}>
                  <Plus size={14} /> Add to Queue
                </button>
              </div>
            </div>
            {courseApprovals.length === 0 ? (
              <div className={styles.emptyRow}>No courses pending approval.</div>
            ) : courseApprovals.map(c => (
              <div key={c.id} className={styles.verifyRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div className={styles.userName}>{c.title}</div>
                    <div className={styles.userEmail}>by {c.instructorName} ({c.instructorEmail}) · {c.category} · {c.level} · RWF {c.price?.toLocaleString()}</div>
                    <div className={styles.userEmail}>{(c.lessons || []).length} lessons · submitted {new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className={styles.actionBtns} style={{ alignSelf: 'flex-start' }}>
                    <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={() => approveCourse(c.id)}>✓ Approve</button>
                    <button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => rejectCourse(c.id)}>✕ Reject</button>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>{c.description}</p>
                {c.tags?.length > 0 && <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>{c.tags.map((t: string) => <span key={t} style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '100px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>{t}</span>)}</div>}
              </div>
            ))}
          </div>
        )}

        {/* ── VERIFICATIONS ── */}
        {activeTab === 'verifications' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><CheckCircle size={20} /> Verification Queue</h2>
            </div>
            {verifications.length === 0 ? (
              <div className={styles.emptyRow}>No pending verifications.</div>
            ) : verifications.map(v => (
              <div key={v.id} className={styles.verifyRow}>
                <div>
                  <div className={styles.userName}>{v.userName}</div>
                  <div className={styles.userEmail}>Skill: {v.skill} · {new Date(v.submittedAt).toLocaleDateString()}</div>
                </div>
                <div className={styles.actionBtns}>
                  <span className={styles.pendingBadge} style={{ background: v.status?.toLowerCase() === 'approved' ? 'rgba(16,185,129,0.15)' : v.status?.toLowerCase() === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: v.status?.toLowerCase() === 'approved' ? '#10b981' : v.status?.toLowerCase() === 'rejected' ? '#ef4444' : '#f59e0b' }}>
                    {v.status?.toLowerCase() === 'approved' ? '✓ Approved' : v.status?.toLowerCase() === 'rejected' ? '✕ Rejected' : '⏳ Pending'}
                  </span>
                  {v.status?.toLowerCase() === 'pending' && <>
                    <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={() => approveVerification(v.id)}>✓ Approve</button>
                    <button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => rejectVerification(v.id)}>✕ Reject</button>
                  </>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TERMS & CONDITIONS COMPLIANCE ── */}
        {activeTab === 'terms' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Users', value: tcStats?.total ?? 0, color: '#6366f1' },
                { label: 'Accepted T&C', value: tcStats?.accepted ?? 0, color: '#10b981' },
                { label: 'Pending Acceptance', value: tcStats?.pending ?? 0, color: '#f59e0b' },
                { label: 'Suspended', value: tcStats?.suspended ?? 0, color: '#ef4444' },
              ].map(s => (
                <div key={s.label} className={styles.overviewCard}>
                  <div className={styles.overviewValue} style={{ color: s.color }}>{s.value}</div>
                  <div className={styles.overviewLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}><FileText size={20} /> Terms & Conditions Compliance</h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link to="/terms" target="_blank" style={{ fontSize: '0.82rem', color: '#a5b4fc', textDecoration: 'none', border: '1px solid rgba(99,102,241,0.3)', padding: '0.3rem 0.75rem', borderRadius: '6px' }}>
                    View T&C Page →
                  </Link>
                  {(['all', 'accepted', 'pending'] as const).map(f => (
                    <button
                      key={f}
                      className={`${styles.actionBtn} ${tcFilter === f ? styles.actionBtnGreen : ''}`}
                      onClick={() => setTcFilter(f)}
                    >
                      {f === 'all' ? 'All' : f === 'accepted' ? '✓ Accepted' : '⏳ Pending'}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>T&C Status</th>
                      <th>Accepted On</th>
                      <th>Account Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tcUsers
                      .filter(u => tcFilter === 'all' ? true : tcFilter === 'accepted' ? u.tcAccepted : !u.tcAccepted)
                      .map(u => (
                        <tr key={u.id} style={{ opacity: u.suspended ? 0.6 : 1 }}>
                          <td>
                            <div className={styles.userCell}>
                              <div className={styles.userAvatar} style={{ background: roleColor[u.role] + '33', color: roleColor[u.role] }}>
                                {u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <div className={styles.userName}>{u.name}</div>
                                <div className={styles.userEmail}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: roleColor[u.role], fontWeight: 600 }}>{u.role}</span>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                              padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
                              background: u.tcAccepted ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                              color: u.tcAccepted ? '#10b981' : '#f59e0b',
                              border: `1px solid ${u.tcAccepted ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                            }}>
                              {u.tcAccepted ? '✓ Accepted' : '⏳ Pending'}
                            </span>
                          </td>
                          <td className={styles.dateCell}>
                            {u.tcAcceptedAt ? new Date(u.tcAcceptedAt).toLocaleDateString() : '—'}
                          </td>
                          <td><StatusPill active={!u.suspended} /></td>
                          <td>
                            <div className={styles.actionBtns}>
                              {!u.tcAccepted && (
                                <button
                                  className={`${styles.actionBtn} ${styles.actionBtnGreen}`}
                                  onClick={() => tcMarkAccepted(u.id)}
                                  title="Mark T&C as accepted"
                                  disabled={u.id === user?.id}
                                >
                                  ✓ Mark Accepted
                                </button>
                              )}
                              {u.suspended ? (
                                <button
                                  className={`${styles.actionBtn} ${styles.actionBtnGreen}`}
                                  onClick={() => tcActivate(u.id)}
                                  disabled={u.id === user?.id}
                                >
                                  <ToggleRight size={14} /> Activate
                                </button>
                              ) : (
                                <button
                                  className={`${styles.actionBtn} ${styles.actionBtnAmber}`}
                                  onClick={() => tcDeactivate(u.id)}
                                  disabled={u.id === user?.id}
                                  title="Deactivate for T&C non-compliance"
                                >
                                  <ToggleLeft size={14} /> Deactivate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {tcUsers.filter(u => tcFilter === 'all' ? true : tcFilter === 'accepted' ? u.tcAccepted : !u.tcAccepted).length === 0 && (
                  <div className={styles.emptyRow}>No users in this category.</div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1.25rem 1.5rem', background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f3f4f6' }}>
                <Shield size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} />
                Admin T&C Enforcement Policy
              </h3>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  'Users who have not accepted T&C may have restricted access to paid features.',
                  'Admins can deactivate accounts for non-compliance — users will see a notice on login.',
                  'Use "Mark Accepted" only when the user has confirmed acceptance through a support ticket.',
                  'All compliance actions are logged in the platform activity feed.',
                  'The full Terms & Conditions are publicly available at /terms.',
                ].map((point, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'flex', gap: '0.6rem' }}>
                    <span style={{ color: '#6366f1', flexShrink: 0 }}>•</span> {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === 'settings' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><DollarSign size={20} /> Monetization Settings</h2>
            </div>
            <div className={styles.settingsGrid}>
              {settings.map(s => (
                <div key={s.key} className={styles.settingCard}>
                  <label className={styles.settingLabel}>{s.description}</label>
                  <div className={styles.settingRow}>
                    <input
                      type="number"
                      className={styles.settingInput}
                      defaultValue={s.value}
                      onBlur={e => updateSetting(s.key, Number(e.target.value))}
                    />
                    <span className={styles.settingUnit}>{s.key.includes('percent') ? '%' : 'RWF'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── COURSE MODAL ── */}
      {showCourseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => e.target === e.currentTarget && setShowCourseModal(false)}>
          <div style={{ background: 'var(--bg-card, #1e2235)', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '560px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
              <button onClick={() => setShowCourseModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            {[
              { label: 'Title', key: 'title', type: 'text' },
              { label: 'Description', key: 'description', type: 'textarea' },
              { label: 'Price (RWF)', key: 'price', type: 'number' },
              { label: 'Certificate Fee (RWF)', key: 'certificateFee', type: 'number' },
              { label: 'Category', key: 'category', type: 'text' },
              { label: 'Tags (comma-separated)', key: 'tags', type: 'text' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea rows={3} value={(courseForm as any)[f.key]} onChange={e => setCourseForm(p => ({ ...p, [f.key]: e.target.value }))} className={styles.searchInput} style={{ width: '100%', resize: 'vertical' }} />
                ) : (
                  <input type={f.type} value={(courseForm as any)[f.key]} onChange={e => setCourseForm(p => ({ ...p, [f.key]: e.target.value }))} className={styles.searchInput} style={{ width: '100%' }} />
                )}
              </div>
            ))}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</label>
              <select value={courseForm.level} onChange={e => setCourseForm(p => ({ ...p, level: e.target.value }))} className={styles.filterSelect} style={{ width: '100%' }}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className={styles.actionBtn} onClick={() => setShowCourseModal(false)}>Cancel</button>
              <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={saveCourse}>{editingCourse ? 'Save Changes' : 'Create Course'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── JOB MODAL ── */}
      {showJobModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => e.target === e.currentTarget && setShowJobModal(false)}>
          <div style={{ background: 'var(--bg-card, #1e2235)', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '560px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{editingJob ? 'Edit Job' : 'Create New Job'}</h3>
              <button onClick={() => setShowJobModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            {[
              { label: 'Job Title', key: 'title', type: 'text' },
              { label: 'Company', key: 'company', type: 'text' },
              { label: 'Location', key: 'location', type: 'text' },
              { label: 'Salary', key: 'salary', type: 'text' },
              { label: 'Description', key: 'description', type: 'textarea' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea rows={3} value={(jobForm as any)[f.key]} onChange={e => setJobForm(p => ({ ...p, [f.key]: e.target.value }))} className={styles.searchInput} style={{ width: '100%', resize: 'vertical' }} />
                ) : (
                  <input type={f.type} value={(jobForm as any)[f.key]} onChange={e => setJobForm(p => ({ ...p, [f.key]: e.target.value }))} className={styles.searchInput} style={{ width: '100%' }} />
                )}
              </div>
            ))}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Type</label>
              <select value={jobForm.type} onChange={e => setJobForm(p => ({ ...p, type: e.target.value }))} className={styles.filterSelect} style={{ width: '100%' }}>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className={styles.actionBtn} onClick={() => setShowJobModal(false)}>Cancel</button>
              <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={saveJob}>{editingJob ? 'Save Changes' : 'Create Job'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── INSTRUCTOR MODAL ── */}
      {showInstructorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => e.target === e.currentTarget && setShowInstructorModal(false)}>
          <div style={{ background: 'var(--bg-card, #1e2235)', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '560px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Create Instructor Application</h3>
              <button onClick={() => setShowInstructorModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            {[
              { label: 'Name', key: 'name', type: 'text' },
              { label: 'Email', key: 'email', type: 'text' },
              { label: 'Qualification', key: 'qualification', type: 'text' },
              { label: 'Institution', key: 'institution', type: 'text' },
              { label: 'Specialties (comma-separated)', key: 'specialties', type: 'text' },
              { label: 'Years of Experience', key: 'yearsExperience', type: 'number' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                <input type={f.type} value={(instructorForm as any)[f.key]} onChange={e => setInstructorForm(p => ({ ...p, [f.key]: e.target.value }))} className={styles.searchInput} style={{ width: '100%' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className={styles.actionBtn} onClick={() => setShowInstructorModal(false)}>Cancel</button>
              <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={saveInstructor}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* ── COURSE QUEUE MODAL ── */}
      {showQueueModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => e.target === e.currentTarget && setShowQueueModal(false)}>
          <div style={{ background: 'var(--bg-card, #1e2235)', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '560px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Add Course to Queue</h3>
              <button onClick={() => setShowQueueModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            {[
              { label: 'Course Title', key: 'title', type: 'text' },
              { label: 'Description', key: 'description', type: 'textarea' },
              { label: 'Instructor Name', key: 'instructorName', type: 'text' },
              { label: 'Category', key: 'category', type: 'text' },
              { label: 'Price (RWF)', key: 'price', type: 'number' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea rows={3} value={(queueForm as any)[f.key]} onChange={e => setQueueForm(p => ({ ...p, [f.key]: e.target.value }))} className={styles.searchInput} style={{ width: '100%', resize: 'vertical' }} />
                ) : (
                  <input type={f.type} value={(queueForm as any)[f.key]} onChange={e => setQueueForm(p => ({ ...p, [f.key]: e.target.value }))} className={styles.searchInput} style={{ width: '100%' }} />
                )}
              </div>
            ))}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</label>
              <select value={queueForm.level} onChange={e => setQueueForm(p => ({ ...p, level: e.target.value }))} className={styles.filterSelect} style={{ width: '100%' }}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className={styles.actionBtn} onClick={() => setShowQueueModal(false)}>Cancel</button>
              <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={saveQueue}>Add to Queue</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TUTORIAL MODAL ── */}
      {showTutorialModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => e.target === e.currentTarget && setShowTutorialModal(false)}>
          <div style={{ background: 'var(--bg-card, #1e2235)', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '560px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Create New Tutorial</h3>
              <button onClick={() => setShowTutorialModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            {[
              { label: 'Title', key: 'title', type: 'text' },
              { label: 'Description', key: 'description', type: 'textarea' },
              { label: 'Category', key: 'category', type: 'text' },
              { label: 'Video URL', key: 'videoUrl', type: 'text' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea rows={3} value={(tutorialForm as any)[f.key]} onChange={e => setTutorialForm(p => ({ ...p, [f.key]: e.target.value }))} className={styles.searchInput} style={{ width: '100%', resize: 'vertical' }} />
                ) : (
                  <input type={f.type} value={(tutorialForm as any)[f.key]} onChange={e => setTutorialForm(p => ({ ...p, [f.key]: e.target.value }))} className={styles.searchInput} style={{ width: '100%' }} />
                )}
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</label>
                <select value={tutorialForm.level} onChange={e => setTutorialForm(p => ({ ...p, level: e.target.value }))} className={styles.filterSelect} style={{ width: '100%' }}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Language</label>
                <select value={tutorialForm.language} onChange={e => setTutorialForm(p => ({ ...p, language: e.target.value as any }))} className={styles.filterSelect} style={{ width: '100%' }}>
                  <option value="en">English</option>
                  <option value="rw">Kinyarwanda</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className={styles.actionBtn} onClick={() => setShowTutorialModal(false)}>Cancel</button>
              <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={saveTutorial}>Create Tutorial</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SKILL MODAL ── */}
      {showSkillModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => e.target === e.currentTarget && setShowSkillModal(false)}>
          <div style={{ background: 'var(--bg-card, #1e2235)', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '560px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Create New Skill Assignment</h3>
              <button onClick={() => setShowSkillModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            {[
              { label: 'Skill Name', key: 'name', type: 'text' },
              { label: 'Category', key: 'category', type: 'text' },
              { label: 'Description', key: 'description', type: 'textarea' },
              { label: 'Icon (Emoji)', key: 'icon', type: 'text' },
              { label: 'Questions Count', key: 'questionsCount', type: 'number' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea rows={3} value={(skillForm as any)[f.key]} onChange={e => setSkillForm(p => ({ ...p, [f.key]: e.target.value }))} className={styles.searchInput} style={{ width: '100%', resize: 'vertical' }} />
                ) : (
                  <input type={f.type} value={(skillForm as any)[f.key]} onChange={e => setSkillForm(p => ({ ...p, [f.key]: e.target.value }))} className={styles.searchInput} style={{ width: '100%' }} />
                )}
              </div>
            ))}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</label>
              <select value={skillForm.level} onChange={e => setSkillForm(p => ({ ...p, level: e.target.value }))} className={styles.filterSelect} style={{ width: '100%' }}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className={styles.actionBtn} onClick={() => setShowSkillModal(false)}>Cancel</button>
              <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={saveSkill}>Create Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
