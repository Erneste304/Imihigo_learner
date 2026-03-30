import { useState, useEffect } from 'react'
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
}

const categories = ['All', 'Programming', 'Frontend', 'Backend', 'Data Science', 'Design']

export default function Community() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [filter, setFilter] = useState('All')
  const [langFilter, setLangFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [liking, setLiking] = useState<string | null>(null)
  const { token } = useAuth()
  const { t } = useLang()

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

  const levelBadge: Record<string, string> = { beginner: 'badge-success', intermediate: 'badge-warning', advanced: 'badge-danger' }

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><div className="spinner" /></div>

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
              <div className={styles.thumb} style={{ background: `linear-gradient(135deg, ${tutorial.thumbnailColor}33, ${tutorial.thumbnailColor}11)`, borderColor: tutorial.thumbnailColor + '44' }}>
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
                <h3 className={styles.tutTitle}>{tutorial.title}</h3>
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
            <button className="btn btn-primary" onClick={() => alert('Tutorial submission coming in Phase 3!')}>
              + Upload Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
