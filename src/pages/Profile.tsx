import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Credential, Assessment } from '../types'
import styles from './Profile.module.css'

export default function Profile() {
  const { user, token } = useAuth()
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const h = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch('/api/users/me/credentials', { headers: h }).then(r => r.json()),
      fetch('/api/users/me/assessments', { headers: h }).then(r => r.json()),
    ]).then(([c, a]) => {
      setCredentials(Array.isArray(c) ? c : [])
      setAssessments(Array.isArray(a) ? a : [])
    }).finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><div className="spinner" /></div>

  const passedCount = assessments.filter(a => a.passed).length
  const avgScore = assessments.length > 0
    ? Math.round(assessments.filter(a => a.score > 0).reduce((s, a) => s + a.score, 0) / assessments.filter(a => a.score > 0).length)
    : 0

  return (
    <div className="page">
      <div className="container">
        <div className={styles.profileCard}>
          <div className={styles.avatarLarge}>{user?.name?.[0]?.toUpperCase()}</div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{user?.name}</h1>
            <div className={styles.profileMeta}>
              <span>{user?.email}</span>
              {user?.location && <span>📍 {user.location}</span>}
              <span className={`badge ${user?.verified ? 'badge-success' : 'badge-gray'}`}>
                {user?.verified ? '✓ Verified' : 'Unverified'}
              </span>
            </div>
            {user?.bio && <p className={styles.bio}>{user.bio}</p>}
          </div>
          <div className={styles.tokenBadge}>🪙 {user?.tokens} Tokens</div>
        </div>

        <div className={`grid-4 ${styles.statsRow}`}>
          {[
            { icon: '📝', label: 'Assessments', value: assessments.length },
            { icon: '✅', label: 'Passed', value: passedCount },
            { icon: '🏅', label: 'Credentials', value: credentials.length },
            { icon: '📊', label: 'Avg Score', value: avgScore ? `${avgScore}%` : 'N/A' },
          ].map(s => (
            <div key={s.label} className={`card ${styles.statCard}`}>
              <div className={styles.statIcon}>{s.icon}</div>
              <div className={styles.statVal}>{s.value}</div>
              <div className={styles.statLbl}>{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className={styles.sectionTitle}>Blockchain Credentials</h2>
        {credentials.length === 0 ? (
          <div className={`card ${styles.empty}`}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🏅</div>
            <p>No credentials yet. Pass a skill assessment to earn verified certificates.</p>
          </div>
        ) : (
          <div className="grid-2" style={{ marginBottom:'2.5rem' }}>
            {credentials.map(c => (
              <div key={c.id} className={`card ${styles.credCard}`}>
                <div className={styles.credTop}>
                  <div className={styles.credIcon}>🏅</div>
                  <div className={styles.credInfo}>
                    <div className={styles.credName}>{c.skillName}</div>
                    <div className={styles.credLevel}>{c.level}</div>
                  </div>
                  <span className="badge badge-success">Blockchain Verified</span>
                </div>
                <div className={styles.txInfo}>
                  <div className={styles.txLabel}>Transaction Hash</div>
                  <div className={styles.txHash}>{c.txHash}</div>
                </div>
                <div className={styles.credFooter}>
                  <span className={styles.credDate}>📅 {new Date(c.issuedAt).toLocaleDateString()}</span>
                  <button className="btn btn-secondary btn-sm">📤 Share</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className={styles.sectionTitle}>Assessment History</h2>
        <div className={styles.assessmentList}>
          {assessments.length === 0 ? (
            <div className={`card ${styles.empty}`}>
              <p>No assessments taken yet.</p>
            </div>
          ) : assessments.map(a => (
            <div key={a.id} className={`card ${styles.aCard}`}>
              <div className={styles.aLeft}>
                <div className={a.passed ? 'text-success' : a.status === 'failed' ? 'text-danger' : 'text-muted'} style={{ fontSize:'1.5rem' }}>
                  {a.passed ? '✅' : a.status === 'failed' ? '❌' : '🔄'}
                </div>
                <div>
                  <div className={styles.aSkill}>Skill ID: {a.skillId}</div>
                  <div className={styles.aDate}>{new Date(a.startedAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className={styles.aRight}>
                <div className={styles.aScore} style={{ color: a.score >= 70 ? '#10b981' : '#ef4444' }}>
                  {a.score}%
                </div>
                <span className={`badge ${a.passed ? 'badge-success' : a.status === 'failed' ? 'badge-danger' : 'badge-gray'}`}>
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
