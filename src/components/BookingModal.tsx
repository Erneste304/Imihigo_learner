import { useState } from 'react'
import styles from './BookingModal.module.css'
import { Calendar, Clock, X, CheckCircle } from 'lucide-react'
import RwandanPaymentModal from './RwandanPaymentModal'

interface BookingModalProps {
  mentor: any
  onClose: () => void
  onSuccess: (session: any) => void
}

export default function BookingModal({ mentor, onClose, onSuccess }: BookingModalProps) {
  const [step, setStep] = useState<'slot' | 'payment' | 'success'>('slot')
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [topic, setTopic] = useState('')

  const slots = [
    'Tomorrow, 09:00 - 10:00',
    'Tomorrow, 14:00 - 15:00',
    'Wednesday, 10:00 - 11:00',
    'Thursday, 16:00 - 17:00'
  ]

  const handlePaymentSuccess = () => {
    setStep('success')
    // Simulate API call to book
    setTimeout(() => {
      onSuccess({ id: 's' + Math.random(), mentorName: mentor.name, topic, scheduledAt: selectedSlot })
    }, 2000)
  }

  if (step === 'success') {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal} style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Session Booked!</h2>
          <p className="text-muted mb-8">You will receive a calendar invitation and meeting link via email shortly.</p>
          <button className="btn btn-primary w-full" onClick={onClose}>Great, thanks!</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white" onClick={onClose}>
            <X />
          </button>
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold">Book 1-on-1 Session</h2>
          <p className="text-white/70">with {mentor.name}</p>
        </div>

        <div className={styles.body}>
          {step === 'slot' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Discussing Topic</label>
                <input 
                  type="text" 
                  placeholder="e.g. React Hook optimization"
                  className="w-full p-4 rounded-xl border dark:bg-gray-800 dark:border-gray-700"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Availability</label>
                <div className={styles.slots}>
                  {slots.map(s => (
                    <div 
                      key={s} 
                      className={`${styles.slot} ${selectedSlot === s ? styles.slotSelected : ''}`}
                      onClick={() => setSelectedSlot(s)}
                    >
                      <Clock size={16} className="mx-auto mb-2 opacity-50" />
                      <div className="text-xs">{s}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                className="btn btn-primary w-full py-4 text-lg"
                disabled={!selectedSlot || !topic}
                onClick={() => setStep('payment')}
              >
                Proceed to Payment (RWF {mentor.hourlyRate})
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="animate-in fade-in duration-500">
               <div className="text-center mb-8">
                 <p className="text-muted mb-2">Mentorship Fee</p>
                 <h1 className="text-4xl font-bold">RWF {mentor.hourlyRate}</h1>
               </div>
               {/* Reusing the MoMo modal logic but embedded here */}
               <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold flex items-center gap-2 mb-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg" alt="MTN" className="h-6" />
                    MTN Mobile Money
                  </h3>
                  <input 
                    type="tel" 
                    placeholder="078 XXX XXXX"
                    className="w-full p-4 rounded-xl border mb-4 text-center text-xl tracking-widest font-bold"
                  />
                  <button className="btn btn-primary w-full py-4" onClick={handlePaymentSuccess}>
                    Confirm & Pay
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
