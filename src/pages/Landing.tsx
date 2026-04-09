import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'
import styles from './Landing.module.css'

const features = [
  {
    icon: '🧠',
    title: 'Adaptive Skill Testing',
    desc: 'AI-generated personalized challenges that adapt to your level in real-time. Like HackerRank, but built for Rwanda.',
    details: {
      extended: 'Our AI engine dynamically adjusts difficulty based on your responses. Start with foundational questions, and the system escalates or simplifies in real-time — giving you a fair, accurate picture of your true skill level.',
      howItWorks: ['Choose a skill from our library of 50+ topics', 'AI calibrates first question to beginner level', 'Each correct answer increases difficulty; incorrect decreases', 'Final score is computed as a weighted average across all levels'],
      benefits: ['Accurate assessment regardless of your starting point', 'No guessing your level — the system finds it', 'Real-time feedback on each question', 'Results certified in under 30 minutes'],
      link: '/skills',
      linkLabel: 'Browse Skill Tests →',
      color: '#6366f1',
    }
  },
  {
    icon: '🔗',
    title: 'Blockchain Credentials',
    desc: 'Tamper-proof digital certificates on Polygon. Employers scan a QR code to instantly verify your skills.',
    details: {
      extended: 'Every certificate issued by Imihigo Learn is anchored to the Polygon blockchain — a permanent, immutable record that no one can forge, alter, or revoke. Your hard work is protected forever.',
      howItWorks: ['You pass an assessment with ≥70% score', 'A unique certificate ID is generated and hashed', 'The hash is written to Polygon mainnet via smart contract', 'A QR code linking to the verification page is embedded in your PDF'],
      benefits: ['Tamper-proof — impossible to fake', 'Employers verify in seconds by scanning a QR code', 'No employer account required to verify', 'Your credential lives permanently on-chain'],
      link: '/verify',
      linkLabel: 'Verify a Certificate →',
      color: '#10b981',
    }
  },
  {
    icon: '🎯',
    title: 'Smart Job Matching',
    desc: 'ML model matches your verified skills to job requirements and predicts success rate for each position.',
    details: {
      extended: 'Our machine-learning matching engine doesn\'t just keyword-match your CV — it reads your verified skill scores, levels, and recent performance to predict your likelihood of success at each open position.',
      howItWorks: ['Your skill scores and levels form a "Skill Vector"', 'Job requirements are parsed into a matching vector', 'Cosine similarity + weight scoring produces a match %', 'Top-matched jobs are surfaced first on your feed'],
      benefits: ['See your success probability before applying', 'No more applying blind — know your fit score', 'Employers receive only verified, matched candidates', 'Saves hours of manual job searching'],
      link: '/jobs',
      linkLabel: 'Browse Matched Jobs →',
      color: '#f59e0b',
    }
  },
  {
    icon: '🏫',
    title: 'Community Learning Hubs',
    desc: 'Peer-to-peer teaching marketplace with Kinyarwanda video tutorials. Earn tokens for teaching others.',
    details: {
      extended: 'Rwanda\'s first peer-to-peer skill marketplace in Kinyarwanda. Professionals who have passed assessments can post video tutorials, hold live workshops, and earn Ibarura tokens for every student they help succeed.',
      howItWorks: ['Pass a skill assessment to unlock tutorial posting', 'Upload video lessons in English or Kinyarwanda', 'Students enroll and earn XP for completing lessons', 'Instructors earn Ibarura tokens per enrolled student'],
      benefits: ['Earn while teaching — passive income from tutorials', 'Content in Kinyarwanda reaches wider Rwandan audiences', 'Build your reputation as a verified expert', 'Free access to peer-created learning content'],
      link: '/community',
      linkLabel: 'Join the Community →',
      color: '#ec4899',
    }
  },
  {
    icon: '📱',
    title: 'SMS Gig Alerts',
    desc: 'Get notified about gig economy jobs — delivery, data entry, tutoring — directly via SMS.',
    details: {
      extended: 'Not everyone has reliable internet. Our SMS Gig Alert system, powered by Africa\'s Talking, ensures that every verified worker receives job opportunities directly on their basic phone — no smartphone required.',
      howItWorks: ['Register your phone number in your profile', 'Set your preferred job types and location', 'New matching gigs trigger an instant SMS to your number', 'Reply YES to express interest — no app needed'],
      benefits: ['Works on any phone — no smartphone required', 'Reach gig opportunities even in low-connectivity areas', 'Instant alerts — never miss a matching opportunity', 'Covers delivery, tutoring, data entry, and more'],
      link: '/profile',
      linkLabel: 'Set Up SMS Alerts →',
      color: '#14b8a6',
    }
  },
  {
    icon: '🔒',
    title: 'Real-time Proctoring',
    desc: 'Anti-cheat system using phone camera. Every certificate is earned fairly and verifiably.',
    details: {
      extended: 'To make our certificates trustworthy, every assessment is monitored by our real-time proctoring system. Your phone camera records the session, and AI flags suspicious activity — ensuring every certificate reflects genuine ability.',
      howItWorks: ['You grant camera access at the start of an assessment', 'AI monitors for tab-switching, phone use, and background noise', 'Suspicious events are flagged and logged for review', 'Certificates are only issued for clean, uninterrupted sessions'],
      benefits: ['Certificates employers can actually trust', 'No room for cheating or impersonation', 'Fair playing field for all candidates', 'Automated — no human monitor needed'],
      link: '/skills',
      linkLabel: 'Start a Proctored Test →',
      color: '#ef4444',
    }
  },
]

