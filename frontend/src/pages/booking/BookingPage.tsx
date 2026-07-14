import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createAppointment } from '../../api/appointments'
import { ApiError } from '../../api/client'
import type { GuestDetails as GuestDetailsType, Service, Staff } from '../../types'
import { ConfirmModal } from './components/ConfirmModal'
import { DetailsSection } from './components/DetailsSection'
import { ServiceSection } from './components/ServiceSection'
import { StepSummary } from './components/StepSummary'
import { TimeStylistSection } from './components/TimeStylistSection'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function StepFade({ stateKey, children }: { stateKey: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stateKey}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function BookingPage() {
  const location = useLocation()
  const navState = location.state as { service?: Service; staff?: Staff } | null
  const preselectedService = navState?.service ?? null
  const preselectedStaff = navState?.staff ?? null

  const [service, setService] = useState<Service | null>(preselectedService)
  const [staff, setStaff] = useState<Staff | null>(null)
  const [date, setDate] = useState(today())
  const [slot, setSlot] = useState<string | null>(null)
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)

  const [guest, setGuest] = useState<GuestDetailsType>({ name: '', phone: '', email: '' })
  const [notes, setNotes] = useState('')

  const [reviewOpen, setReviewOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const navigate = useNavigate()

  const stepIndex = !service ? 0 : !slot ? 1 : 2
  const stepLabels = ['Service', 'Time & stylist', 'Your details']

  const handleBack = () => {
    if (slot) {
      setSlot(null)
      setStaff(null)
      setConflictMessage(null)
    } else if (service) {
      setService(null)
      setStaff(null)
      setSlot(null)
    } else {
      navigate('/')
    }
  }

  const handleSelectService = (selected: Service) => {
    setService(selected)
    setStaff(null)
    setSlot(null)
  }

  const handleChangeDate = (nextDate: string) => {
    setDate(nextDate)
    setSlot(null)
    setConflictMessage(null)
  }

  const handleSelectSlot = (selectedStaff: Staff, selectedSlot: string) => {
    setStaff(selectedStaff)
    setSlot(selectedSlot)
    setConflictMessage(null)
  }

  const handleConfirmSubmit = async () => {
    if (!service || !staff || !slot) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const appointment = await createAppointment({
        service_id: service.id,
        staff_id: staff.id,
        start_at: slot,
        notes,
        client: guest,
      })
      navigate('/book/confirmation', { state: { appointment } })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setReviewOpen(false)
        setSlot(null)
        setStaff(null)
        setConflictMessage('That time was just taken by someone else. Please choose another.')
      } else {
        setSubmitError('Something went wrong submitting your booking. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="container container--narrow">
        <button type="button" className="back-link" onClick={handleBack}>
          ← Back
        </button>
        <h1>Book an appointment</h1>

        <div className="booking-progress">
          {stepLabels.map((_, i) => (
            <span className="booking-progress__step" key={i}>
              <span
                className="booking-progress__step-fill"
                style={{ width: i <= stepIndex ? '100%' : '0%' }}
              />
            </span>
          ))}
          <span className="booking-progress__label">
            Step {stepIndex + 1} of {stepLabels.length}
          </span>
        </div>

        <div className="booking-section">
          <span className="booking-section__label">Service</span>
          <StepFade stateKey={service ? `summary-${service.id}` : 'picker'}>
            {service ? (
              <StepSummary
                value={service.name}
                meta={`${service.duration_minutes} min · $${service.price}`}
                onChange={() => {
                  setService(null)
                  setStaff(null)
                  setSlot(null)
                }}
              />
            ) : (
              <ServiceSection onSelect={handleSelectService} />
            )}
          </StepFade>
        </div>

        {service && (
          <div className="booking-section">
            <span className="booking-section__label">Date &amp; stylist</span>
            <StepFade stateKey={slot ? `summary-${slot}` : 'picker'}>
              {slot && staff ? (
                <StepSummary
                  value={new Date(slot).toLocaleString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                  meta={`with ${staff.display_name}`}
                  onChange={() => {
                    setSlot(null)
                    setStaff(null)
                    setConflictMessage(null)
                  }}
                />
              ) : (
                <TimeStylistSection
                  service={service}
                  date={date}
                  onChangeDate={handleChangeDate}
                  onSelectSlot={handleSelectSlot}
                  conflictMessage={conflictMessage}
                  initialStylist={preselectedStaff}
                />
              )}
            </StepFade>
          </div>
        )}

        {service && staff && slot && (
          <div className="booking-section">
            <span className="booking-section__label">Your details</span>
            <DetailsSection
              guest={guest}
              notes={notes}
              onChangeGuest={setGuest}
              onChangeNotes={setNotes}
              onReview={() => setReviewOpen(true)}
            />
          </div>
        )}

        <AnimatePresence>
          {reviewOpen && service && staff && slot && (
            <ConfirmModal
              key="confirm-modal"
              service={service}
              staff={staff}
              slot={slot}
              guest={guest}
              notes={notes}
              submitting={submitting}
              error={submitError}
              onConfirm={handleConfirmSubmit}
              onCancel={() => setReviewOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
