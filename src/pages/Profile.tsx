import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Credential, Assessment } from '../types'
import { api } from '../services/api'
import styles from './Profile.module.css'
import { FileText, Upload, Sparkles, Plus, Award, Download, ExternalLink } from 'lucide-react'

interface InternationalCert {
  id: string
  courseName: string
  issuedAt: string
  blockchainTx: string
  verificationCode: string
  pdfUrl: string
}

export default function Profile() {
  const { user, token } = useAuth()
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [intlCerts, setIntlCerts] = useState<InternationalCert[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [extractedSkills, setExtractedSkills] = useState<string[]>([])

  useEffect(() => {
    if (!token) return
    Promise.all([
      api.get('/users/me/credentials'),
      api.get('/users/me/assessments'),
      api.get('/certification/my'),
      api.get('/instructors/my-courses'), // Reusing to get some courses to "buy"
    ]).then(([c, a, ic, cs]) => {
      setCredentials(Array.isArray(c.data.data) ? c.data.data : Array.isArray(c.data) ? c.data : [])
      setAssessments(Array.isArray(a.data.data) ? a.data.data : Array.isArray(a.data) ? a.data : [])
      setIntlCerts(ic.data.data || [])
      setCourses(cs.data.data || [])
    }).finally(() => setLoading(false))
  }, [token])

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('resume', file)

    try {
      const response = await api.upload('/resumes/upload', formData)
      if (response.data.success) {
        setExtractedSkills(response.data.data.skills || [])
        alert('Resume parsed successfully! Review the extracted skills below.')
      }
    } catch (err) {
      console.error('Resume upload failed', err)
      alert('Failed to parse resume. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const addSkill = (skill: string) => {
    // In a real app, this would call a backend API to update user profile
    alert(`Skill "${skill}" added to your profile!`)
    setExtractedSkills(prev => prev.filter(s => s !== skill))
  }

  const upgradeToInternational = async (courseId: string) => {
    if (!confirm('This will issue a Global International Certificate verified on the blockchain. Continue?')) return
    try {
      const res = await api.post('/certification/issue', { courseId })
      if (res.data.success) {
        setIntlCerts([...intlCerts, res.data.data])
        alert('Global Certificate Issued! See below.')
      }
    } catch (err) {
      alert('Failed to issue certificate.')
    }
  }

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
            
            <div className={styles.trustScore}>
              <div className={styles.trustScoreLabel}>
                <span>Trust Score</span>
                <span>{user?.trustScore || 0}%</span>
              </div>
              <div className={styles.trustScoreBar}>
                <div 
                  className={styles.trustScoreFill} 
                  style={{ 
                    width: `${user?.trustScore || 0}%`,
                    background: (user?.trustScore || 0) > 70 ? '#10b981' : (user?.trustScore || 0) > 40 ? '#f59e0b' : '#ef4444'
                  }} 
                />
              </div>
            </div>
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

        {/* Experience & Education Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className={styles.sectionTitle}>Experience</h2>
              <button className="btn btn-secondary btn-sm flex items-center gap-1" onClick={() => alert('Add Experience feature coming soon!')}>
                <Plus size={14} /> Add
              </button>
            </div>
            <div className={`card ${styles.timeline}`}>
              {user?.experience && user.experience.length > 0 ? user.experience.map((exp: any, i: number) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <div>
                        <div className={styles.timelineTitle}>{exp.position}</div>
                        <div className={styles.timelineSubtitle}>{exp.company}</div>
                      </div>
                      <div className={styles.timelineDate}>
                        {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : new Date(exp.endDate).getFullYear()}
                      </div>
                    </div>
                    <p className={styles.timelineDesc}>{exp.description}</p>
                  </div>
                </div>
              )) : (
                <div className={styles.empty}>No experience listed.</div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className={styles.sectionTitle}>Education</h2>
              <button className="btn btn-secondary btn-sm flex items-center gap-1" onClick={() => alert('Add Education feature coming soon!')}>
                <Plus size={14} /> Add
              </button>
            </div>
            <div className={`card ${styles.timeline}`}>
              {user?.education && user.education.length > 0 ? user.education.map((edu: any, i: number) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <div>
                        <div className={styles.timelineTitle}>{edu.degree} in {edu.field}</div>
                        <div className={styles.timelineSubtitle}>{edu.school}</div>
                      </div>
                      <div className={styles.timelineDate}>
                        {edu.startYear} - {edu.endYear || 'Present'}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className={styles.empty}>No education listed.</div>
              )}
            </div>
          </section>
        </div>

        {/* Resume Upload Section */}
        <section className="mb-10">
          <h2 className={styles.sectionTitle}>AI Resume Analysis</h2>
          <div className={`card ${styles.resumeCard}`}>
            <div className="flex flex-col md:flex-row items-center gap-6 p-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                <FileText size={40} className="text-blue-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold mb-1">Boost Your Profile with AI</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Upload your PDF resume to automatically extract skills, experience, and get personalized job matches.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <label className={`btn ${uploading ? 'btn-gray cursor-not-allowed' : 'btn-primary'} flex items-center gap-2 cursor-pointer`}>
                    <Upload size={18} />
                    {uploading ? 'Analyzing...' : 'Upload PDF'}
                    <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>

            {extractedSkills.length > 0 && (
              <div className="mt-6 border-t dark:border-gray-700 pt-6 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={20} className="text-yellow-500" />
                  <span className="font-semibold">AI Extracted Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedSkills.map(skill => (
                    <div key={skill} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">
                      <span className="text-sm font-medium">{skill}</span>
                      <button 
                        onClick={() => addSkill(skill)}
                        className="text-blue-600 hover:text-blue-700 p-0.5 hover:bg-blue-50 rounded"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 italic">
                  * Verify these skills to earn blockchain-backed credentials.
                </p>
              </div>
            )}
          </div>
        </section>

        <h2 className={styles.sectionTitle}>International Global Certificates</h2>
        {intlCerts.length === 0 ? (
          <div className={`card ${styles.empty} bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800`}>
            <Award size={40} className="text-blue-600 mb-3" />
            <p className="text-blue-900 dark:text-blue-100 font-medium">Elevate your profile with internationally recognized credentials.</p>
            <button className="btn btn-primary mt-4" onClick={() => window.location.href='/courses'}>Browse Global Courses</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {intlCerts.map(cert => (
              <div key={cert.id} className="card border-2 border-blue-100 dark:border-blue-900/30 overflow-hidden group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-600 rounded-2xl text-white">
                    <Award size={24} />
                  </div>
                  <div className="text-[10px] font-black tracking-widest uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                    Official Verification
                  </div>
                </div>
                
                <h3 className="text-xl font-bold dark:text-white mb-2">{cert.courseName}</h3>
                <div className="text-xs text-gray-400 font-mono mb-4 break-all">Verification: {cert.verificationCode}</div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl mb-6">
                  <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Blockchain Hash</div>
                  <div className="text-xs text-blue-500 font-mono truncate">{cert.blockchainTx}</div>
                </div>

                <div className={styles.sigLine}>
                  <div className={styles.sigHandwriting}>Prof. Kalisa M.</div>
                  <div className={styles.sigLabel}>Principal Instructor</div>
                  <div className="text-[10px] text-gray-400 mt-1">Lead Scientist, Imihigo Labs</div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t dark:border-gray-800">
                  <span className="text-xs text-gray-500">Issued {new Date(cert.issuedAt).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(`http://localhost:3001${cert.pdfUrl}`)} 
                      className="btn btn-secondary btn-sm flex items-center gap-2"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                    <button className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
                  <div className="flex gap-2">
                    <button 
                      onClick={() => upgradeToInternational(courses[0]?.id || 'co1')} 
                      className="btn btn-primary btn-sm flex items-center gap-1"
                    >
                      <Award size={14} /> Upgrade to Global
                    </button>
                    <button className="btn btn-secondary btn-sm">📤 Share</button>
                  </div>
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
