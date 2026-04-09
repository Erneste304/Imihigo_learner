import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import ApplyModal from '../components/ApplyModal'
import { Job } from '../types'
import styles from './Jobs.module.css'

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

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><div className="spinner" /></div>

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
                <button className="btn btn-success" disabled style={{ width:'100%', justifyContent:'center', marginTop:'0.75rem', opacity: 0.8 }}>
                  ✓ Application Sent
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  style={{ width:'100%', justifyContent:'center', marginTop:'0.75rem' }}
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
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>💼</div>
            <p>No jobs match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
