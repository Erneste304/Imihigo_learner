import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { lang, setLang, t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const navLinks = user
    ? [
        { to: '/dashboard', key: 'Dashboard' },
        { to: '/courses', key: 'Courses' },
        { to: '/skills', key: 'Verify Skills' },
        { to: '/mentorship', key: 'Mentorship' },
        { to: '/coding-lab', key: 'Coding Lab' },
        { to: '/study-groups', key: 'Study Groups' },
        { to: '/community', key: 'Community' },
        { to: '/leaderboard', key: 'Leaderboard' },
      ]
    : [
        { to: '/skills', key: 'Skills' },
        { to: '/jobs', key: 'Jobs' },
        { to: '/verify', key: 'Verify' },
        { to: '/community', key: 'Community' },
        { to: '/leaderboard', key: 'Leaderboard' },
      ]

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} onClick={() => setMobileOpen(false)}>
          <span className={styles.logo}>🎓</span>
          <span>Imihigo <span className={styles.accent}>Learn</span></span>
        </Link>

        <div className={`${styles.links} ${mobileOpen ? styles.mobileOpen : ''}`}>
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`${styles.link} ${location.pathname === l.to ? styles.active : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {t(l.key)}
            </Link>
          ))}
          {user && (
            <Link to="/employer" className={`${styles.link} ${location.pathname === '/employer' ? styles.active : ''} ${styles.employerLink}`} onClick={() => setMobileOpen(false)}>
              💼 Employer
            </Link>
          )}
        </div>

        <div className={styles.right}>
          <div className={styles.langToggle}>
            <button className={`${styles.langBtn} ${lang === 'en' ? styles.langActive : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`${styles.langBtn} ${lang === 'rw' ? styles.langActive : ''}`} onClick={() => setLang('rw')}>🇷🇼</button>
          </div>

          {user ? (
            <>
              <span className={styles.tokens}>🪙 {user.tokens}</span>
              <div className={styles.userMenu} onClick={() => setMenuOpen(!menuOpen)}>
                <div className={styles.avatar}>{user.name[0].toUpperCase()}</div>
                {menuOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownName}>{user.name}</div>
                    <div className={styles.dropdownEmail}>{user.email}</div>
                    <div className={styles.dropdownRole}>{user.role}</div>
                    <hr className={styles.divider} />
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>{t('Profile')}</Link>
                    {user.role === 'employer' && <Link to="/employer" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>💼 Employer Portal</Link>}
                    {user.role === 'instructor' && <Link to="/instructor" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>👨‍🏫 Instructor Portal</Link>}
                    {user.role === 'admin' && <Link to="/admin" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>🛡️ Admin Panel</Link>}
                    <hr className={styles.divider} />
                    <button className={`${styles.dropdownItem} ${styles.logout}`} onClick={handleLogout}>{t('Sign Out')}</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn btn-ghost btn-sm">{t('Sign In')}</Link>
              <Link to="/auth?tab=register" className="btn btn-primary btn-sm">{t('Get Started')}</Link>
            </>
          )}

          <button className={styles.hamburger} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  )
}
