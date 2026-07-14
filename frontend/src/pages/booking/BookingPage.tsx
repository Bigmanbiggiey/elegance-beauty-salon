import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createAppointment } from '../../api/appointments'
import { ApiError } from '../../api/client'
import type { GuestDetails as GuestDetailsType, Service, Staff } from '../../types'
import { ConfirmModal } from './components/ConfirmModal'
import { DetailsSection } from './components/DetailsSection'
import { ServiceSection } from './components/ServiceSection'
import { StaffSection } from './components/StaffSection'
import { StepSummary } from './components/StepSummary'
import { TimeSection } from './components/TimeSection'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function BookingPage() {
  const location = useLocation()
  const preselectedService = (location.state as { service?: Service } | null)?.service ?? null

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

  const handleBack = () => {
    if (slot) {
      setSlot(null)
      setConflictMessage(null)
    } else if (staff) {
      setStaff(null)
    } else if (service) {
      setService(null)
      setStaff(null)
    } else {
      navigate('/')
    }
  }

  const handleSelectService = (selected: Service) => {
    setService(selected)
    setStaff(null)
    setSlot(null)
  }

  const handleSelectStaff = (selected: Staff) => {
    setStaff(selected)
    setSlot(null)
  }

  const handleChangeDate = (nextDate: string) => {
    setDate(nextDate)
    setSlot(null)
    setConflictMessage(null)
  }

  const handleSelectSlot = (selected: string) => {
    setSlot(selected)
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
      <button type="button" className="back-link" onClick={handleBack}>
        ← Back
      </button>
      <h1>Book an appointment</h1>

      <div className="booking-section">
        <span className="booking-section__label">Service</span>
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
      </div>

      {service && (
        <div className="booking-section">
          <span className="booking-section__label">Stylist</span>
          {staff ? (
            <StepSummary
              value={staff.display_name}
              onChange={() => {
                setStaff(null)
                setSlot(null)
              }}
            />
          ) : (
            <StaffSection service={service} onSelect={handleSelectStaff} />
          )}
        </div>
      )}

      {service && staff && (
        <div className="booking-section">
          <span className="booking-section__label">Date &amp; time</span>
          {slot ? (
            <StepSummary
              value={new Date(slot).toLocaleString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
              onChange={() => {
                setSlot(null)
                setConflictMessage(null)
              }}
            />
          ) : (
            <TimeSection
              service={service}
              staff={staff}
              date={date}
              onChangeDate={handleChangeDate}
              onSelectSlot={handleSelectSlot}
              conflictMessage={conflictMessage}
            />
          )}
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

      {reviewOpen && service && staff && slot && (
        <ConfirmModal
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
    </div>
  )
}
