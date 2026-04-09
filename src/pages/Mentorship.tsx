import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Users, Star, MessageSquare, Calendar, Search, Filter, Globe, BarChart, CheckCircle } from 'lucide-react'
import BookingModal from '../components/BookingModal'

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
    // Here we could refresh a sessions list if we had one on this page
  }

  return (
    <div className="page">
      <header className="page-header bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-12 rounded-3xl mb-12 shadow-xl">
        <h1 className="text-4xl font-bold mb-4">Peer-to-Peer Mentorship</h1>
        <p className="text-blue-100 text-lg max-w-2xl">Connect with industry experts in Rwanda and accelerate your career through 1-on-1 sessions.</p>
        
        <div className="mt-8 flex flex-col md:flex-row gap-4 max-w-4xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by skill or mentor name..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Kinyarwanda', 'English'].map(lang => (
              <button
                key={lang}
                onClick={() => setFilterLang(lang)}
                className={`px-6 py-2 rounded-xl font-bold transition ${
                  filterLang === lang ? 'bg-white text-blue-600 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMentors.map(mentor => (
            <div key={mentor.id} className="card hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-800 group flex flex-col">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xl relative">
                  {mentor.name.split(' ').map(n => n[0]).join('')}
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold dark:text-white group-hover:text-blue-600 transition">{mentor.name}</h3>
                    <CheckCircle size={16} className="text-blue-500" />
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                    <Star size={14} fill="currentColor" /> {mentor.rating} <span className="text-gray-400 font-normal">({mentor.totalSessions} sessions)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4 text-xs text-muted font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1"><Globe size={14} /> {mentor.languages.join(', ')}</span>
                <span className="flex items-center gap-1"><BarChart size={14} /> {mentor.level}</span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">
                {mentor.bio}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {mentor.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium dark:text-gray-300">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="border-t dark:border-gray-700 pt-6 mt-auto flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-blue-600">RWF {mentor.hourlyRate.toLocaleString()}</span>
                  <span className="text-gray-500 text-sm"> / session</span>
                </div>
                <button 
                  onClick={() => setSelectedMentor(mentor)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Calendar size={18} /> Book 1-on-1
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
