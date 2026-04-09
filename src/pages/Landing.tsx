import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useLang } from '../context/LangContext'
import styles from './Landing.module.css'

const features = [
  { icon: '🧠', title: 'Adaptive Skill Testing', desc: 'AI-generated personalized challenges that adapt to your level in real-time. Like HackerRank, but built for Rwanda.' },
  { icon: '🔗', title: 'Blockchain Credentials', desc: 'Tamper-proof digital certificates on Polygon. Employers scan a QR code to instantly verify your skills.' },
  { icon: '🎯', title: 'Smart Job Matching', desc: 'ML model matches your verified skills to job requirements and predicts success rate for each position.' },
  { icon: '🏫', title: 'Community Learning Hubs', desc: 'Peer-to-peer teaching marketplace with Kinyarwanda video tutorials. Earn tokens for teaching others.' },
  { icon: '📱', title: 'SMS Gig Alerts', desc: 'Get notified about gig economy jobs — delivery, data entry, tutoring — directly via SMS.' },
  { icon: '🔒', title: 'Real-time Proctoring', desc: 'Anti-cheat system using phone camera. Every certificate is earned fairly and verifiably.' },
]

const stats = [
  { value: '10K+', label: 'Target Profiles in Year 1' },
  { value: '40%', label: 'Reduction in Hiring Time' },
  { value: '5K+', label: 'Informal Workers to Certify' },
  { value: '0', label: 'Paper Certificates' },
]

const phases = [
  { 
    phase: 'Phase 1 — MVP Foundation', 
    desc: 'Skill assessment engine + verified credentials', 
    active: true,
    details: [
      'Authentication & User Profiles',
      'Skill Assessments & Quizzes',
      'PDF Certificates Generation',
      'Interactive Learning & Job Browsing'
    ]
  },
  { 
    phase: 'Phase 2 — Core Market Features', 
    desc: 'Smart job matching + employer portal', 
    active: false,
    details: [
      'Email & SMS Notifications',
      'Employer Dashboard & Analytics',
      'Mobile Money Payment Integration',
      'Job Marketplace Advanced Filtering'
    ]
  },
  { 
    phase: 'Phase 3 — AI & Intelligence Growth', 
    desc: 'Kinyarwanda voice tutor + offline mode', 
    active: false,
    details: [
      'AI Code Review & NLP Resume Parsing',
      'Video Interview Recording & Analysis',
      'Offline-first PWA Enhancements',
      'Kinyarwanda Full Translation'
    ]
  },
  { 
    phase: 'Phase 4 — Blockchain & Advanced Trust', 
    desc: 'Blockchain micro-credential marketplace', 
    active: false,
    details: [
      'Polygon Smart Contracts for Certificates',
      'QR Code Instant Verification',
      'WhatsApp Integration & Notifications',
      'Referral & Rewards Gamification'
    ]
  },
]

export default function Landing() {
  const { t } = useLang()
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)

  const togglePhase = (phaseName: string) => {
    if (expandedPhase === phaseName) {
      setExpandedPhase(null)
    } else {
      setExpandedPhase(phaseName)
    }
  }

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Imihigo Learn — Prove Your Skills, Land the Job</title>
        <meta name="description" content="Rwanda's leading platform for AI skill verification, blockchain credentials, and smart job matching. Stop handing out CVs. Start proving what you can do." />
        <meta property="og:title" content="Imihigo Learn — Prove Your Skills, Land the Job" />
        <meta property="og:description" content="Rwanda's leading platform for AI skill verification and smart job matching." />
      </Helmet>

      <section className={styles.hero}>
        <div className={styles.heroBadge}>{t('Built for Rwanda')}</div>
        <h1 className={styles.heroTitle}>
          {t('Verify Skills')}.<br />
          <span className={styles.gradient}>{t('Earn Credentials')}.</span><br />
          {t('Land Your Career')}.
        </h1>
        <p className={styles.heroSub}>
          Rwanda produces 50,000+ graduates yearly — but employers can't trust certificates.
          Imihigo Learn uses AI assessment and blockchain verification to bridge the gap.
        </p>
        <div className={styles.heroCtas}>
          <Link to="/auth?tab=register" className="btn btn-primary btn-lg">{t('Start Verifying Skills')} →</Link>
          <Link to="/skills" className="btn btn-secondary btn-lg">{t('Browse Skills')}</Link>
        </div>
        <div className={styles.heroNote}>
          ✅ Free to take assessments &nbsp;·&nbsp; 🔗 Blockchain-verified &nbsp;·&nbsp; 📱 Mobile-first
        </div>
      </section>

      <section className={styles.stats}>
        <div className="container">
          <div className={styles.statsGrid}>
            {stats.map(s => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Everything You Need to Prove Your Skills</h2>
            <p>A complete platform for jobseekers, informal workers, and employers</p>
          </div>
          <div className="grid-3">
            {features.map(f => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.howIt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>How Imihigo Learn Works</h2>
            <p>From assessment to employment in four steps</p>
          </div>
          <div className={styles.steps}>
            {[
              { n: '01', title: 'Take a Skill Test', desc: 'Choose a skill, answer AI-generated questions under proctored conditions.' },
              { n: '02', title: 'Get Your Credential', desc: 'Pass (≥70%) to receive a blockchain-verified certificate with QR code.' },
              { n: '03', title: 'Match With Jobs', desc: 'Our ML engine matches your verified skills to real opportunities.' },
              { n: '04', title: 'Get Hired', desc: 'Employers scan your QR code, instantly verify your skills, and hire with confidence.' },
            ].map(s => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepNum}>{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.roadmap}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Platform Roadmap</h2>
            <p>Building Africa's most trusted skill verification ecosystem</p>
          </div>
          <div className={styles.phases}>
            {phases.map(p => {
              const isExpanded = expandedPhase === p.phase;
              return (
                <div 
                  key={p.phase} 
                  className={`${styles.phaseItem} ${p.active ? styles.phaseActive : ''}`}
                  onClick={() => togglePhase(p.phase)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.phaseDot} />
                  <div style={{ width: '100%' }}>
                    <div className={styles.phaseHeader}>
                      <div>
                        <div className={styles.phaseLabel}>{p.phase}</div>
                        <div className={styles.phaseDesc}>{p.desc}</div>
                      </div>
                      <div className={styles.phaseToggle}>{isExpanded ? '−' : '+'}</div>
                    </div>
                    {isExpanded && (
                      <div className={styles.phaseDetails}>
                        <ul>
                          {p.details.map((detail, idx) => (
                            <li key={idx}>✅ {detail}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaCard}>
            <h2>Ready to prove what you can do?</h2>
            <p>Join thousands of Rwandan professionals building verified careers on Imihigo Learn.</p>
            <Link to="/auth?tab=register" className="btn btn-primary btn-lg">Create Free Account →</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
