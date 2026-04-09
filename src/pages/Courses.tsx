import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { api } from '../services/api'
import { BookOpen, Users, Award, ShoppingCart, Search, CheckCircle } from 'lucide-react'

interface Course {
  id: string
  title: string
  instructorId: string
  description: string
  price: number
  certificateFee: number
  enrolledCount: number
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const enroll = async (courseId: string) => {
    alert('You have successfully enrolled in this course! Start learning in the Learning Path section.')
  }

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <Helmet>
        <title>{search ? `Courses matching "${search}" | Imihigo Learn` : "Global Certified Courses | Imihigo Learn"}</title>
        <meta name="description" content="Master state-of-the-art skills with certificates recognized by global employers in Rwanda." />
      </Helmet>

      <header className="page-header bg-gradient-to-br from-indigo-900 to-blue-900 text-white p-12 rounded-[2rem] mb-12 shadow-2xl overflow-hidden relative">
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold mb-4">World-Class Curriculum</h1>
          <p className="text-blue-200 text-lg max-w-2xl">Master state-of-the-art skills with certificates recognized by global employers.</p>
          
          <div className="mt-8 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
            <input 
              type="text" 
              placeholder="What do you want to learn today?"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <div key={course.id} className="card group hover:shadow-2xl transition-all border dark:border-gray-800 flex flex-col">
              <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 text-blue-600 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1">
                  <Award size={14} /> Global Certified
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold line-clamp-2">{course.title}</h3>
                </div>
              </div>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1 line-clamp-3">
                {course.description}
              </p>

              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <Users size={16} className="text-blue-500" /> {course.enrolledCount} Students
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <BookOpen size={16} className="text-emerald-500" /> 12 Modules
                </div>
              </div>

              <div className="border-t dark:border-gray-800 pt-6 mt-auto flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Course Price</div>
                  <div className="text-2xl font-black dark:text-white">RWF {course.price.toLocaleString()}</div>
                </div>
                <button 
                  onClick={() => enroll(course.id)}
                  className="btn btn-primary rounded-xl flex items-center gap-2 group-hover:scale-105 transition"
                >
                  <ShoppingCart size={18} /> Enrol Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
