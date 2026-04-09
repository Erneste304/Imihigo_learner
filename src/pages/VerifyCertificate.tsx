import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, ShieldCheck, Download, ExternalLink, Search, Loader2, AlertCircle } from 'lucide-react'

export default function VerifyCertificate() {
  const { certId: urlCertId } = useParams()
  const [certId, setCertId] = useState(urlCertId || '')
  const [verificationData, setVerificationData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!certId) return

    setLoading(true)
    setError('')
    setVerificationData(null)

    try {
      const res = await fetch(`/api/certification/verify/${certId}`)
      const json = await res.json()
      if (json.success) {
        setVerificationData(json.data)
      } else {
        setError(json.message)
      }
    } catch (err) {
      setError('Failed to verify certificate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (urlCertId) {
      handleVerify()
    }
  }, [urlCertId])

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Official Certificate Verification</h1>
        <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
          Verify the authenticity of Imihigo Learn international certificates. 
          All certificates are cryptographically signed and recorded on the blockchain.
        </p>

        <form onSubmit={handleVerify} className="flex gap-2 max-w-xl mx-auto mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Enter Certificate ID or Verification Code"
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl max-w-xl mx-auto mb-8 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {verificationData && (
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-600 p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-bold">Authentic Certificate</h2>
                  <p className="text-blue-100 text-sm">Verified on {new Date(verificationData.certificate.issuedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="bg-blue-500/30 px-4 py-2 rounded-lg border border-white/20 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-mono text-sm">SECURE</span>
              </div>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Recipient</label>
                  <p className="text-xl font-bold text-slate-900">{verificationData.user?.name || 'Unknown Recipient'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Course Title</label>
                  <p className="text-xl font-bold text-slate-900">{verificationData.certificate.courseName}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Certificate ID</label>
                  <p className="font-mono text-slate-700">{verificationData.certificate.certificateId}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Level</label>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                    {verificationData.certificate.level}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8 mt-8">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                      Blockchain Proof
                      <ExternalLink className="w-4 h-4 text-blue-500" />
                    </h3>
                    <p className="text-sm font-mono text-slate-500 break-all">{verificationData.certificate.blockchainTx}</p>
                  </div>
                  <a
                    href={`/api/certification/download/${verificationData.certificate.certificateId}`}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
