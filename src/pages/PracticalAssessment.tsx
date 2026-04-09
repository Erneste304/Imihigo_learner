import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Video, CheckCircle, Loader, AlertCircle, ArrowLeft, Play, Sparkles, Upload } from 'lucide-react'

interface VideoStatus {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  aiAnalysis?: {
    confidence: number
    clarity: number
    relevance: number
    feedback: string
  }
}

export default function PracticalAssessment() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [status, setStatus] = useState<VideoStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let interval: any
    if (videoId && status?.status !== 'COMPLETED' && status?.status !== 'FAILED') {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/video/status/${videoId}`)
          if (res.data.success) {
            setStatus(res.data.data)
            if (res.data.data.status === 'COMPLETED') {
              clearInterval(interval)
            }
          }
        } catch (err) {
          console.error('Failed to fetch video status', err)
        }
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [videoId, status?.status])

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('video', file)
    formData.append('assessmentId', id || '')

    try {
      const response = await api.upload('/video/upload', formData)
      if (response.data.success) {
        setVideoId(response.data.data.videoId)
        setStatus({ id: response.data.data.videoId, status: 'PROCESSING' })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload video')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-8 transition"
      >
        <ArrowLeft size={20} /> Back to Assessments
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-10 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Video size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Practical Proof Assessment</h1>
              <p className="text-indigo-100 italic">Demonstrate your skills via video for blockchain verification</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {!videoId && !uploading && (
            <div className="space-y-8">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Instructions</h2>
                <ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-200">
                  <li>Show your face clearly at the beginning of the video.</li>
                  <li>Perform the skill task as described in the assessment brief.</li>
                  <li>Ensure good lighting and clear audio.</li>
                  <li>Video should be between 30 seconds and 3 minutes.</li>
                </ul>
              </div>

              <div className="border-3 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center hover:border-blue-400 transition cursor-pointer">
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  id="video-upload"
                  onChange={handleVideoUpload}
                />
                <label htmlFor="video-upload" className="cursor-pointer block">
                  <div className="bg-gray-100 dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload size={36} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upload your demonstration</h3>
                  <p className="text-gray-500 mb-6">Drag and drop or click to browse files (MP4, WEBM)</p>
                  <span className="btn btn-primary px-8">Select Video File</span>
                </label>
              </div>
            </div>
          )}

          {uploading && (
            <div className="text-center py-20">
              <Loader className="animate-spin text-blue-600 mx-auto mb-6" size={60} />
              <h3 className="text-2xl font-bold mb-2">Uploading your proof...</h3>
              <p className="text-gray-500">This may take a minute depending on your connection.</p>
            </div>
          )}

          {videoId && status && (
            <div className="space-y-8">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Play size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Video ID</span>
                    <p className="font-mono text-xs">{videoId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    status.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    status.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse'
                  }`}>
                    {status.status}
                  </span>
                </div>
              </div>

              {status.status === 'PROCESSING' && (
                <div className="text-center py-10">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <Loader className="animate-spin text-blue-600 absolute inset-0" size={96} strokeWidth={1} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="text-yellow-500" size={32} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">AI Analyzing your Proof</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Our AI is verifying your identity and evaluating the practical skill demonstrated in the video.
                  </p>
                </div>
              )}

              {status.status === 'COMPLETED' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <CheckCircle className="text-green-600" size={48} />
                    <div>
                      <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">Verification Successful!</h3>
                      <p className="text-green-700 dark:text-green-300">AI has validated your practical skill performance.</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm text-center">
                      <span className="text-xs text-gray-500 uppercase font-bold">AI Confidence</span>
                      <p className="text-2xl font-bold text-blue-600">{status.aiAnalysis?.confidence}%</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm text-center">
                      <span className="text-xs text-gray-500 uppercase font-bold">Visual Clarity</span>
                      <p className="text-2xl font-bold text-blue-600">{status.aiAnalysis?.clarity}%</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm text-center">
                      <span className="text-xs text-gray-500 uppercase font-bold">Skill Match</span>
                      <p className="text-2xl font-bold text-blue-600">{status.aiAnalysis?.relevance}%</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-100 dark:border-green-800/30 mb-8">
                    <h4 className="font-bold mb-2 text-sm text-gray-900 dark:text-white">AI Feedback</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      "{status.aiAnalysis?.feedback}"
                    </p>
                  </div>

                  <button 
                    onClick={() => navigate('/profile')}
                    className="w-full btn btn-primary py-4 text-lg font-bold shadow-lg"
                  >
                    View Credential on Profile
                  </button>
                </div>
              )}

              {status.status === 'FAILED' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-8 text-center">
                  <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Analysis Failed</h3>
                  <p className="text-red-700 dark:text-red-300 mb-6 font-medium">
                    We couldn't verify the skill demonstration in this video. Please ensure you follow all instructions and try again.
                  </p>
                  <button 
                    onClick={() => { setVideoId(null); setStatus(null); }}
                    className="btn btn-secondary"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-8 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Upload(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}
