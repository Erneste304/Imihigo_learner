import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { 
  Award, BookOpen, Clock, CheckCircle, ChevronLeft, 
  PlayCircle, FileText, Lock, ShieldCheck, Globe, Zap 
} from 'lucide-react'
import styles from './CourseDetails.module.css'

interface Lesson {
  id: string
  title: string
  type: 'note' | 'video'
  duration: number
}

interface Course {
  id: string
  title: string
  description: string
  instructorName: string
  price: number
  level: string
  category: string
  lessonCount: number
  enrolledCount: number
  lessons: Lesson[]
}

export default function CourseDetails() {
  const { id } = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolled, setEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const { user, token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then(res => setCourse(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (token && id) {
      api.get(`/courses/${id}/enrollment`)
        .then(res => setEnrolled(!!res.data.data))
        .catch(() => {})
    }
  }, [token, id])

  if (loading) return <div className="page flex justify-center items-center"><div className="spinner" /></div>
  if (!course) return <div className="page text-center py-20">Course not found.</div>

  const handleEnroll = async () => {
    if (!token) { navigate('/auth'); return }
    if (enrolled) { navigate(`/courses/${id}/learn`); return }
    setEnrolling(true)
    try {
      await api.post(`/courses/${id}/enroll`)
      setEnrolled(true)
    } catch (e: any) {
      if (e?.response?.status === 409) setEnrolled(true)
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="page bg-[#0b0f1a]">
      <Helmet>
        <title>{course.title} | Global Masterclass | Imihigo Learn</title>
      </Helmet>

      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <Link to="/courses" className={styles.breadcrumb}>
              <ChevronLeft size={16} /> Back to Catalog
            </Link>
            
            <h1 className={styles.title}>{course.title}</h1>
            
            <div className={styles.instructorRow}>
              <div className={styles.instructorAvatar}>
                {course.instructorName[0]}
              </div>
              <div className={styles.instructorInfo}>
                <span className={styles.instructorName}>{course.instructorName}</span>
                <span className={styles.instructorTitle}>Principal Instructor</span>
              </div>
            </div>

            <p className={styles.description}>
              {course.description || "Master the core principles and advanced patterns of this domain. This professional-grade masterclass is designed for high-performing individuals looking to validate their skills and land global roles."}
            </p>

            <div className="flex gap-8 mb-8">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Duration</span>
                <span className="text-white font-bold flex items-center gap-2"><Clock size={16} className="text-blue-500" /> 12.5 Hours</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Level</span>
                <span className="text-white font-bold flex items-center gap-2" style={{ textTransform: 'capitalize' }}>
                   <Zap size={16} className="text-yellow-500" /> {course.level}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Students</span>
                <span className="text-white font-bold flex items-center gap-2"><BookOpen size={16} className="text-emerald-500" /> {course.enrolledCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <aside className={styles.ctaCard}>
            <div className={styles.priceDisplay}>
              <div className={styles.priceLabel}>Certificate & Unlimited Access</div>
              <div className={styles.price}>
                {course.price === 0 ? 'FREE' : `RWF ${course.price.toLocaleString()}`}
              </div>
            </div>

            <button className={styles.enrollBtn} onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? 'Enrolling...' : enrolled ? '▶ Continue Learning' : 'Get Started Now'} <Zap size={20} fill="currentColor" />
            </button>
            {enrolled && (
              <div className="mt-3 text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                <CheckCircle size={14} /> You are enrolled in this course
              </div>
            )}

            <div className={styles.valueProps}>
              <div className={styles.prop}><ShieldCheck className={styles.propIcon} size={18} /> Blockchain-Verified Certificate</div>
              <div className={styles.prop}><Globe className={styles.propIcon} size={18} /> Internationally Recognized</div>
              <div className={styles.prop}><CheckCircle className={styles.propIcon} size={18} /> Self-Paced Learning</div>
              <div className={styles.prop}><Zap className={styles.propIcon} size={18} /> Full Lifetime Access</div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
               <p className="text-xs text-gray-500 font-medium">100% Satisfaction Guarantee. Verified by Imihigo Board.</p>
            </div>
          </aside>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><Award size={24} className="text-blue-500" /> Professional Credential</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={styles.certPreview}>
              <div className={styles.certVisual}>
                <div className={styles.certHeader}>Official Recognition of Achievement</div>
                <div className={styles.certStamp}>🎓</div>
                <div className={styles.certBody}>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Awarded To</p>
                  <p className={styles.certName}>{user?.name || "Your Name Here"}</p>
                  <p className={styles.certDesc}>Successfully completed the professional requirements for <strong>{course.title}</strong> and demonstrated mastery across all theoretical and practical assessments.</p>
                </div>
                <div className={styles.certSigns}>
                   <div className={styles.certSign}>Imihigo Board</div>
                   <div className={styles.certSign}>Instructor Signature</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-4 text-white">Why This Certificate?</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Unlike simple completion badges, Imihigo Learner certificates are anchored to the blockchain. This ensures that your achievement is tamper-proof and can be instantly verified by any employer worldwide.
              </p>
              <ul className="space-y-4">
                {[
                  "Recognized by lead tech firms in Kigali and globally",
                  "Sharable on LinkedIn and professional resumes",
                  "Unique Verification ID and QR Code",
                  "Demonstrates commitment to high-performance learning"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle size={16} className="text-blue-500 mt-0.5" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="flex justify-between items-center mb-10">
            <h2 className={styles.sectionTitle}><BookOpen size={24} className="text-emerald-500" /> Curriculum Overview</h2>
            <span className="text-gray-500 font-bold text-sm bg-gray-800/50 px-4 py-2 rounded-full">
              {course.lessonCount} Professional Lessons
            </span>
          </div>
          
          <div className={styles.curriculum}>
            {(course.lessons || []).length > 0 ? course.lessons.sort((a,b) => (a as any).order - (b as any).order).map((lesson, index) => (
              <div key={lesson.id} className={styles.lessonCard}>
                <div className={styles.lessonMain}>
                  <div className={styles.lessonId}>{index + 1}</div>
                  <span className={styles.lessonTitle}>{lesson.title}</span>
                </div>
                <div className={styles.lessonMeta}>
                   <span className="flex items-center gap-2">
                     {lesson.type === 'video' ? <PlayCircle size={16} className="text-blue-500" /> : <FileText size={16} className="text-emerald-500" />}
                     {lesson.type === 'video' ? 'Video' : 'Reading'}
                   </span>
                   <span className="flex items-center gap-2"><Clock size={16} /> {lesson.duration || 15} min</span>
                   <Lock size={16} className="text-gray-600" />
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center py-10 opacity-40">
                <Lock size={48} className="mb-4" />
                <p>Curriculum is being finalized. Stay tuned!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
