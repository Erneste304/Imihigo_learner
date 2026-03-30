import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Assessment, Credential, Job } from '../types'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user, token } = useAuth()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const h = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch('/api/users/me/assessments', { headers: h }).then(r => r.json()),
      fetch('/api/users/me/credentials', { headers: h }).then(r => r.json()),
      fetch(`/api/jobs/match/${user?.id}`, { headers: h }).then(r => r.json()),
    ]).then(([a, c, j]) => {
      setAssessments(Array.isArray(a) ? a : [])
      setCredentials(Array.isArray(c) ? c : [])
      setJobs(Array.isArray(j) ? j.slice(0, 4) : [])
    }).finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><div className="spinner" /></div>

  const completed = assessments.filter(a => a.status === 'completed').length
  const passed = assessments.filter(a => a.passed).length

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.greeting}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-muted">Track your progress and find your next opportunity</p>
          </div>
          <Link to="/skills" className="btn btn-primary">+ Take Assessment</Link>
        </div>

        <div className={`grid-4 ${styles.stats}`}>
          {[
            { icon: '🎯', label: 'Assessments Taken', value: completed },
            { icon: '✅', label: 'Skills Passed', value: passed },
            { icon: '🏅', label: 'Credentials Earned', value: credentials.length },
            { icon: '🪙', label: 'Tokens Earned', value: user?.tokens || 0 },
          ].map(s => (
            <div key={s.label} className={`card ${styles.statCard}`}>
              <div className={styles.statIcon}>{s.icon}</div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.twoCol}>
          <div>
            <div className={styles.sectionTitle}>
              <h2>Your Credentials</h2>
              <Link to="/profile" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            {credentials.length === 0 ? (
              <div className={`card ${styles.empty}`}>
                <div className={styles.emptyIcon}>🏅</div>
                <p>No credentials yet. Take a skill assessment to earn your first certificate!</p>
                <Link to="/skills" className="btn btn-primary btn-sm mt-2">Browse Skills</Link>
              </div>
            ) : (
              <div className={styles.credList}>
                {credentials.map(c => (
                  <div key={c.id} className={`card ${styles.credCard}`}>
                    <div className={styles.credTop}>
                      <div className={styles.credIcon}>🏅</div>
                      <div>
                        <div className={styles.credName}>{c.skillName}</div>
                        <div className={styles.credDate}>Issued {new Date(c.issuedAt).toLocaleDateString()}</div>
                      </div>
                      <span className="badge badge-success">Verified</span>
                    </div>
                    <div className={styles.credHash}>
                      <span>🔗</span>
                      <span className={styles.hashText}>{c.txHash.slice(0, 18)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className={styles.sectionTitle}>
              <h2>Matched Jobs</h2>
              <Link to="/jobs" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            <div className={styles.jobList}>
              {jobs.map(j => (
                <div key={j.id} className={`card ${styles.jobCard}`}>
                  <div className={styles.jobTop}>
                    <div>
                      <div className={styles.jobTitle}>{j.title}</div>
                      <div className={styles.jobCompany}>{j.company} · {j.location}</div>
                    </div>
                    {(j.matchRate ?? 0) > 0 && (
                      <div className={styles.matchRate} style={{ color: (j.matchRate ?? 0) >= 80 ? '#10b981' : (j.matchRate ?? 0) >= 50 ? '#f59e0b' : '#6b7280' }}>
                        {j.matchRate}%
                      </div>
                    )}
                  </div>
                  <div className={styles.jobMeta}>
                    <span className={`badge ${j.type === 'gig' ? 'badge-warning' : 'badge-primary'}`}>{j.type}</span>
                    {j.remote && <span className="badge badge-success">Remote</span>}
                    <span className={styles.salary}>{j.salary}</span>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <div className={`card ${styles.empty}`}>
                  <div className={styles.emptyIcon}>💼</div>
                  <p>Earn credentials to unlock personalized job matches!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
