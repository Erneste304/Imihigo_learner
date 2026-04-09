import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Star, Calendar, Search, Globe, ChevronRight, CheckCircle, BarChart3, Users } from 'lucide-react'
import BookingModal from '../components/BookingModal'
import styles from './Mentorship.module.css'

interface Mentor {
  id: string
  userId: string
  name: string
  bio: string
  skills: string[]
  hourlyRate: number
  rating: number
  totalSessions: number
  languages: string[]
  level: 'senior' | 'expert' | 'lead'
}

export default function Mentorship() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [filterLang, setFilterLang] = useState('All')

  useEffect(() => {
    api.get('/mentorship/mentors')
      .then(res => setMentors(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredMentors = mentors.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchesLang = filterLang === 'All' || m.languages.includes(filterLang)
    return matchesSearch && matchesLang
  })

  const handleBookingSuccess = (session: any) => {
    setSelectedMentor(null)
  }

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Peer-to-Peer Mentorship</h1>
          <p className={styles.subtitle}>
            Connect with industry experts in Rwanda and accelerate your career through personalized 1-on-1 sessions.
          </p>
          
          <div className={styles.toolbar}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={20} />
              <input 
                type="text" 
                placeholder="Search by skill or mentor name..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className={styles.filters}>
              {['All', 'Kinyarwanda', 'English'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setFilterLang(lang)}
                  className={`${styles.filterBtn} ${filterLang === lang ? styles.filterActive : ''}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </header>

        {filteredMentors.length > 0 ? (
          <div className={styles.grid}>
            {filteredMentors.map(mentor => (
              <div key={mentor.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.avatarWrapper}>
                    <div className={styles.avatar}>
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={styles.presence} />
                  </div>
                  <div className={styles.info}>
                    <div className={styles.nameRow}>
                      <h3 className={styles.name}>{mentor.name}</h3>
                      <CheckCircle size={14} className={styles.verified} />
                    </div>
                    <div className={styles.ratingRow}>
                      <span className={styles.rating}><Star size={12} fill="currentColor" /> {mentor.rating}</span>
                      <span className={styles.sessions}>({mentor.totalSessions} sessions)</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.metaRow}>
                  <span className={styles.metaItem}><Globe size={14} /> {mentor.languages.join(', ')}</span>
                  <span className={styles.metaItem}><BarChart3 size={14} /> {mentor.level}</span>
                </div>

                <p className={styles.bio}>
                  {mentor.bio}
                </p>

                <div className={styles.skills}>
                  {mentor.skills.map(skill => (
                    <span key={skill} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div className={styles.footer}>
                  <div className={styles.price}>
                    <span className={styles.amount}>RWF {mentor.hourlyRate.toLocaleString()}</span>
                    <span className={styles.unit}>per session</span>
                  </div>
                  <button 
                    onClick={() => setSelectedMentor(mentor)}
                    className={styles.bookBtn}
                  >
                    <Calendar size={18} /> Book 1-on-1
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Users size={48} style={{ opacity: 0.1, color: '#6366f1' }} />
            <h3>No mentors found</h3>
            <p>Try adjusting your search or filters to find more experts.</p>
          </div>
        )}
      </div>

      {selectedMentor && (
        <BookingModal 
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}