const stats = [
  { value: '10K+', label: 'Target Profiles in Year 1' },
  { value: '40%', label: 'Reduction in Hiring Time' },
  { value: '5K+', label: 'Informal Workers to Certify' },
  { value: '0', label: 'Paper Certificates' },
]

type PhaseItem = {
  label: string
  icon: string
  desc: string
  values: string[]
  isCertificate?: boolean
  link?: string
}

type Phase = {
  phase: string
  desc: string
  active: boolean
  items: PhaseItem[]
}

const phases: Phase[] = [
  {
    phase: 'Phase 1 — MVP Foundation',
    desc: 'Skill assessment engine + verified credentials',
    active: true,
    items: [
      {
        label: 'Authentication & User Profiles',
        icon: '👤',
        desc: 'Secure JWT-based login, registration, and full user profile management.',
        values: ['Email & password sign-up', 'JWT token authentication', 'Role-based access (jobseeker / employer)', 'Profile photo & bio management'],
        link: '/auth?tab=register',
      },
      {
        label: 'Skill Assessments & Quizzes',
        icon: '🧠',
        desc: 'Timed, proctored skill tests across dozens of in-demand topics.',
        values: ['Multiple-choice & coding challenges', 'Real-time proctoring via camera', '70% pass threshold for certification', 'Instant AI-graded results'],
        link: '/skills',
      },
      {
        label: 'PDF Certificate Generation',
        icon: '📄',
        desc: 'Every passed assessment generates a downloadable, verifiable PDF certificate.',
        values: ['Auto-generated on passing score', 'QR code embedded for instant verification', 'Downloadable as PDF', 'Blockchain-anchored certificate ID'],
        isCertificate: true,
        link: '/profile',
      },
      {
        label: 'Interactive Learning & Job Browsing',
        icon: '🎯',
        desc: 'Explore curated learning paths and browse real job listings matched to your skills.',
        values: ['Structured learning paths per skill', 'Job listings with match score', 'Filter by location, skill, salary', 'Apply directly from the platform'],
        link: '/jobs',
      },
    ],
  },
  {
    phase: 'Phase 2 — Core Market Features',
    desc: 'Smart job matching + employer portal',
    active: false,
    items: [
      {
        label: 'Email & SMS Notifications',
        icon: '📧',
        desc: 'Stay updated on new job matches, assessment results, and platform news.',
        values: ['Assessment result emails', 'Job match SMS alerts via Africa\'s Talking', 'Employer application notifications', 'Weekly digest emails'],
      },
      {
        label: 'Employer Dashboard & Analytics',
        icon: '📊',
        desc: 'A dedicated portal for employers to post jobs, review applicants, and verify skills.',
        values: ['Job posting & management', 'Applicant skill verification at a glance', 'Hiring pipeline tracking', 'Team analytics dashboard'],
        link: '/employer',
      },
      {
        label: 'Mobile Money Payment Integration',
        icon: '💳',
        desc: 'Pay for premium features via MTN Mobile Money, Airtel Money, or card.',
        values: ['MTN MoMo integration', 'Airtel Money support', 'Card payments via Stripe', 'Automatic receipt generation'],
      },
      {
        label: 'Job Marketplace Advanced Filtering',
        icon: '🔍',
        desc: 'Powerful search and filtering to find the right opportunity fast.',
        values: ['Filter by skill, salary range, location', 'Remote / on-site toggle', 'Save & bookmark jobs', 'Employer verification badges'],
        link: '/jobs',
      },
    ],
  },
  {
    phase: 'Phase 3 — AI & Intelligence Growth',
    desc: 'Kinyarwanda voice tutor + offline mode',
    active: false,
    items: [
      {
        label: 'AI Code Review & NLP Resume Parsing',
        icon: '🤖',
        desc: 'AI reviews your code submissions and parses uploaded CVs to extract skills automatically.',
        values: ['Automated code quality scoring', 'NLP resume skill extraction', 'Gap analysis vs job requirements', 'AI improvement suggestions'],
      },
      {
        label: 'Video Interview Recording & Analysis',
        icon: '🎥',
        desc: 'Record video answers for interviews, analysed by AI for confidence and clarity.',
        values: ['In-browser video recording', 'AI sentiment & fluency analysis', 'Employer playback & review', 'Practice mode with instant feedback'],
      },
      {
        label: 'Offline-first PWA Enhancements',
        icon: '📶',
        desc: 'Use the platform even with limited or no internet connectivity.',
        values: ['Service worker caching', 'Offline assessment drafting', 'Background sync on reconnect', 'Installable on Android & iOS'],
      },
      {
        label: 'Kinyarwanda Full Translation',
        icon: '🇷🇼',
        desc: 'Complete UI translation and voice support in Kinyarwanda.',
        values: ['Full UI in Kinyarwanda', 'Voice tutor in Kinyarwanda', 'Kinyarwanda learning content', 'Auto language detection'],
      },
    ],
  },
  {
    phase: 'Phase 4 — Blockchain & Advanced Trust',
    desc: 'Blockchain micro-credential marketplace',
    active: false,
    items: [
      {
        label: 'Polygon Smart Contracts for Certificates',
        icon: '⛓️',
        desc: 'Every certificate is anchored to the Polygon blockchain for permanent, tamper-proof verification.',
        values: ['On-chain certificate minting', 'Immutable credential records', 'Decentralised verification', 'Low-cost Polygon network'],
      },
      {
        label: 'QR Code Instant Verification',
        icon: '🔍',
        desc: 'Employers scan a QR code to instantly verify a candidate\'s credentials without logging in.',
        values: ['One-scan employer verification', 'Public verification page', 'No employer account needed', 'Fraud-proof QR links'],
        link: '/verify',
      },
      {
        label: 'WhatsApp Integration & Notifications',
        icon: '💬',
        desc: 'Receive job alerts, certificate confirmations, and updates directly on WhatsApp.',
        values: ['WhatsApp Business API integration', 'Certificate sharing via WhatsApp', 'Job match alerts on WhatsApp', 'Two-way bot interaction'],
      },
      {
        label: 'Referral & Rewards Gamification',
        icon: '🏆',
        desc: 'Earn tokens, climb leaderboards, and get rewarded for referring friends and teaching peers.',
        values: ['Referral bonus tokens', 'XP & level-up system', 'Global & country leaderboards', 'Token redemption for premium access'],
        link: '/leaderboard',
      },
    ],
  },
]

