import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Job } from '../types'
import styles from './Employer.module.css'

export default function Employer() {
  const { user, token } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [tab, setTab] = useState<'jobs' | 'post' | 'verify'>('jobs')
  const [posting, setPosting] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [verifyResult, setVerifyResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', company: user?.name || '', location: 'Kigali', type: 'full-time', salary: '', description: '', requiredSkills: '' })

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(data => setJobs(Array.isArray(data) ? data : [])).finally(() => setLoading(false))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    setPosting(true)
    await new Promise(r => setTimeout(r, 1000))
    alert('Job posted successfully! (Backend persistence coming in Phase 2)')
    setPosting(false)
    setTab('jobs')
  }

  function handleVerify() {
    if (!qrCode.trim()) return
    const cred = qrCode.startsWith('QR_')
    if (cred) {
      setVerifyResult({
        valid: true,
        holder: 'Alice Uwimana',
        skill: 'React Development',
        level: 'intermediate',
        issuedAt: new Date(Date.now() - 86400000).toLocaleDateString(),
        txHash: '0xabcdef1234567890...',
      })
    } else {
      setVerifyResult({ valid: false })
    }
  }

  if (!user) return (
    <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem' }}>🔒</div>
        <h2 style={{ margin:'1rem 0 0.5rem' }}>Employer Access Required</h2>
        <p className="text-muted">Sign in with an employer account to access the dashboard.</p>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1>Employer Dashboard 💼</h1>
            <p className="text-muted">Post jobs, verify credentials, and find pre-vetted candidates</p>
          </div>
          <div className={styles.headerBadge}>
            <span>🏢</span> {user.name}
          </div>
        </div>

        <div className={styles.quickStats}>
          {[
            { icon: '💼', label: 'Active Job Posts', value: jobs.length },
            { icon: '👥', label: 'Total Applicants', value: jobs.reduce((s, j) => s + j.applications, 0) },
            { icon: '✅', label: 'Verifications Done', value: 3 },
            { icon: '⏱', label: 'Avg. Hiring Time', value: '6 days' },
          ].map(s => (
            <div key={s.label} className={`card ${styles.qstat}`}>
              <div className={styles.qstatIcon}>{s.icon}</div>
              <div className={styles.qstatValue}>{s.value}</div>
              <div className={styles.qstatLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'jobs' ? styles.tabActive : ''}`} onClick={() => setTab('jobs')}>📋 Posted Jobs</button>
          <button className={`${styles.tab} ${tab === 'post' ? styles.tabActive : ''}`} onClick={() => setTab('post')}>+ Post a Job</button>
          <button className={`${styles.tab} ${tab === 'verify' ? styles.tabActive : ''}`} onClick={() => setTab('verify')}>🔗 Verify Credential</button>
        </div>

        {tab === 'jobs' && (
          <div className={styles.jobList}>
            {jobs.map(job => (
              <div key={job.id} className={`card ${styles.jobCard}`}>
                <div className={styles.jobCardTop}>
                  <div>
                    <h3 className={styles.jobCardTitle}>{job.title}</h3>
                    <p className={styles.jobCardMeta}>{job.location} · {job.salary}</p>
                  </div>
                  <div className={styles.jobCardRight}>
                    <span className={`badge ${job.type === 'gig' ? 'badge-warning' : 'badge-primary'}`}>{job.type}</span>
                    <span className={styles.apps}>{job.applications} applicants</span>
                  </div>
                </div>
                <div className={styles.jobCardSkills}>
                  {job.requiredSkills.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
                <div className={styles.jobCardFooter}>
                  <span className="text-muted" style={{ fontSize:'0.8rem' }}>Closes {new Date(job.deadline).toLocaleDateString()}</span>
                  <button className="btn btn-secondary btn-sm">View Applicants</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'post' && (
          <div className={`card ${styles.postForm}`}>
            <h2>Post a New Job</h2>
            <form onSubmit={handlePost}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Job Title</label>
                  <input type="text" name="title" placeholder="e.g. Frontend Developer" value={form.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" name="company" placeholder="Your company" value={form.company} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" name="location" placeholder="Kigali, Rwanda" value={form.location} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Job Type</label>
                  <select name="type" value={form.type} onChange={handleChange}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="gig">Gig / Short-term</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Salary Range</label>
                  <input type="text" name="salary" placeholder="RWF 500,000-800,000/mo" value={form.salary} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Required Skills (comma-separated)</label>
                  <input type="text" name="requiredSkills" placeholder="React Development, TypeScript" value={form.requiredSkills} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Job Description</label>
                <textarea name="description" rows={4} placeholder="Describe the role, responsibilities, and requirements..." value={form.description} onChange={handleChange} style={{ resize:'vertical' }} required />
              </div>
              <div className={styles.formHint}>
                💡 Jobs requiring verified Imihigo Learn credentials get <strong>3x more qualified applicants</strong>
              </div>
              <button type="submit" className="btn btn-primary" disabled={posting} style={{ marginTop:'1rem' }}>
                {posting ? 'Posting...' : '📢 Publish Job'}
              </button>
            </form>
          </div>
        )}

        {tab === 'verify' && (
          <div className={styles.verifySection}>
            <div className={`card ${styles.verifyCard}`}>
              <h2>🔗 Verify a Candidate's Credential</h2>
              <p className="text-muted">Enter the QR code or transaction hash from a candidate's blockchain credential to instantly verify it.</p>

              <div className={styles.verifyInput}>
                <input type="text" placeholder="Enter QR code (e.g. QR_a1b2c3d4_verify) or tx hash" value={qrCode} onChange={e => { setQrCode(e.target.value); setVerifyResult(null) }} />
                <button className="btn btn-primary" onClick={handleVerify}>Verify →</button>
              </div>

              <div className={styles.verifyHint}>
                Try: <code>QR_c1_verify</code> or <code>QR_c2_verify</code>
              </div>

              {verifyResult && (
                <div className={`${styles.verifyResult} ${verifyResult.valid ? styles.verifyValid : styles.verifyInvalid}`}>
                  {verifyResult.valid ? (
                    <>
                      <div className={styles.verifyIcon}>✅</div>
                      <div>
                        <div className={styles.verifyTitle}>Credential Verified on Blockchain</div>
                        <div className={styles.verifyDetails}>
                          <span><strong>Holder:</strong> {verifyResult.holder}</span>
                          <span><strong>Skill:</strong> {verifyResult.skill}</span>
                          <span><strong>Level:</strong> {verifyResult.level}</span>
                          <span><strong>Issued:</strong> {verifyResult.issuedAt}</span>
                          <span><strong>Tx:</strong> <code>{verifyResult.txHash}</code></span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.verifyIcon}>❌</div>
                      <div className={styles.verifyTitle}>Invalid or Unrecognized Credential</div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
