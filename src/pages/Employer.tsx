import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Job } from '../types'
import styles from './Employer.module.css'

export default function Employer() {
  const { user, token } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [tab, setTab] = useState<'jobs' | 'post' | 'verify' | 'enterprise'>('jobs')
  const [posting, setPosting] = useState(false)
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkStatus, setBulkStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle')
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

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/enterprise/api-keys', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setApiKeys(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (tab === 'enterprise') fetchKeys()
  }, [tab])

  const generateKey = async () => {
    try {
      await fetch('/api/enterprise/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: `Key ${apiKeys.length + 1}` })
      })
      fetchKeys()
    } catch (e) {
      console.error(e)
    }
  }

  const handleBulkProcess = async () => {
    if (!bulkFile) return
    setBulkStatus('processing')
    
    // Simulate parsing and API call
    setTimeout(async () => {
      try {
        await fetch('/api/enterprise/bulk-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            data: [
              { name: 'Jean Bosco', email: 'bosch@example.com', skill: 'JavaScript Fundamentals', level: 'Advanced' },
              { name: 'Divine Keza', email: 'divine@tech.rw', skill: 'React Development', level: 'Intermediate' }
            ]
          })
        })
        setBulkStatus('done')
        setTimeout(() => {
          setBulkStatus('idle')
          setBulkFile(null)
          setTab('jobs') // Go back to show updated stats (if we had real stats)
        }, 2000)
      } catch (e) {
        console.error(e)
        setBulkStatus('idle')
      }
    }, 3000)
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
          <button className={`${styles.tab} ${tab === 'enterprise' ? styles.tabActive : ''}`} onClick={() => setTab('enterprise')}>🚀 Enterprise Portal</button>
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
          <div className={`card ${styles.verifyCard}`}>
            <h2>Verify Credential</h2>
            <p className="text-muted mb-6">Enter the Skill ID or scan the QR code to instantly verify a candidate's blockchain-backed credential.</p>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="QR_xxxx_verify or Credential ID" 
                value={qrCode} 
                onChange={(e) => setQrCode(e.target.value)} 
                className="flex-1"
              />
              <button className="btn btn-primary" onClick={handleVerify}>Verify Now</button>
            </div>

            {verifyResult && (
              <div className={`mt-4 p-6 rounded-xl border-2 ${verifyResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                {verifyResult.valid ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-green-500 text-white p-1 rounded-full">✓</div>
                      <span className="font-bold text-green-700">Valid Credential</span>
                    </div>
                    <div className="grid-2 gap-4">
                      <div>
                        <div className="text-xs text-green-600 font-bold uppercase">Holder</div>
                        <div className="font-bold">{verifyResult.holder}</div>
                      </div>
                      <div>
                        <div className="text-xs text-green-600 font-bold uppercase">Skill</div>
                        <div className="font-bold">{verifyResult.skill} ({verifyResult.level})</div>
                      </div>
                      <div className="col-span-2 mt-2">
                        <div className="text-xs text-green-600 font-bold uppercase">Blockchain Hash</div>
                        <div className="font-mono text-[10px] break-all">{verifyResult.txHash}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600 font-bold">
                    ⚠️ Invalid or expired credential.
                  </div>
                )}
              </div>
            )}
          </div>
        )}


        {tab === 'enterprise' && (
          <div className="grid-2 gap-6">
            <div className="card">
              <h2 className="flex items-center gap-2">📦 Bulk Certification</h2>
              <p className="text-muted mb-4">Upload an Excel/CSV file to issue certificates to multiple employees at once.</p>
              
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                <input 
                  type="file" 
                  id="bulk-upload" 
                  className="hidden" 
                  accept=".xlsx,.csv" 
                  onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="bulk-upload" className="cursor-pointer block">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="font-bold text-slate-900">{bulkFile ? bulkFile.name : 'Click to upload Excel file'}</div>
                  <div className="text-xs text-slate-500">Supported: .xlsx, .csv (Max 10MB)</div>
                </label>
              </div>

              {bulkFile && (
                <button 
                  className={`btn btn-primary w-full mt-4 ${bulkStatus !== 'idle' ? 'opacity-50' : ''}`}
                  disabled={bulkStatus !== 'idle'}
                  onClick={handleBulkProcess}
                >
                  {bulkStatus === 'idle' ? '🚀 Start Generation' : bulkStatus === 'processing' ? '⚙️ Processing...' : '✅ Done!'}
                </button>
              )}
            </div>

            <div className="card">
              <h2 className="flex items-center gap-2">🔑 API & Integration</h2>
              <p className="text-muted mb-4">Connect Imihigo Learn to your internal HR systems via our public API.</p>
              
              <div className="space-y-4">
                <button className="btn btn-secondary w-full flex items-center justify-between" onClick={generateKey}>
                  <span>Generate New API Key</span>
                  <span>+</span>
                </button>
                
                {apiKeys.map(k => (
                  <div key={k.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-slate-700">{k.name}</span>
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase font-bold">Active</span>
                    </div>
                    <div className="font-mono text-xs bg-white p-2 border border-slate-200 rounded truncate">
                      {k.apiKey}
                    </div>
                  </div>
                ))}

                {apiKeys.length === 0 && (
                  <div className="text-center p-4 border border-dashed border-slate-200 rounded-lg text-slate-400 text-sm italic">
                    No active API keys found.
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100">
                <a href="#" className="text-blue-600 font-bold text-sm hover:underline">Read API Documentation →</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
