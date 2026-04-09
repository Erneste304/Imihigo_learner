import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import styles from './Admin.module.css'
import { Users, BookOpen, Briefcase, DollarSign, CheckCircle, Zap, Activity, Shield } from 'lucide-react'
import { io as connectSocket } from 'socket.io-client'

interface Stats {
  totalUsers: number
  totalAssessmentsTaken: number
  totalJobs: number
  totalApplications: number
  totalJobs: number
  totalApplications: number
  totalRevenue: number
  totalPendingVideos: number
  usersByRole: {
    candidates: number
    employers: number
    instructors: number
    admins: number
  }
  totalCourses: number
  totalInternationalCerts: number
}

interface AdminSetting {
  key: string
  value: any
  description: string
}

interface Verification {
  id: string
  userName: string
  skill: string
  videoUrl: string
  status: string
  submittedAt: string
}

export default function Admin() {
  const { token, user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [settings, setSettings] = useState<AdminSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'verifications' | 'monetization'>('overview')
  const [activityFeed, setActivityFeed] = useState<any[]>([])
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) return
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/verifications'),
      api.get('/admin/settings'),
      api.get('/admin/activities')
    ])
    .then(([statsRes, usersRes, verRes, setRes, actRes]) => {
      if (statsRes.data.success) setStats(statsRes.data.data)
      if (usersRes.data.success) setUsers(usersRes.data.data)
      if (verRes.data.success) setVerifications(verRes.data.data)
      if (setRes.data.success) setSettings(setRes.data.data)
      if (actRes.data.success) setActivityFeed(actRes.data.data)
    })
    .catch(console.error)
    .finally(() => setLoading(false))
  }, [token])

  // Real-time activity via Socket.io
  useEffect(() => {
    const socket = connectSocket('http://localhost:3001')
    socket.on('platform-activity', (activity: any) => {
      setActivityFeed(prev => [activity, ...prev].slice(0, 50))
      // Auto-scroll feed
      if (feedRef.current) {
        feedRef.current.scrollTop = 0
      }
    })
    return () => { socket.disconnect() }
  }, [])

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role })
      if (res.data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role } : u))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      const res = await api.delete(`/admin/users/${userId}`)
      if (res.data.success) {
        setUsers(users.filter(u => u.id !== userId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const updateSetting = async (key: string, value: any) => {
    try {
      const res = await api.put(`/admin/settings/${key}`, { value })
      if (res.data.success) {
        setSettings(settings.map(s => s.key === key ? { ...s, value } : s))
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="page" style={{display:'flex',justifyContent:'center',alignItems:'center'}}><div className="spinner" /></div>
  
  if (user?.role !== 'admin') {
    return (
      <div className="page" style={{display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column'}}>
        <h2>Access Denied</h2>
        <p>You need Administrator privileges to view this page.</p>
        <button className="btn btn-primary mt-2" onClick={() => window.history.back()}>Go Back</button>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Platform Administration</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Mission Control — Imihigo Learn</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-2 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 dark:text-green-400 text-sm font-bold">System Online</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b dark:border-gray-800">
          {['overview', 'users', 'verifications', 'monetization'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 px-2 capitalize font-bold transition-all ${
                activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Row */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Users className="text-blue-600" /></div>
                <div>
                  <div className={styles.statValue}>{stats?.totalUsers ?? 0}</div>
                  <div className={styles.statLabel}>Total Users</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><BookOpen className="text-purple-600" /></div>
                <div>
                  <div className={styles.statValue}>{stats?.totalCourses ?? 0}</div>
                  <div className={styles.statLabel}>Active Courses</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Briefcase className="text-green-600" /></div>
                <div>
                  <div className={styles.statValue}>{stats?.totalJobs ?? 0}</div>
                  <div className={styles.statLabel}>Active Jobs</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><DollarSign className="text-yellow-600" /></div>
                <div>
                  <div className={styles.statValue}>{(stats?.totalRevenue ?? 0).toLocaleString()} RWF</div>
                  <div className={styles.statLabel}>Platform Revenue</div>
                </div>
              </div>
            </div>

            {/* Live Feed + Role Breakdown Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Activity Feed */}
              <div className="lg:col-span-2 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="font-bold text-white">Live Activity Feed</h3>
                  </div>
                  <span className="text-xs text-gray-500 uppercase tracking-widest">Real-time</span>
                </div>
                <div ref={feedRef} className="h-80 overflow-y-auto p-4 space-y-3">
                  {activityFeed.length === 0 && (
                    <div className="text-gray-600 italic text-center py-8">
                      No activity yet. Events will appear here in real-time.
                    </div>
                  )}
                  {activityFeed.map((a, i) => (
                    <div key={a.id || i} className="flex items-start gap-3 p-3 bg-gray-800/60 rounded-xl animate-in fade-in duration-500">
                      <div className={`p-1.5 rounded-lg text-sm ${
                        a.type === 'CERTIFICATE_ISSUED' ? 'bg-green-900/60 text-green-400' :
                        a.type === 'JOB_APPLIED' ? 'bg-blue-900/60 text-blue-400' :
                        a.type === 'USER_REGISTER' ? 'bg-purple-900/60 text-purple-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {a.type === 'CERTIFICATE_ISSUED' ? '🏆' :
                         a.type === 'JOB_APPLIED' ? '💼' :
                         a.type === 'USER_REGISTER' ? '👤' :
                         a.type === 'ASSESSMENT_COMPLETED' ? '📋' : '⚡'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 text-sm leading-tight">{a.message}</p>
                        <p className="text-gray-600 text-xs mt-1">{new Date(a.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Role Breakdown */}
              <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <Shield size={18} className="text-blue-600" /> User Breakdown
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Job Seekers', count: stats?.usersByRole?.candidates ?? 0, color: 'bg-blue-500' },
                    { label: 'Employers', count: stats?.usersByRole?.employers ?? 0, color: 'bg-green-500' },
                    { label: 'Instructors', count: stats?.usersByRole?.instructors ?? 0, color: 'bg-purple-500' },
                    { label: 'Admins', count: stats?.usersByRole?.admins ?? 0, color: 'bg-red-500' },
                  ].map(r => (
                    <div key={r.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{r.label}</span>
                        <span className="font-bold">{r.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div
                          className={`${r.color} h-2 rounded-full transition-all duration-700`}
                          style={{ width: `${stats?.totalUsers ? Math.round((r.count / stats.totalUsers) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t dark:border-gray-800">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Int'l Certificates</span>
                    <span className="font-bold text-green-600">{stats?.totalInternationalCerts ?? 0} issued</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Assessments Taken</span>
                    <span className="font-bold text-blue-600">{stats?.totalAssessmentsTaken ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className={styles.card}>
            <h2 className="flex items-center gap-2 mb-6 text-xl font-bold">
              <Users size={24} className="text-blue-600" /> User Management
            </h2>
            <div className={styles.tableResp}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.name}</strong><br/>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>ID: {u.id}</span>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                          disabled={u.id === user?.id}
                        >
                          <option value="jobseeker">Job Seeker</option>
                          <option value="employer">Employer</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button 
                          className="text-red-600 hover:text-red-900 font-medium"
                          onClick={() => deleteUser(u.id)}
                          disabled={u.id === user?.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'verifications' && (
          <div className={styles.card}>
            <h2 className="flex items-center gap-2 mb-6 text-xl font-bold">
              <CheckCircle size={24} className="text-green-600" /> Verification Queue
            </h2>
            <div className="space-y-4">
              {verifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 italic">No pending verifications.</div>
              ) : verifications.map(v => (
                <div key={v.id} className="border dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition bg-gray-50 dark:bg-gray-900/40">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{v.userName}</h4>
                      <p className="text-sm text-blue-600 font-semibold">{v.skill}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-tighter">
                      {v.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500">{new Date(v.submittedAt).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm">Preview Video</button>
                      <button className="btn btn-primary btn-sm">Approve</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'monetization' && (
          <div className={styles.card}>
            <h2 className="flex items-center gap-2 mb-6 text-xl font-bold">
              <DollarSign size={24} className="text-amber-500" /> Monetization Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {settings.map(s => (
                <div key={s.key} className="p-6 bg-gray-100 dark:bg-gray-800 rounded-3xl">
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">{s.description}</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      defaultValue={s.value} 
                      className="flex-1 p-4 rounded-2xl bg-white dark:bg-gray-900 border dark:border-gray-700 text-lg font-bold"
                      onBlur={(e) => updateSetting(s.key, Number(e.target.value))}
                    />
                    <div className="text-xl font-bold text-blue-600">
                      {s.key.includes('percent') ? '%' : 'USD'}
                    </div>
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
