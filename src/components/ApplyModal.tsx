import { useState } from 'react'
import styles from './ApplyModal.module.css'

interface ApplyModalProps {
  job: { id: string; title: string; company: string }
  token: string
  onClose: () => void
  onSuccess: () => void
}

export default function ApplyModal({ job, token, onClose, onSuccess }: ApplyModalProps) {
  const [pitch, setPitch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pitch })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to apply')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Apply for {job.title}</h2>
        <p className={styles.subtitle}>{job.company}</p>

        {error && <div className="error-box" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="pitch">Why are you a good fit for this role?</label>
            <textarea
              id="pitch"
              className={styles.textarea}
              placeholder="Tell the employer about your relevant experience and passion..."
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              required
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Send Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
