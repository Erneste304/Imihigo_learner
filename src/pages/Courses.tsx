import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, Award, Search, ChevronRight, Tag, Clock, Filter, SlidersHorizontal, ArrowUpDown, Code, Database, MonitorPlay, Palette, TerminalSquare, Rocket, BrainCircuit } from 'lucide-react'
import styles from './Courses.module.css'

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

type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular'

const getVisualsForCourse = (title: string, category: string) => {
  const normalized = `${title} ${category}`.toLowerCase()
  if (normalized.includes('react') || normalized.includes('frontend')) return { color: 'linear-gradient(135deg, #0284c7, #3b82f6)', icon: MonitorPlay }
  if (normalized.includes('node') || normalized.includes('backend')) return { color: 'linear-gradient(135deg, #16a34a, #10b981)', icon: Database }
  if (normalized.includes('data') || normalized.includes('python')) return { color: 'linear-gradient(135deg, #9333ea, #a855f7)', icon: BrainCircuit }
  if (normalized.includes('design') || normalized.includes('ui')) return { color: 'linear-gradient(135deg, #e11d48, #f43f5e)', icon: Palette }
  if (normalized.includes('mastery') || normalized.includes('advanced')) return { color: 'linear-gradient(135deg, #b45309, #f59e0b)', icon: Rocket }
  return { color: 'linear-gradient(135deg, #4f46e5, #6366f1)', icon: TerminalSquare }
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))]

  let filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                      c.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || c.category === categoryFilter
    const matchLevel = levelFilter === 'all' || c.level === levelFilter
    const matchPrice = priceFilter === 'all' || (priceFilter === 'free' ? c.price === 0 : c.price > 0)
    return matchSearch && matchCat && matchLevel && matchPrice
  })

  // Sorting logic
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    if (sortBy === 'popular') return b.enrolledCount - a.enrolledCount
    return 0 // Default to newest/list order
  })

  function goToCourse(id: string) {
    if (!token) { navigate('/auth'); return }
    navigate(`/courses/${id}`)
  }

  if (loading) return <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><div className="spinner" /></div>

  return (
    <div className="page">
      <Helmet>
        <title>{search ? `Courses matching "${search}" | Imihigo Learn` : 'Global Certified Courses | Imihigo Learn'}</title>
      </Helmet>

      <header className="page-header bg-gradient-to-br from-indigo-950 to-blue-950 text-white p-12 rounded-[2.5rem] mb-12 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl font-black mb-4 tracking-tight">Enterprise Course Catalog</h1>
          <p className="text-blue-200 text-xl max-w-2xl font-medium opacity-90">
            Master state-of-the-art skills with curricula developed by industry leads. 
            Earn blockchain credentials recognized worldwide.
          </p>
          <div className="mt-10 relative max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400/60" size={24} />
            <input 
              type="text" 
              placeholder="Search for courses, skills, or certifications..." 
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 text-white text-lg placeholder:text-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition shadow-2xl" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
      </header>

      <div className={styles.layout}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={styles.filterSection}>
            <div className={styles.filterTitle}><Filter size={16} /> Course Category</div>
            <div className={styles.filterList}>
              {categories.map(cat => (
                <div 
                  key={cat} 
                  className={`${styles.filterItem} ${categoryFilter === cat ? styles.filterActive : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat === 'all' ? 'All Masterclasses' : cat}
                  <span className={styles.count}>{courses.filter(c => cat === 'all' || c.category === cat).length}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterTitle}><SlidersHorizontal size={16} /> Difficulty Level</div>
            <div className={styles.filterList}>
              {['all', 'beginner', 'intermediate', 'advanced'].map(lv => (
                <div 
                  key={lv} 
                  className={`${styles.filterItem} ${levelFilter === lv ? styles.filterActive : ''}`}
                  onClick={() => setLevelFilter(lv)}
                >
                  {lv === 'all' ? 'Any Level' : lv.charAt(0).toUpperCase() + lv.slice(1)}
                  <span className={styles.count}>{courses.filter(c => lv === 'all' || c.level === lv).length}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterTitle}>Pricing</div>
            <div className={styles.filterList}>
              {['all', 'free', 'paid'].map(p => (
                <div 
                  key={p} 
                  className={`${styles.filterItem} ${priceFilter === p ? styles.filterActive : ''}`}
                  onClick={() => setPriceFilter(p as any)}
                >
                  {p === 'all' ? 'All Prices' : p === 'free' ? 'Free Courses' : 'Premium Only'}
                  <span className={styles.count}>{courses.filter(c => p === 'all' || (p === 'free' ? c.price === 0 : c.price > 0)).length}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={styles.main}>
          <div className={styles.topBar}>
            <div className={styles.resultCount}>Showing {filtered.length} world-class results</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ArrowUpDown size={16} className="text-gray-500" />
              <select 
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="newest">Sort by Newest</option>
                <option value="popular">Most Enrolled</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className={styles.grid}>
              {filtered.map(course => {
                const Visuals = getVisualsForCourse(course.title, course.category)
                return (
                  <div key={course.id} className={styles.card} onClick={() => goToCourse(course.id)}>
                    <div className={styles.thumbnailWrapper} style={{ background: Visuals.color }}>
                      <div className={styles.thumbnailOverlay} />
                      <Visuals.icon className={styles.thumbnailIcon} color="white" />
                      
                      <div className={styles.badgeStack}>
                        <span className={styles.badge}>{course.category}</span>
                        {course.price === 0 && <span className={`${styles.badge} ${styles.bestSellerBadge}`}>Bestseller</span>}
                      </div>
                      <div className={styles.certifiedBadge}>
                        <Award size={14} color="#1d4ed8" /> Certified
                      </div>
                    </div>

                    <div className={styles.cardContent}>
                      <h3 className={styles.cardTitle}>{course.title}</h3>
                      <div className={styles.instructor}>by {course.instructorName}</div>
                      
                      <div className={styles.cardMeta}>
                        <span className={styles.metaItem}><Users size={15} className="text-blue-500" /> {course.enrolledCount} learners</span>
                        <span className={styles.metaItem}><BookOpen size={15} className="text-emerald-500" /> {course.lessonCount} lessons</span>
                      </div>

                      <p className={styles.cardDesc}>{course.description}</p>
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.priceSection}>
                        <div className={styles.priceLabel}>Access Fee</div>
                        <div className={`${styles.price} ${course.price === 0 ? styles.freePrice : ''}`}>
                          {course.price === 0 ? 'FREE' : `RWF ${course.price.toLocaleString()}`}
                        </div>
                      </div>
                      <button className={styles.viewBtn}>
                        View details <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              <BookOpen size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
              <p>No masterclasses found matching your specific filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
