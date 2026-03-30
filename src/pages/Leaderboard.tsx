import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
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

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then(setEntries).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><div className="spinner" /></div>

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  const podiumOrder = [1, 0, 2]

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <h1>🏆 Ibarura / Leaderboard</h1>
          <p className="text-muted">Top verified skill earners on Imihigo Learn this month</p>
        </div>

        {top3.length >= 3 && (
          <div className={styles.podium}>
            {podiumOrder.map(i => {
              const entry = top3[i]
              const heights = ['160px', '200px', '130px']
              const isCurrentUser = user?.id === entry.userId
              return (
                <div key={entry.userId} className={`${styles.podiumSlot} ${isCurrentUser ? styles.isYou : ''}`}>
                  <div className={styles.podiumAvatar} style={{ background: i === 0 ? 'linear-gradient(135deg,#FAD201,#f59e0b)' : i === 1 ? 'linear-gradient(135deg,#9ca3af,#6b7280)' : 'linear-gradient(135deg,#b45309,#92400e)' }}>
                    {entry.name[0]}
                  </div>
                  <div className={styles.podiumName}>{entry.name.split(' ')[0]}</div>
                  <div className={styles.podiumBadge}>{entry.badge}</div>
                  <div className={styles.podiumTokens}>🪙 {entry.tokens}</div>
                  <div className={styles.podiumBlock} style={{ height: heights[i], background: i === 0 ? 'rgba(250,210,1,0.12)' : i === 1 ? 'rgba(156,163,175,0.1)' : 'rgba(180,83,9,0.1)', borderColor: i === 0 ? 'rgba(250,210,1,0.3)' : i === 1 ? 'rgba(156,163,175,0.2)' : 'rgba(180,83,9,0.2)' }}>
                    <span className={styles.podiumRank}>{['🥇', '🥈', '🥉'][i]}</span>
                    <span className={styles.podiumPos}>#{entry.rank}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <span>Rank</span>
            <span>User</span>
            <span>Credentials</span>
            <span>Tests Passed</span>
            <span>Tokens</span>
            <span>Badge</span>
          </div>
          {entries.map(entry => {
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
                <span className={styles.credCount}>🏅 {entry.credentialsCount}</span>
                <span className={styles.passedCount}>✅ {entry.assessmentsPassed}</span>
                <span className={styles.tokens}>🪙 {entry.tokens}</span>
                <span className={styles.badge}>{entry.badge}</span>
              </div>
            )
          })}
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
    </div>
  )
}
