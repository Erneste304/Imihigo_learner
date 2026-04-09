import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  CheckCircle, ShieldCheck, Download, ExternalLink, Search, 
  Loader2, AlertCircle, XCircle, Award, Globe, Calendar, User
} from 'lucide-react'

export default function VerifyCertificate() {
  const { certId: urlCertId } = useParams()
  const [certId, setCertId] = useState(urlCertId || '')
  const [verificationData, setVerificationData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!certId.trim()) return
    setLoading(true)
    setError('')
    setVerificationData(null)

    try {
      const res = await fetch(`/api/certification/verify/${certId.trim()}`)
      const json = await res.json()
      if (json.success) setVerificationData(json.data)
      else setError(json.message || 'Certificate not found.')
    } catch {
      setError('Failed to verify. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (urlCertId) handleVerify() }, [urlCertId])

  const cert = verificationData?.certificate
  const recipient = verificationData?.user

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '5rem 2rem 4rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '50%', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={32} style={{ color: '#6366f1' }} />
          </div>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          Blockchain Certificate Verification
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: 560, margin: '0 auto 3rem', lineHeight: '1.6' }}>
          Every Imihigo credential is cryptographically signed and immutably recorded. Enter a Certificate ID to verify its authenticity instantly.
        </p>

        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '0.75rem', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g. CERT-CO1-AB1234-...)"
              style={{ width: '100%', padding: '1rem 1.25rem 1rem 3.25rem', background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0 1.75rem', borderRadius: 14, fontWeight: 800, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><ShieldCheck size={18} /> Verify</>}
          </button>
        </form>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem', width: '100%' }}>
        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <XCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: '0.25rem' }}>Verification Failed</div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{error}</div>
            </div>
          </div>
        )}

        {/* Verified Result */}
        {cert && recipient && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Status Banner */}
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle size={24} style={{ color: '#10b981' }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1rem' }}>✓ Authentic Certificate Verified</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>This credential is valid and has not been tampered with</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Print Certificate
                </button>
                <a href={`/api/certification/download/${cert.certificateId}`} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Download size={14} /> Download PDF
                </a>
              </div>
            </div>

            {/* Certificate Visual */}
            <div className="print-area" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '3rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)' }} />
              <div style={{ position: 'absolute', top: -80, right: -80, width: 200, height: 200, background: 'rgba(99,102,241,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />

              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
                  🎓 Imihigo Learn — Official Record of Achievement
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>Certificate of Completion</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>This is to certify that</p>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.5rem', color: '#818cf8', marginBottom: '0.5rem' }}>{recipient.name}</div>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: 480, margin: '0 auto' }}>
                  has successfully completed all requirements for the professional course
                  <strong style={{ color: '#fff', display: 'block', fontSize: '1.15rem', marginTop: '0.5rem' }}>{cert.courseName}</strong>
                </p>
              </div>

              {/* Certificate Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                  { icon: <Calendar size={16} />, label: 'Date Issued', value: new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { icon: <Award size={16} />, label: 'Level', value: (cert.level || 'Professional').toUpperCase() },
                  { icon: <Globe size={16} />, label: 'Recognition', value: cert.isValidGlobally ? 'International' : 'Regional' },
                  { icon: <User size={16} />, label: 'Issued By', value: 'Imihigo Learn' },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      {icon} {label}
                    </div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                <div>
                  <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.8rem', color: '#6366f1' }}>Ernest R.</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Director of Literacy</div>
                </div>

                {/* QR Code Visual */}
                <div style={{ textAlign: 'center', background: '#fff', padding: '0.75rem', borderRadius: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 8px)', gap: 2, marginBottom: '0.4rem' }}>
                    {cert.blockchainTx.split('').slice(2, 38).map((c: string, i: number) => (
                      <div key={i} style={{ width: 8, height: 8, background: parseInt(c, 16) > 7 ? '#111827' : '#fff', borderRadius: 1 }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>SCAN TO VERIFY</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.8rem', color: '#6366f1' }}>Jean Luc</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blockchain Verifier</div>
                </div>
              </div>
            </div>

            {/* Blockchain Record */}
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2rem' }}>
              <h3 style={{ fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} style={{ color: '#6366f1' }} /> Blockchain Record
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Certificate ID</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#818cf8', wordBreak: 'break-all' }}>{cert.certificateId}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Transaction Hash</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#818cf8', wordBreak: 'break-all' }}>{cert.blockchainTx}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Cards (shown when no result yet) */}
        {!cert && !error && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            {[
              { emoji: '🔒', title: 'Tamper-Proof', desc: 'Every certificate is cryptographically signed and recorded on an immutable blockchain ledger.' },
              { emoji: '⚡', title: 'Instant Verification', desc: 'Verify any Imihigo credential in under a second using our public API.' },
              { emoji: '🌍', title: 'Globally Recognized', desc: 'Certificates are accepted by international employers and institutions worldwide.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{emoji}</div>
                <h3 style={{ fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6' }}>{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          body > *:not(.print-area) { display: none !important; }
          .print-area { border: none !important; page-break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}
