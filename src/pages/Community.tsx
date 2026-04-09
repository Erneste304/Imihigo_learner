import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import styles from './Community.module.css'

interface Tutorial {
  id: string
  authorName: string
  title: string
  description: string
  category: string
  language: string
  likes: number
  views: number
  duration: string
  level: string
  tags: string[]
  createdAt: string
  thumbnailColor: string
  videoUrl?: string
}

const categories = ['All', 'Programming', 'Frontend', 'Backend', 'Data Science', 'Design']

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'Programming',
  language: 'en' as 'en' | 'rw' | 'both',
  level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
  duration: '',
  tags: '',
  videoUrl: '',
}

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

export default function Community() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [filter, setFilter] = useState('All')
  const [langFilter, setLangFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [liking, setLiking] = useState<string | null>(null)

  const [showUpload, setShowUpload] = useState(false)
  const [uploadForm, setUploadForm] = useState(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [playingTutorial, setPlayingTutorial] = useState<Tutorial | null>(null)

  const { token, user } = useAuth()
  const { t } = useLang()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (filter !== 'All') params.set('category', filter)
    if (langFilter) params.set('lang', langFilter)
    fetch(`/api/community/tutorials?${params}`).then(r => r.json()).then(setTutorials).finally(() => setLoading(false))
  }, [filter, langFilter])

  async function handleLike(id: string) {
    if (!token || liking) return
    setLiking(id)
    const res = await fetch(`/api/community/tutorials/${id}/like`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setTutorials(ts => ts.map(t => t.id === id ? { ...t, likes: data.likes } : t))
    setLiking(null)
  }

  async function openPlayer(tutorial: Tutorial) {
    setPlayingTutorial(tutorial)
    await fetch(`/api/community/tutorials/${tutorial.id}/view`, { method: 'POST' }).catch(() => {})
    setTutorials(ts => ts.map(t => t.id === tutorial.id ? { ...t, views: t.views + 1 } : t))
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setUploading(true)
    setUploadError('')
    try {
      const res = await fetch('/api/community/tutorials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(uploadForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setTutorials(ts => [data.data, ...ts])
      setShowUpload(false)
      setUploadForm(EMPTY_FORM)
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const levelBadge: Record<string, string> = { beginner: 'badge-success', intermediate: 'badge-warning', advanced: 'badge-danger' }

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><div className="spinner" /></div>

  const youtubeId = playingTutorial?.videoUrl ? getYouTubeId(playingTutorial.videoUrl) : null

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <div>
            <div className={styles.titleRow}>
              <h1>{t('Community')}</h1>
              <span className="badge badge-primary">Peer Learning Hub</span>
            </div>
            <p className="text-muted">Video tutorials by verified experts — in English & Kinyarwanda 🇷🇼</p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.headerStat}>
              <span className={styles.statNum}>{tutorials.length}</span>
              <span className={styles.statLbl}>Tutorials</span>
            </div>
            <div className={styles.headerStat}>
              <span className={styles.statNum}>{tutorials.reduce((s, t) => s + t.views, 0).toLocaleString()}</span>
              <span className={styles.statLbl}>Total Views</span>
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.catFilters}>
            {categories.map(c => (
              <button key={c} className={`${styles.catBtn} ${filter === c ? styles.catActive : ''}`} onClick={() => setFilter(c)}>{c}</button>
            ))}
          </div>
          <div className={styles.langSwitch}>
            <button className={`${styles.langBtn} ${langFilter === '' ? styles.langActive : ''}`} onClick={() => setLangFilter('')}>All Languages</button>
            <button className={`${styles.langBtn} ${langFilter === 'en' ? styles.langActive : ''}`} onClick={() => setLangFilter('en')}>English</button>
            <button className={`${styles.langBtn} ${langFilter === 'rw' ? styles.langActive : ''}`} onClick={() => setLangFilter('rw')}>🇷🇼 Kinyarwanda</button>
          </div>
        </div>

        <div className="grid-3">
          {tutorials.map(tutorial => (
            <div key={tutorial.id} className={`card ${styles.tutCard}`}>
              <div
                className={styles.thumb}
                style={{ background: `linear-gradient(135deg, ${tutorial.thumbnailColor}33, ${tutorial.thumbnailColor}11)`, borderColor: tutorial.thumbnailColor + '44', cursor: 'pointer' }}
                onClick={() => openPlayer(tutorial)}
              >
                <div className={styles.playBtn} style={{ background: tutorial.thumbnailColor }}>▶</div>
                <span className={styles.duration}>{tutorial.duration}</span>
                {tutorial.language === 'rw' && <span className={styles.rwBadge}>🇷🇼 Kinyarwanda</span>}
                {tutorial.language === 'both' && <span className={styles.rwBadge}>🇷🇼 + EN</span>}
              </div>

              <div className={styles.tutBody}>
                <div className={styles.tutTop}>
                  <span className={`badge ${levelBadge[tutorial.level] || 'badge-gray'}`}>{tutorial.level}</span>
                  <span className={styles.category}>{tutorial.category}</span>
                </div>
                <h3 className={styles.tutTitle} style={{ cursor: 'pointer' }} onClick={() => openPlayer(tutorial)}>{tutorial.title}</h3>
                <p className={styles.tutDesc}>{tutorial.description}</p>

                <div className={styles.tags}>
                  {tutorial.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                </div>

                <div className={styles.tutFooter}>
                  <span className={styles.author}>by {tutorial.authorName}</span>
                  <div className={styles.tutMeta}>
                    <button className={styles.likeBtn} onClick={() => handleLike(tutorial.id)} disabled={!token || liking === tutorial.id}>
                      ❤️ {tutorial.likes}
                    </button>
                    <span className={styles.views}>👁 {tutorial.views.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tutorials.length === 0 && (
          <div style={{ textAlign:'center', padding:'4rem 0', color:'#6b7280' }}>
            No tutorials found. Be the first to contribute!
          </div>
        )}

        <div className={styles.contributeBox}>
          <div className={styles.contributeInner}>
            <div>
              <h3>Share Your Knowledge 🎓</h3>
              <p>Verified experts earn <strong className="text-warning">50 tokens</strong> per approved tutorial. Teach in Kinyarwanda to reach more learners!</p>
            </div>
            <button className="btn btn-primary" onClick={() => { if (!token) { window.location.href = '/auth'; return; } setShowUpload(true) }}>
              + Upload Tutorial
            </button>
          </div>
        </div>
      </div>

      {/* ── Video Player Modal ── */}
      {playingTutorial && (
        <div className={styles.playerOverlay} onClick={() => setPlayingTutorial(null)}>
          <div className={styles.playerPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.playerHeader}>
              <div>
                <h2 className={styles.playerTitle}>{playingTutorial.title}</h2>
                <p className={styles.playerMeta}>by {playingTutorial.authorName} · {playingTutorial.duration}</p>
              </div>
              <button className={styles.playerClose} onClick={() => setPlayingTutorial(null)}>✕</button>
            </div>

            <div className={styles.playerScreen}>
              {youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                  title={playingTutorial.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className={styles.playerIframe}
                />
              ) : playingTutorial.videoUrl ? (
                <video
                  ref={videoRef}
                  src={playingTutorial.videoUrl}
                  controls
                  autoPlay
                  className={styles.playerVideo}
                />
              ) : (
                <div className={styles.playerPlaceholder} style={{ background: `linear-gradient(135deg, ${playingTutorial.thumbnailColor}33, ${playingTutorial.thumbnailColor}11)` }}>
                  <div className={styles.playerPlaceholderIcon} style={{ color: playingTutorial.thumbnailColor }}>▶</div>
                  <p>No video uploaded yet</p>
                  <span>Upload a YouTube link or video file to play here</span>
                </div>
              )}
            </div>

            <div className={styles.playerInfo}>
              <p className={styles.playerDesc}>{playingTutorial.description}</p>
              <div className={styles.playerTags}>
                {playingTutorial.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
              </div>
              <div className={styles.playerActions}>
                <button className={styles.likeBtn} onClick={() => { handleLike(playingTutorial.id); setPlayingTutorial(t => t ? { ...t, likes: t.likes + 1 } : t) }} disabled={!token}>
                  ❤️ {playingTutorial.likes} Likes
                </button>
                <span className={styles.views}>👁 {playingTutorial.views.toLocaleString()} views</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Tutorial Modal ── */}
      {showUpload && (
        <div className={styles.playerOverlay} onClick={() => setShowUpload(false)}>
          <div className={styles.uploadPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.playerHeader}>
              <div>
                <h2 className={styles.playerTitle}>Upload a Tutorial 🎓</h2>
                <p className={styles.playerMeta}>Share your knowledge and earn 50 tokens</p>
              </div>
              <button className={styles.playerClose} onClick={() => setShowUpload(false)}>✕</button>
            </div>

            <form onSubmit={handleUpload} className={styles.uploadForm}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" placeholder="e.g. React Hooks mu Kinyarwanda" value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} required />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea rows={3} placeholder="What will learners gain from this tutorial?" value={uploadForm.description} onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))} required style={{ resize: 'vertical' }} />
              </div>

              <div className={styles.uploadGrid}>
                <div className="form-group">
                  <label>Category *</label>
                  <select value={uploadForm.category} onChange={e => setUploadForm(f => ({ ...f, category: e.target.value }))}>
                    {['Programming', 'Frontend', 'Backend', 'Data Science', 'Design'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Language *</label>
                  <select value={uploadForm.language} onChange={e => setUploadForm(f => ({ ...f, language: e.target.value as any }))}>
                    <option value="en">English</option>
                    <option value="rw">Kinyarwanda</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Level *</label>
                  <select value={uploadForm.level} onChange={e => setUploadForm(f => ({ ...f, level: e.target.value as any }))}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input type="text" placeholder="e.g. 1h 30min" value={uploadForm.duration} onChange={e => setUploadForm(f => ({ ...f, duration: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input type="text" placeholder="e.g. react, javascript, kinyarwanda" value={uploadForm.tags} onChange={e => setUploadForm(f => ({ ...f, tags: e.target.value }))} />
              </div>

              <div className="form-group">
                <label>Video URL</label>
                <input type="url" placeholder="YouTube link or direct video URL (optional)" value={uploadForm.videoUrl} onChange={e => setUploadForm(f => ({ ...f, videoUrl: e.target.value }))} />
                <small style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.25rem', display: 'block' }}>
                  Paste a YouTube link (e.g. https://youtube.com/watch?v=…) and it will be embedded automatically.
                </small>
              </div>

              {uploadError && <div className={styles.uploadError}>{uploadError}</div>}

              <div className={styles.uploadActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading…' : '🚀 Publish Tutorial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
