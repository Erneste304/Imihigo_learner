import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import styles from './Admin.module.css'
import { Users, BookOpen, Briefcase, DollarSign, CheckCircle, Activity, Shield, Video, Trash2, ToggleLeft, ToggleRight, Star } from 'lucide-react'
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

type Tab = 'overview' | 'users' | 'courses' | 'tutorials' | 'jobs' | 'verifications' | 'settings'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',      label: 'Overview',      icon: <Activity size={15} /> },
  { id: 'users',         label: 'Users',          icon: <Users size={15} /> },
  { id: 'courses',       label: 'Courses',        icon: <BookOpen size={15} /> },
  { id: 'tutorials',     label: 'Tutorials',      icon: <Video size={15} /> },
  { id: 'jobs',          label: 'Jobs',           icon: <Briefcase size={15} /> },
  { id: 'verifications', label: 'Verifications',  icon: <CheckCircle size={15} /> },
  { id: 'settings',      label: 'Settings',       icon: <DollarSign size={15} /> },
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
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const feedRef = useRef<HTMLDivElement>(null)

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
    ]).then(([st, us, co, tu, jo, ve, se, ac]) => {
      if (st.data.success) setStats(st.data.data)
      if (us.data.success) setUsers(us.data.data)
      if (co.data.success) setCourses(co.data.data)
      if (tu.data.success) setTutorials(tu.data.data)
      if (jo.data.success) setJobs(jo.data.data)
      if (ve.data.success) setVerifications(ve.data.data)
      if (se.data.success) setSettings(se.data.data)
      if (ac.data.success) setActivityFeed(ac.data.data)
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
              <span className={styles.countBadge}>{courses.length} total</span>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Course</th><th>Instructor</th><th>Enrolled</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id} style={{ opacity: c.active ? 1 : 0.55 }}>
                      <td>
                        <div className={styles.userName}>{c.title}</div>
                        <div className={styles.userEmail}>{c.description?.slice(0, 50)}…</div>
                      </td>
                      <td className={styles.dateCell}>{c.instructorName}</td>
                      <td className={styles.dateCell}>{c.enrolledCount}</td>
                      <td className={styles.dateCell}>${c.price}</td>
                      <td><StatusPill active={c.active} /></td>
                      <td>
                        <button
                          className={`${styles.actionBtn} ${c.active ? styles.actionBtnAmber : styles.actionBtnGreen}`}
                          onClick={() => toggleCourse(c.id)}
                        >
                          {c.active ? <><ToggleLeft size={14} /> Deactivate</> : <><ToggleRight size={14} /> Activate</>}
                        </button>
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
              <span className={styles.countBadge}>{tutorials.length} total</span>
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

        {/* ── JOBS ── */}
        {activeTab === 'jobs' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><Briefcase size={20} /> Job Listing Management</h2>
              <span className={styles.countBadge}>{jobs.length} total</span>
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
                      <td className={styles.dateCell}>{j.applications}</td>
                      <td><StatusPill active={j.active} /></td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button
                            className={`${styles.actionBtn} ${j.active ? styles.actionBtnAmber : styles.actionBtnGreen}`}
                            onClick={() => toggleJob(j.id)}
                          >
                            {j.active ? <><ToggleLeft size={14} /> Deactivate</> : <><ToggleRight size={14} /> Activate</>}
                          </button>
                          <button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => deleteJob(j.id)}>
                            <Trash2 size={14} /> Delete
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
                  <span className={styles.pendingBadge}>⏳ {v.status}</span>
                  <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`}>✓ Approve</button>
                  <button className={`${styles.actionBtn} ${styles.actionBtnRed}`}>✕ Reject</button>
                </div>
              </div>
            ))}
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
    </div>
  )
}
