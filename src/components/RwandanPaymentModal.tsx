import { useState } from 'react'
import styles from './RwandanPaymentModal.module.css'

interface RwandanPaymentModalProps {
  amount: number
  itemLabel: string
  onSuccess: () => void
  onCancel: () => void
}

export default function RwandanPaymentModal({ amount, itemLabel, onSuccess, onCancel }: RwandanPaymentModalProps) {
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'simulating' | 'success'>('idle')

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    setStatus('simulating')

    // Simulate MoMo Push Notification Flow
    setTimeout(() => {
      setStatus('success')
      setTimeout(() => {
        onSuccess()
      }, 2000)
    }, 3000)
  }

  return (
    <div className={styles.backdrop} onClick={(e) => status !== 'simulating' && e.target === e.currentTarget && onCancel()}>
      <div className={styles.modal}>
        <div className={styles.logo}>MTN</div>
        
        {status === 'idle' && (
          <>
            <h2 className={styles.title}>MTN Mobile Money</h2>
            <p className={styles.desc}>Pay securely with MoMo for {itemLabel}</p>

            <div className={styles.priceBox}>
              <div className={styles.label}>Amount to pay</div>
              <div className={styles.amount}>{amount.toLocaleString()} RWF</div>
            </div>

            <form onSubmit={handlePay}>
              <div className={styles.inputGroup}>
                <label htmlFor="phone">Enter Mobile Number</label>
                <div className={styles.phoneInput}>
                  <span className={styles.prefix}>+250</span>
                  <input
                    type="tel"
                    id="phone"
                    className={styles.input}
                    placeholder="78X XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={9}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" className={styles.btnPay} disabled={phone.length < 9}>
                Pay Now
              </button>
              <button type="button" className={styles.btnCancel} onClick={onCancel}>
                Cancel
              </button>
            </form>
          </>
        )}

        {status === 'simulating' && (
          <div className={styles.simulating}>
            <div className={styles.spinner} />
            <h2 className={styles.simTitle}>Waiting for Approval</h2>
            <p className={styles.simDesc}>Please check your phone for the MOMO push notification and enter your PIN (*182#).</p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.simulating}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 className={styles.simTitle}>Payment Successful!</h2>
            <p className={styles.simDesc}>Transaction approved. Your certificate is being processed...</p>
          </div>
        )}
      </div>
    </div>
  )
}
