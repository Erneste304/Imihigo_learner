import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Trophy, ChevronUp, ChevronDown, Award, Medal, CheckCircle, Printer, X, Download } from 'lucide-react'
import styles from './Leaderboard.module.css'

interface LeaderboardEntry {
  userId: string
  name: string
  tokens: number
  credentialsCount: number
  assessmentsPassed: number
  rank: number
  badge: string
  joinedAt: string
}

type SortKey = 'rank' | 'name' | 'credentialsCount' | 'assessmentsPassed' | 'tokens'

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showCert, setShowCert] = useState(false)
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null)
  
  const { user } = useAuth()

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => {
        if (data.data) setEntries(data.data)
        else if (Array.isArray(data)) setEntries(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder(key === 'name' ? 'asc' : 'desc')
    }
  }

  const sortedEntries = [...entries].sort((a, b) => {
    let valA = a[sortKey]
    let valB = b[sortKey]

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }

    return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number)
  })

  const openCert = (u: LeaderboardEntry) => {
    setSelectedUser(u)
    setShowCert(true)
  }

  const printCert = () => {
    window.print()
  }

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><div className="spinner" /></div>

  const top3Source = [...entries].sort((a, b) => a.rank - b.rank).slice(0, 3)
  const podiumOrder = [1, 0, 2] // Silver, Gold, Bronze

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronDown className={styles.sortIndicator} size={12} style={{ opacity: 0.3 }} />
    return sortOrder === 'asc' ? <ChevronUp className={styles.sortIndicator} size={12} /> : <ChevronDown className={styles.sortIndicator} size={12} />
  }

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <h1><Trophy className="text-warning" size={32} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Ibarura / Leaderboard</h1>
          <p className="text-muted">Top verified skill earners on Imihigo Learn this month</p>
        </div>

        {top3Source.length >= 3 && (
          <div className={styles.podium}>
            {podiumOrder.map(i => {
              const entry = top3Source[i]
              if (!entry) return null
              const heights = ['140px', '180px', '110px']
              const isCurrentUser = user?.id === entry.userId
              return (
                <div key={entry.userId} className={`${styles.podiumSlot} ${isCurrentUser ? styles.isYou : ''}`}>
                  <div className={styles.podiumAvatar} style={{ 
                    background: i === 1 ? 'linear-gradient(135deg,#FAD201,#f59e0b)' : i === 0 ? 'linear-gradient(135deg,#9ca3af,#6b7280)' : 'linear-gradient(135deg,#b45309,#92400e)' 
                  }}>
                    {entry.name[0]}
                  </div>
                  <div className={styles.podiumName}>{entry.name.split(' ')[0]}</div>
                  <div className={styles.podiumBadge}>{entry.badge}</div>
                  <div className={styles.podiumTokens}>🪙 {entry.tokens}</div>
                  <div className={styles.podiumBlock} style={{ 
                    height: heights[i], 
                    background: i === 1 ? 'rgba(250,210,1,0.12)' : i === 0 ? 'rgba(156,163,175,0.1)' : 'rgba(180,83,9,0.1)', 
                    borderColor: i === 1 ? 'rgba(250,210,1,0.3)' : i === 0 ? 'rgba(156,163,175,0.2)' : 'rgba(180,83,9,0.2)' 
                  }}>
                    <span className={styles.podiumRank}>{['🥈', '🥇', '🥉'][i]}</span>
                    <span className={styles.podiumPos}>#{entry.rank}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <button className={`${styles.sortBtn} ${sortKey === 'rank' ? styles.sortActive : ''}`} onClick={() => handleSort('rank')}>
              Rank <SortIcon k="rank" />
            </button>
            <button className={`${styles.sortBtn} ${sortKey === 'name' ? styles.sortActive : ''}`} onClick={() => handleSort('name')}>
              User <SortIcon k="name" />
            </button>
            <button className={`${styles.sortBtn} ${sortKey === 'credentialsCount' ? styles.sortActive : ''}`} onClick={() => handleSort('credentialsCount')}>
              Credentials <SortIcon k="credentialsCount" />
            </button>
            <button className={`${styles.sortBtn} ${sortKey === 'assessmentsPassed' ? styles.sortActive : ''}`} onClick={() => handleSort('assessmentsPassed')}>
              Tests Passed <SortIcon k="assessmentsPassed" />
            </button>
            <button className={`${styles.sortBtn} ${sortKey === 'tokens' ? styles.sortActive : ''}`} onClick={() => handleSort('tokens')}>
              Tokens <SortIcon k="tokens" />
            </button>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280' }}>Certificate</span>
          </div>
          
          {sortedEntries.length > 0 ? sortedEntries.map(entry => {
            const isMe = user?.id === entry.userId
            return (
              <div key={entry.userId} className={`${styles.tableRow} ${isMe ? styles.meRow : ''}`}>
                <span className={styles.rank}>#{entry.rank}</span>
                <span className={styles.userName}>
                  <div className={styles.userAvatar}>{entry.name[0]}</div>
                  <div>
                    <div className={styles.userNameText}>{entry.name} {isMe && <span className={styles.youTag}>You</span>}</div>
                    <div className={styles.joinDate}>Joined {new Date(entry.joinedAt).toLocaleDateString()}</div>
                  </div>
                </span>
                <span className={styles.credCount}><Medal size={14} style={{ marginRight: '0.3rem', color: '#fbbf24' }} /> {entry.credentialsCount}</span>
                <span className={styles.passedCount}><CheckCircle size={14} style={{ marginRight: '0.3rem', color: '#10b981' }} /> {entry.assessmentsPassed}</span>
                <span className={styles.tokens}>🪙 {entry.tokens.toLocaleString()}</span>
                <span className={styles.actions}>
                  <button className={styles.viewBtn} onClick={() => openCert(entry)}>
                    <Award size={14} /> View
                  </button>
                </span>
              </div>
            )
          }) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              <Trophy size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No leaderboard entries available yet.</p>
            </div>
          )}
        </div>

        <div className={styles.howToEarn}>
          <h3>How to Earn Tokens 🪙</h3>
          <div className={styles.earningGrid}>
            {[
              { action: 'Pass a skill assessment', reward: '+25 tokens' },
              { action: 'Upload an approved tutorial', reward: '+50 tokens' },
              { action: 'Refer a new user who passes 1 test', reward: '+30 tokens' },
              { action: 'Complete your profile', reward: '+10 tokens' },
              { action: 'First time sign-up bonus', reward: '+50 tokens' },
              { action: 'Streak: 3 days in a row', reward: '+15 tokens' },
            ].map(e => (
              <div key={e.action} className={styles.earningItem}>
                <span className={styles.earningAction}>{e.action}</span>
                <span className={styles.earningReward}>{e.reward}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCert && selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setShowCert(false)}>
          <div className={styles.certificate} onClick={e => e.stopPropagation()}>
            <div className={styles.certBorderInner} />
            
            <div className={styles.certHeader}>
              <div className={styles.certLogo}>🎓</div>
              <div className={styles.certOrg}>Imihigo Learn</div>
            </div>

            <div className={styles.certBody}>
              <div className={styles.certType}>Certification of Achievement</div>
              <div className={styles.certPresented}>This credential is proudly presented to</div>
              <div className={styles.certName}>{selectedUser.name}</div>
              <div className={styles.certDesc}>
                For outstanding performance and verified excellence in skill assessments on the Imihigo Learn platform. 
                Achieved a rank of <strong>#{selectedUser.rank}</strong> with <strong>{selectedUser.tokens}</strong> tokens earned.
              </div>
            </div>

            <div className={styles.certFooter}>
              <div>
                <div className={styles.certId}>Verification ID: IMH-{selectedUser.userId.split('-')[0].toUpperCase()}</div>
                <div className={styles.certId}>Date: {new Date().toLocaleDateString()}</div>
                <div className={styles.certSign}>
                  <span className={styles.sigText}>Ernest R.</span>
                  Director of Literacy
                </div>
              </div>
              
              <div className={styles.certQR}>
                <div className={styles.qrGrid}>
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className={styles.qrDot} style={{ opacity: Math.random() > 0.3 ? 1 : 0 }} />
                  ))}
                </div>
              </div>

              <div>
                <div className={styles.certSign} style={{ textAlign: 'right' }}>
                  <span className={styles.sigText}>Jean Luc</span>
                  Blockchain Verifier
                </div>
              </div>
            </div>

            <div className={styles.certActions}>
              <button className="btn btn-secondary btn-sm flex items-center gap-2" onClick={printCert}>
                <Printer size={16} /> Print Page
              </button>
              <button className="btn btn-primary btn-sm flex items-center gap-2" onClick={() => alert('PDF generation starting...')}>
                <Download size={16} /> Save PDF
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCert(false)}>
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