interface Certificate {
  certificateId: string
  courseId: string
  level: string
  issuedAt: string
  score?: number
}

function CertificatePanel({ token }: { token: string | null }) {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch('/api/certification/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.success) setCerts(data.data)
        else setError('Could not load certificates.')
      })
      .catch(() => setError('Could not load certificates.'))
      .finally(() => setLoading(false))
  }, [token])

  if (!token) {
    return (
      <div className={styles.certLogin}>
        <span className={styles.certLoginIcon}>🔒</span>
        <p>Sign in to view your earned certificates.</p>
        <Link to="/auth?tab=login" className={styles.certLoginBtn}>Sign In</Link>
      </div>
    )
  }

  if (loading) return <div className={styles.certLoading}>Loading your certificates…</div>
  if (error) return <div className={styles.certError}>{error}</div>

  if (certs.length === 0) {
    return (
      <div className={styles.certEmpty}>
        <span>📭</span>
        <p>No certificates yet. Take an assessment to earn your first one!</p>
        <Link to="/skills" className={styles.certLoginBtn}>Browse Skills</Link>
      </div>
    )
  }

  return (
    <div className={styles.certList}>
      {certs.map(c => (
        <div key={c.certificateId} className={styles.certCard}>
          <div className={styles.certIcon}>📄</div>
          <div className={styles.certInfo}>
            <div className={styles.certName}>{c.courseId} — {c.level}</div>
            <div className={styles.certDate}>Issued: {new Date(c.issuedAt).toLocaleDateString()}</div>
            {c.score !== undefined && <div className={styles.certScore}>Score: {c.score}%</div>}
          </div>
          <a
            href={`/api/certification/download/${c.certificateId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.certDownload}
          >
            ⬇ PDF
          </a>
        </div>
      ))}
    </div>
  )
}

export default function Landing() {
  const { t } = useLang()
  const { user, token } = useAuth()
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<{ phase: string; label: string } | null>(null)
  const [activeFeature, setActiveFeature] = useState<string | null>(null)

  const togglePhase = (phaseName: string) => {
    if (expandedPhase === phaseName) {
      setExpandedPhase(null)
      setSelectedItem(null)
    } else {
      setExpandedPhase(phaseName)
      setSelectedItem(null)
    }
  }

  const selectItem = (e: React.MouseEvent, phase: string, label: string) => {
    e.stopPropagation()
    if (selectedItem?.phase === phase && selectedItem?.label === label) {
      setSelectedItem(null)
    } else {
      setSelectedItem({ phase, label })
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
            <p>A complete platform for jobseekers, informal workers, and employers — click any feature to learn more</p>
          </div>
          <div className="grid-3">
            {features.map(f => (
              <div
                key={f.title}
                className={`${styles.featureCard} ${activeFeature === f.title ? styles.featureCardActive : ''}`}
                onClick={() => setActiveFeature(activeFeature === f.title ? null : f.title)}
                style={{ cursor: 'pointer', borderColor: activeFeature === f.title ? f.details.color + '80' : undefined }}
              >
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className={styles.featureCardToggle} style={{ color: f.details.color }}>
                  {activeFeature === f.title ? '▲ Less info' : '▼ Learn more'}
                </div>
              </div>
            ))}
          </div>

          {activeFeature && (() => {
            const f = features.find(x => x.title === activeFeature)!
            return (
              <div className={styles.featureDetailOverlay} style={{ borderColor: f.details.color + '40' }}>
                <div className={styles.featureDetailOverlayHeader} style={{ borderBottomColor: f.details.color + '30' }}>
                  <span className={styles.featureDetailOverlayIcon}>{f.icon}</span>
                  <div>
                    <h3 className={styles.featureDetailOverlayTitle} style={{ color: f.details.color }}>{f.title}</h3>
                    <p className={styles.featureDetailOverlayDesc}>{f.details.extended}</p>
                  </div>
                  <button className={styles.featureDetailClose} onClick={() => setActiveFeature(null)}>✕</button>
                </div>
                <div className={styles.featureDetailOverlayBody}>
                  <div className={styles.featureDetailCol}>
                    <div className={styles.featureDetailColTitle}>⚙️ How It Works</div>
                    <ol className={styles.featureDetailSteps}>
                      {f.details.howItWorks.map((step, i) => (
                        <li key={i}>
                          <span className={styles.featureDetailStepNum} style={{ background: f.details.color + '22', color: f.details.color }}>{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className={styles.featureDetailCol}>
                    <div className={styles.featureDetailColTitle}>✅ Key Benefits</div>
                    <ul className={styles.featureDetailBenefits}>
                      {f.details.benefits.map((b, i) => (
                        <li key={i}>
                          <span style={{ color: f.details.color }}>✓</span> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className={styles.featureDetailOverlayFooter}>
                  <Link
                    to={f.details.link}
                    className={styles.featureDetailOverlayBtn}
                    style={{ background: f.details.color + '22', borderColor: f.details.color + '50', color: f.details.color }}
                  >
                    {f.details.linkLabel}
                  </Link>
                  <button className={styles.featureDetailCloseBtn} onClick={() => setActiveFeature(null)}>Close</button>
                </div>
              </div>
            )
          })()}
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
              const isExpanded = expandedPhase === p.phase
              return (
                <div
                  key={p.phase}
                  className={`${styles.phaseItem} ${p.active ? styles.phaseActive : ''} ${isExpanded ? styles.phaseOpen : ''}`}
                >
                  <div
                    className={styles.phaseClickable}
                    onClick={() => togglePhase(p.phase)}
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
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={styles.phaseDetails}>
                      <div className={styles.phaseItemsGrid}>
                        {p.items.map(item => {
                          const isSelected = selectedItem?.phase === p.phase && selectedItem?.label === item.label
                          return (
                            <div key={item.label} className={styles.phaseItemWrapper}>
                              <button
                                className={`${styles.phaseFeatureBtn} ${isSelected ? styles.phaseFeatureBtnActive : ''}`}
                                onClick={(e) => selectItem(e, p.phase, item.label)}
                              >
                                <span className={styles.phaseFeatureIcon}>{item.icon}</span>
                                <span className={styles.phaseFeatureLabel}>{item.label}</span>
                                <span className={styles.phaseFeatureChevron}>{isSelected ? '▲' : '▼'}</span>
                              </button>

                              {isSelected && (
                                <div className={styles.featureDetail}>
                                  <p className={styles.featureDetailDesc}>{item.desc}</p>
                                  <ul className={styles.featureDetailValues}>
                                    {item.values.map((v, i) => (
                                      <li key={i}>
                                        <span className={styles.featureDetailCheck}>✓</span>
                                        {v}
                                      </li>
                                    ))}
                                  </ul>

                                  {item.isCertificate && (
                                    <div className={styles.featureCertSection}>
                                      <div className={styles.featureCertTitle}>
                                        {user ? `${user.name}'s Certificates` : 'Your Certificates'}
                                      </div>
                                      <CertificatePanel token={token} />
                                    </div>
                                  )}

                                  {item.link && !item.isCertificate && (
                                    <div className={styles.featureDetailAction}>
                                      <Link to={item.link} className={styles.featureDetailLink}>
                                        Explore this feature →
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
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
            <div style={{ marginTop: '1.25rem', fontSize: '0.82rem', color: '#6b7280' }}>
              By creating an account, you agree to our{' '}
              <Link to="/terms" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>Terms & Conditions</Link>
              {' '}and{' '}
              <Link to="/terms#privacy" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>Privacy Policy</Link>.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
