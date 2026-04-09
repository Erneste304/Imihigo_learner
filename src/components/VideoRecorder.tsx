import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { useAuth } from '../context/AuthContext'

interface VideoRecorderProps {
  onUploadComplete: (videoId: string) => void
  jobId?: string
  assessmentId?: string
}

export default function VideoRecorder({ onUploadComplete, jobId, assessmentId }: VideoRecorderProps) {
  const { token, user } = useAuth()
  const webcamRef = useRef<Webcam>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [uploading, setUploading] = useState(false)

  const handleDataAvailable = useCallback(
    ({ data }: BlobEvent) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data))
      }
    },
    [setRecordedChunks]
  )

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true)
    if (webcamRef.current?.stream) {
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/webm'
      })
      mediaRecorderRef.current.addEventListener(
        'dataavailable',
        handleDataAvailable
      )
      mediaRecorderRef.current.start()
    }
  }, [webcamRef, setCapturing, handleDataAvailable])

  const handleStopCaptureClick = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    setCapturing(false)
  }, [mediaRecorderRef, setCapturing])

  const handleUpload = useCallback(async () => {
    if (!recordedChunks.length) return
    setUploading(true)

    const blob = new Blob(recordedChunks, {
      type: 'video/webm'
    })
    
    const formData = new FormData()
    formData.append('video', blob, 'interview.webm')
    if (user?.id) formData.append('userId', user.id)
    if (jobId) formData.append('jobId', jobId)
    if (assessmentId) formData.append('assessmentId', assessmentId)

    try {
      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        alert('Video uploaded successfully! AI analysis in progress.')
        onUploadComplete(data.data.videoId)
      } else {
        alert('Failed to upload video: ' + data.message)
      }
    } catch (err) {
      console.error(err)
      alert('Error uploading video')
    } finally {
      setUploading(false)
      setRecordedChunks([])
    }
  }, [recordedChunks, token, user, jobId, assessmentId, onUploadComplete])

  return (
    <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h3 style={{ marginBottom: '1rem', color: '#f9fafb' }}>Video Interview Recording</h3>
      
      <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', backgroundColor: '#000', display: 'flex', justifyContent: 'center' }}>
        <Webcam
          audio={true}
          ref={webcamRef}
          mirrored={true}
          style={{ width: '100%', maxWidth: '500px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {capturing ? (
          <button className="btn btn-primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} onClick={handleStopCaptureClick}>
            ⏹ Stop Recording
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleStartCaptureClick} disabled={uploading}>
            ⏺ Start Recording
          </button>
        )}
        
        {recordedChunks.length > 0 && !capturing && (
          <button className="btn btn-success" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : '📤 Upload & Analyze'}
          </button>
        )}
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: '8px', fontSize: '0.9rem', color: '#9ca3af' }}>
        <strong>Tips for a great video interview:</strong>
        <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
          <li>Ensure good lighting so your face is visible</li>
          <li>Speak clearly and confidently</li>
          <li>Look directly at the camera</li>
          <li>Keep your response concise</li>
        </ul>
      </div>
    </div>
  )
}
