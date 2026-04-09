import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import ApplyModal from '../components/ApplyModal'
import { Job } from '../types'
import styles from './Jobs.module.css'
import { Brain, MapPin, Clock, Wifi, ChevronRight, CheckCircle } from 'lucide-react'

// SVG Ring for AI score
function ScoreRing({ score }: { score: number }) {
  const size = 64
  const strokeWidth = 5
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#6366f1'

  return (
    <div className={styles.matchRing}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className={styles.matchRingLabel} style={{ color }}>
        {score}%
        <span className={styles.matchRingText}>match</span>
      </div>
    </div>
  )
}

export default function Jobs() {
  const [jobs, setJobs] = useState<(Job & { applied?: boolean; matchRate?: number; applications?: number })[]>([])
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [remote, setRemote] = useState(false)
  const [loading, setLoading] = useState(true)
  const [applyingJob, setApplyingJob] = useState<(Job & { applied?: boolean }) | null>(null)
  const { user, token } = useAuth()

  const fetchJobs = async () => {
    setLoading(true)
    const url = user && token ? `/api/jobs/match/${user.id}` : `/api/jobs`
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    try {
      const r = await fetch(url, { headers: headers as any })
      const data = await r.json()
      setJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [user, token])

  const filtered = jobs.filter(j => {
    if (filter && !j.title.toLowerCase().includes(filter.toLowerCase()) && !j.company.toLowerCase().includes(filter.toLowerCase())) return false
    if (typeFilter && j.type !== typeFilter) return false
    if (remote && !j.remote) return false
    return true
  })

  const highMatchJobs = filtered.filter(j => (j.matchRate || 0) >= 80).length
  const appliedCount = filtered.filter(j => j.applied).length

  const typeColors: Record<string, string> = {
    'full-time': 'badge-primary', 'part-time': 'badge-warning', 'contract': 'badge-gray', 'gig': 'badge-warning',
  }
  const typeIcons: Record<string, string> = {
    'full-time': '💼', 'part-time': '⏰', 'contract': '📄', 'gig': '⚡'
  }

  if (loading) return <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="spinner" /></div>

  return (
    <div className="page">
      <Helmet>
        <title>{filter ? `Jobs matching "${filter}" | Imihigo Learn` : "Career Opportunities | Imihigo Learn"}</title>
      </Helmet>

      <div className={styles.header}>
        <div>
          <h1>Career Opportunities</h1>
          <p className="text-muted" style={{ fontSize: '1.05rem' }}>
            {user ? '🧠 AI-matched to your verified skills — highest fit shown first' : 'Browse all positions & sign in for personalized matching'}
          </p>
        </div>
        {!user && <Link to="/auth" className="btn btn-primary">Sign in for AI Matching</Link>}
      </div>

      {/* AI Match Hero (only for logged-in users with data) */}
      {user && filtered.length > 0 && (
        <div className={styles.matchHero}>
          <div className={styles.matchHeroText}>
            <h2>🧠 Your AI Career Profile is Active</h2>
            <p>Based on your verified credentials and job history, we've ranked {filtered.length} openings by compatibility.</p>
          </div>
          <div className={styles.matchStats}>
            <div className={styles.matchStat}>
              <div className={styles.matchStatNum}>{filtered.length}</div>
              <div className={styles.matchStatLabel}>Openings</div>
            </div>
            <div className={styles.matchStat}>
              <div className={styles.matchStatNum}>{highMatchJobs}</div>
              <div className={styles.matchStatLabel}>High Match</div>
            </div>
            <div className={styles.matchStat}>
              <div className={styles.matchStatNum}>{appliedCount}</div>
              <div className={styles.matchStatLabel}>Applied</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <Brain size={18} style={{ color: '#6366f1', flexShrink: 0 }} />
        <input
          type="text" placeholder="Search jobs, companies, or skills..."
          value={filter} onChange={e => setFilter(e.target.value)}
          style={{ flex: 1, maxWidth: 340 }}
        />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="gig">Gig</option>
        </select>
        <label className={styles.remoteToggle}>
          <Wifi size={14} style={{ color: '#6366f1' }} />
          <input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} />
          Remote only
        </label>
        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          {filtered.length} position{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Job Grid */}
      <div className={styles.jobGrid}>
        {filtered.map(job => (
          <div key={job.id} className={styles.jobCard}>
            <div className={styles.jobHeader}>
              <div className={styles.companyLogo}>{job.company[0]}</div>
              <div className={styles.jobInfo}>
                <div className={styles.jobTitle}>{job.title}</div>
                <div className={styles.jobMeta}>
                  <span style={{ marginRight: '0.75rem' }}>{typeIcons[job.type]} {job.company}</span>
                  <span style={{ opacity: 0.7 }}><MapPin size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {job.location}</span>
                </div>
              </div>
              {job.matchRate !== undefined && <ScoreRing score={job.matchRate} />}
            </div>

            <p className={styles.jobDesc}>{job.description}</p>

            {/* Skill Match Breakdown */}
            {job.requiredSkills?.length > 0 && (
              <div className={styles.skillsRow}>
                {job.requiredSkills.map(skill => {
                  const userSkills = (user?.skills || []).map(s => s.toLowerCase())
                  const isMatch = userSkills.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us))
                  return (
                    <span key={skill} className={`${styles.skillTag} ${isMatch ? styles.skillTagMatch : styles.skillTagMissing}`}>
                      {isMatch && <CheckCircle size={10} style={{ display: 'inline', marginRight: 3 }} />}
                      {skill}
                    </span>
                  )
                })}
              </div>
            )}

            <div className={styles.appFooter}>
              <span>{job.applications || 0} applicants</span>
              <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                {(job as any).deadline ? new Date((job as any).deadline).toLocaleDateString() : 'Open'}
              </span>
            </div>

            <div className={styles.footer}>
              <div className={styles.badges}>
                <span className={`badge ${typeColors[job.type] || 'badge-gray'}`}>{job.type}</span>
                {job.remote && <span className="badge badge-success">Remote</span>}
              </div>
              <span className={styles.salary}>{job.salary || 'Negotiable'}</span>
            </div>

            <button
              className={`${styles.applyBtn} ${job.applied ? styles.applyBtnSuccess : ''}`}
              disabled={job.applied}
              onClick={() => !job.applied && setApplyingJob(job)}
            >
              {job.applied ? <><CheckCircle size={16} /> Application Sent</> : <>Apply Now <ChevronRight size={16} /></>}
            </button>
          </div>
        ))}
      </div>

      {applyingJob && token && (
        <ApplyModal
          job={applyingJob}
          token={token}
          onClose={() => setApplyingJob(null)}
          onSuccess={() => { setApplyingJob(null); fetchJobs() }}
        />
      )}

      {filtered.length === 0 && !loading && (
        <div className={styles.empty}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
          <p>No positions match your current filters.</p>
        </div>
      )}
    </div>
  )
}


