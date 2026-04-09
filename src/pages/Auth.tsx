import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export default function Auth() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState<'login' | 'register'>(params.get('tab') === 'register' ? 'register' : 'login')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'jobseeker', bio: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/dashboard') }, [user])
  useEffect(() => { 
    setTab(params.get('tab') === 'register' ? 'register' : 'login') 
    setStep(1)
  }, [params])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const nextStep = () => {
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all identity fields.')
      return
    }
    setError('')
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    if (e) e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password, form.role)
        // Note: bio would be updated in a subsequent profile update call in a real app
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.back}>← Back to home</Link>
        <div className={styles.logo}>🎓</div>
        <h1 className={styles.title}>
          {tab === 'login' ? 'Welcome back' : step === 1 ? 'Join Imihigo Learn' : 'Tell us more'}
        </h1>
        <p className={styles.sub}>
          {tab === 'login' 
            ? 'Sign in to your account' 
            : step === 1 
              ? 'Step 1 of 2: Create your account' 
              : 'Step 2 of 2: Personalize your profile'}
        </p>

        {tab === 'login' && (
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`} onClick={() => setTab('login')}>Sign In</button>
            <button className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`} onClick={() => setTab('register')}>Register</button>
          </div>
        )}

        <form onSubmit={tab === 'login' || step === 2 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          {tab === 'login' ? (
            <>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
              </div>
            </>
          ) : step === 1 ? (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" placeholder="Alice Uwimana" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={6} />
              </div>
              <div className={styles.switchTab}>
                Already have an account? <span onClick={() => setTab('login')}>Sign In</span>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>I am a...</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="jobseeker">Job Seeker / Student</option>
                  <option value="employer">Employer / Recruiter</option>
                  <option value="instructor">Mentor / Instructor</option>
                </select>
              </div>
              <div className="form-group">
                <label>{form.role === 'employer' ? 'Company Description' : 'Brief Bio'}</label>
                <textarea 
                  name="bio" 
                  placeholder={form.role === 'employer' ? 'Tell us about your organization...' : 'A bit about your background...'} 
                  value={form.bio} 
                  onChange={handleChange}
                  className="form-control"
                  rows={3}
                />
              </div>
              <button type="button" className="btn btn-secondary w-full mb-2" onClick={() => setStep(1)}>Back</button>
            </>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : step === 1 ? 'Next Step' : 'Create Account'}
          </button>
        </form>

        {tab === 'login' && (
          <div className={styles.hint}>
            <strong>Demo accounts:</strong> alice@example.com / password123
          </div>
        )}
      </div>
    </div>
  )
}

