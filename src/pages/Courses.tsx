import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, Award, Search, ChevronRight, Tag, BarChart2, Clock } from 'lucide-react'

interface Course {
  id: string
  title: string
  instructorName: string
  description: string
  price: number
  certificateFee: number
  enrolledCount: number
  lessonCount: number
  category: string
  level: string
  tags: string[]
  status: string
  active: boolean
}

const levelColor: Record<string, string> = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
}

const levelGradient: Record<string, string> = {
  beginner: 'from-emerald-900 to-teal-900',
  intermediate: 'from-amber-900 to-orange-900',
  advanced: 'from-red-900 to-rose-900',
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))]

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || c.category === categoryFilter
    const matchLevel = levelFilter === 'all' || c.level === levelFilter
    return matchSearch && matchCat && matchLevel
  })

  function goToCourse(id: string) {
    if (!token) { navigate('/auth'); return }
    navigate(`/courses/${id}`)
  }

  return (
    <div className="page">
      <Helmet>
        <title>{search ? `Courses matching "${search}" | Imihigo Learn` : 'Global Certified Courses | Imihigo Learn'}</title>
        <meta name="description" content="Master state-of-the-art skills with certificates recognized by global employers in Rwanda." />
      </Helmet>

      {/* Hero */}
      <header className="page-header bg-gradient-to-br from-indigo-900 to-blue-900 text-white p-12 rounded-[2rem] mb-10 shadow-2xl overflow-hidden relative">
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold mb-3">World-Class Curriculum</h1>
          <p className="text-blue-200 text-lg max-w-2xl">Master in-demand skills with courses taught by vetted instructors. Earn blockchain-verified certificates recognized by global employers.</p>
          <div className="mt-8 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
            <input type="text" placeholder="What do you want to learn today?" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </header>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Category:</span>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)} style={{ padding: '0.35rem 0.9rem', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', background: categoryFilter === cat ? '#6366f1' : 'rgba(255,255,255,0.06)', color: categoryFilter === cat ? '#fff' : '#94a3b8', border: `1px solid ${categoryFilter === cat ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, transition: 'all 0.15s' }}>
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
        <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, marginLeft: '0.75rem' }}>Level:</span>
        {['all', 'beginner', 'intermediate', 'advanced'].map(lv => (
          <button key={lv} onClick={() => setLevelFilter(lv)} style={{ padding: '0.35rem 0.9rem', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', background: levelFilter === lv ? (lv === 'all' ? '#6366f1' : levelColor[lv]) : 'rgba(255,255,255,0.06)', color: levelFilter === lv ? '#fff' : '#94a3b8', border: `1px solid ${levelFilter === lv ? (lv === 'all' ? '#6366f1' : levelColor[lv]) : 'rgba(255,255,255,0.1)'}`, transition: 'all 0.15s', textTransform: 'capitalize' }}>
            {lv === 'all' ? 'All Levels' : lv}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#64748b' }}>{filtered.length} course{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
          <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p style={{ fontSize: '1.05rem' }}>No courses match your search. Try a different filter or keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(course => (
            <div key={course.id} className="card group hover:shadow-2xl transition-all border dark:border-gray-800 flex flex-col cursor-pointer" onClick={() => goToCourse(course.id)}>
              <div className={`relative h-44 mb-5 rounded-2xl overflow-hidden bg-gradient-to-br ${levelGradient[course.level] || 'from-indigo-900 to-blue-900'}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '100px', textTransform: 'capitalize' }}>
                    {course.level}
                  </span>
                  {course.category && <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '100px' }}>{course.category}</span>}
                </div>
                <div className="absolute top-3 right-3">
                  <div style={{ background: 'rgba(255,255,255,0.9)', color: '#1e40af', fontWeight: 700, fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Award size={12} /> Certified
                  </div>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-lg font-bold line-clamp-2 leading-tight">{course.title}</h3>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.15rem' }}>by {course.instructorName}</div>
                </div>
              </div>

              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-1 line-clamp-2">{course.description}</p>

              {course.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {course.tags.slice(0, 3).map(t => (
                    <span key={t} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '100px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Tag size={10} />{t}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={14} className="text-blue-500" /> {course.enrolledCount} students</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><BookOpen size={14} className="text-emerald-500" /> {course.lessonCount} lessons</span>
              </div>

              <div className="border-t dark:border-gray-800 pt-4 mt-auto flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-0.5">Course Price</div>
                  <div className="text-xl font-black dark:text-white">{course.price === 0 ? <span style={{ color: '#10b981' }}>FREE</span> : `RWF ${course.price.toLocaleString()}`}</div>
                </div>
                <button className="btn btn-primary rounded-xl flex items-center gap-2 group-hover:scale-105 transition text-sm px-4 py-2">
                  View Course <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
