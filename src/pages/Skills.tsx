import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Skill } from '../types'
import styles from './Skills.module.css'

const categories = ['All', 'Programming', 'Frontend', 'Backend', 'Data Science', 'Design', 'Operations']

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/skills').then(r => r.json()).then(setSkills).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All' ? skills : skills.filter(s => s.category === filter)

  async function startAssessment(skillId: string) {
    if (!token) { navigate('/auth'); return }
    const res = await fetch('/api/assessments/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ skillId }),
    })
    const data = await res.json()
    if (res.ok) navigate(`/assessment/${data.id}?skillId=${skillId}`)
  }

  const levelColor: Record<string, string> = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' }

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1>Skill Assessments</h1>
            <p className="text-muted">Choose a skill to assess. Pass to earn a blockchain-verified credential.</p>
          </div>
        </div>

        <div className={styles.filters}>
          {categories.map(c => (
            <button key={c} className={`${styles.filterBtn} ${filter === c ? styles.filterActive : ''}`} onClick={() => setFilter(c)}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid-3">
          {filtered.map(skill => (
            <div key={skill.id} className={`card ${styles.skillCard}`}>
              <div className={styles.skillTop}>
                <div className={styles.skillIcon}>{skill.icon}</div>
                <span className="badge badge-gray" style={{ background: levelColor[skill.level] + '22', color: levelColor[skill.level] }}>
                  {skill.level}
                </span>
              </div>
              <h3 className={styles.skillName}>{skill.name}</h3>
              <p className={styles.skillDesc}>{skill.description}</p>

              <div className={styles.skillMeta}>
                <span>📝 {skill.questionsCount} questions</span>
                <span>⏱ {skill.duration} min</span>
              </div>

              <div className={styles.skillTags}>
                {(skill.tags ?? []).map(t => <span key={t} className="tag">{t}</span>)}
              </div>

              <button className={`btn btn-primary ${styles.startBtn}`} onClick={() => startAssessment(skill.id)}>
                {token ? 'Start Assessment →' : 'Sign In to Start →'}
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className={styles.empty}>No skills found in this category yet.</div>
        )}
      </div>
    </div>
  )
}
