import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { BookOpen, Users, DollarSign, Plus, BarChart, Settings, Award } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  price: number
  certificateFee: number
  enrolledCount: number
}

interface Stats {
  totalCourses: number
  totalEnrolls: number
  totalRevenue: number
  platformFee: number
}

export default function Instructor() {
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/instructors/my-courses'),
      api.get('/instructors/stats')
    ]).then(([coursesRes, statsRes]) => {
      setCourses(coursesRes.data.data)
      setStats(statsRes.data.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const addCourse = async () => {
    const title = prompt('Course Title:')
    if (!title) return
    const price = Number(prompt('Course Price (RWF):'))
    const certFee = Number(prompt('International Certificate Fee (RWF):'))
    const description = prompt('Description:')

    try {
      const res = await api.post('/instructors/courses', { title, price, certificateFee: certFee, description })
      if (res.data.success) {
        setCourses([res.data.data, ...courses])
      }
    } catch (err) {
      alert('Failed to add course.')
    }
  }

  if (loading) return <div className="page flex justify-center py-20"><div className="spinner" /></div>

  return (
    <div className="page">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold dark:text-white mb-2">Instructor Command Center</h1>
          <p className="text-gray-500">Manage your global curriculum and track your impact in Rwanda.</p>
        </div>
        <button onClick={addCourse} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Create New Course
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Active Courses', value: stats?.totalCourses, icon: BookOpen, color: 'blue' },
          { label: 'Total Students', value: stats?.totalEnrolls, icon: Users, color: 'emerald' },
          { label: 'Gross Revenue', value: `RWF ${stats?.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'amber' },
          { label: 'Platform Fees', value: `RWF ${stats?.platformFee.toLocaleString()}`, icon: BarChart, color: 'red' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border dark:border-gray-800 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center text-${stat.color}-600 mb-4`}>
              <stat.icon size={24} />
            </div>
            <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
            <div className="text-2xl font-bold dark:text-white mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold dark:text-white mb-6">Manage Your Courses</h2>
      <div className="bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="p-6 text-sm font-bold text-gray-500 uppercase">Course Details</th>
              <th className="p-6 text-sm font-bold text-gray-500 uppercase">Students</th>
              <th className="p-6 text-sm font-bold text-gray-500 uppercase">Pricing</th>
              <th className="p-6 text-sm font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-800">
            {courses.map(course => (
              <tr key={course.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                <td className="p-6">
                  <div className="font-bold dark:text-white">{course.title}</div>
                  <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{course.description}</div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2 dark:text-gray-300">
                    <Users size={16} className="text-gray-400" />
                    {course.enrolledCount}
                  </div>
                </td>
                <td className="p-6">
                  <div className="text-blue-600 font-bold">RWF {course.price.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Cert: RWF {course.certificateFee.toLocaleString()}</div>
                </td>
                <td className="p-6">
                  <div className="flex gap-2">
                    <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-blue-600">
                      <Settings size={18} />
                    </button>
                    <button className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                      <Award size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