export default function Jobs() {
  const [jobs, setJobs] = useState<(Job & { applied?: boolean; matchRate?: number; applications?: number })[]>([])
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [remote, setRemote] = useState(false)
  const [loading, setLoading] = useState(true)
  const [applyingJob, setApplyingJob] = useState<(Job & { applied?: boolean }) | null>(null)
  const { user, token } = useAuth()

  const fetchJobs = async () => {
    setLoading(true)
    const url = user && token
      ? `/api/jobs/match/${user.id}`
      : `/api/jobs`
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    try {
      const r = await fetch(url, { headers: headers as any })
      const data = await r.json()
      setJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [user, token])

  const filtered = jobs.filter(j => {
    if (filter && !j.title.toLowerCase().includes(filter.toLowerCase()) && !j.company.toLowerCase().includes(filter.toLowerCase())) return false
    if (typeFilter && j.type !== typeFilter) return false
    if (remote && !j.remote) return false
    return true
  })

  const typeColors: Record<string, string> = {
    'full-time': 'badge-primary',
    'part-time': 'badge-warning',
    'contract': 'badge-gray',
    'gig': 'badge-warning',
  }

  if (loading) return <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="spinner" /></div>

  return (
    <div className="page">
      <Helmet>
        <title>{filter ? `Jobs matching "${filter}" | Imihigo Learn` : "Jobs | Imihigo Learn"}</title>
        <meta name="description" content="Find tech, gig, and informal sector jobs verified by your blockchain skills in Rwanda." />
      </Helmet>

      <div className="container">
        <div className={styles.header}>
          <div>
            <h1>Job Opportunities</h1>
            <p className="text-muted">
              {user ? 'Matched to your verified skills — sorted by compatibility' : 'Browse all available positions'}
            </p>
          </div>
          {!user && <Link to="/auth" className="btn btn-primary">Sign in for matched jobs</Link>}
        </div>

        <div className={styles.filters}>
          <input
            type="text" placeholder="Search jobs or companies..."
            value={filter} onChange={e => setFilter(e.target.value)}
            style={{ width: 'auto', flex: 1, maxWidth: 320 }}
          />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="gig">Gig</option>
          </select>
          <label className={styles.remoteToggle}>
            <input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} />
            Remote only
          </label>
        </div>

        <div className={styles.jobGrid}>
          {filtered.map(job => (
            <div key={job.id} className={`card ${styles.jobCard}`}>
              <div className={styles.jobHeader}>
                <div className={styles.companyLogo}>{job.company[0]}</div>
                <div className={styles.jobInfo}>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <div className={styles.jobMeta}>{job.company} · {job.location}</div>
                </div>
                {job.matchRate !== undefined && (
                  <div className={styles.match} style={{ color: job.matchRate >= 80 ? '#10b981' : job.matchRate >= 50 ? '#f59e0b' : '#6b7280' }}>
                    <div className={styles.matchNum}>{job.matchRate}%</div>
                    <div className={styles.matchLabel}>match</div>
                  </div>
                )}
              </div>

              <p className={styles.jobDesc}>{job.description}</p>

              <div className={styles.skills}>
                {job.requiredSkills.map(s => <span key={s} className="tag">{s}</span>)}
              </div>

              <div className={styles.footer}>
                <div className={styles.badges}>
                  <span className={`badge ${typeColors[job.type] || 'badge-gray'}`}>{job.type}</span>
                  {job.remote && <span className="badge badge-success">Remote</span>}
                </div>
                <div className={styles.salary}>{job.salary}</div>
              </div>

              <div className={styles.appFooter}>
                <span className={styles.apps}>{job.applications || 0} applicants</span>
                <span className={styles.deadline}>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
              </div>

              {job.applied ? (
                <button className="btn btn-success" disabled style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', opacity: 0.8 }}>
                  ✓ Application Sent
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
                  onClick={() => setApplyingJob(job)}
                >
                  Apply Now →
                </button>
              )}
            </div>
          ))}
        </div>

        {applyingJob && token && (
          <ApplyModal
            job={applyingJob}
            token={token}
            onClose={() => setApplyingJob(null)}
            onSuccess={() => {
              setApplyingJob(null)
              fetchJobs() // Refresh to show applied status
            }}
          />
        )}

        {filtered.length === 0 && (
          <div className={styles.empty}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
            <p>No jobs match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
