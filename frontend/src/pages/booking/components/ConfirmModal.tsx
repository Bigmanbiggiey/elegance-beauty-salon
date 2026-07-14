import type { GuestDetails, Service, Staff } from '../../../types'

export function ConfirmModal({
  service,
  staff,
  slot,
  guest,
  notes,
  submitting,
  error,
  onConfirm,
  onCancel,
}: {
  service: Service
  staff: Staff
  slot: string
  guest: GuestDetails
  notes: string
  submitting: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h2>Confirm your booking</h2>

        <div className="summary-row">
          <span className="summary-row__label">Service</span>
          <span className="summary-row__value">{service.name}</span>
        </div>
        <div className="summary-row">
          <span className="summary-row__label">Stylist</span>
          <span className="summary-row__value">{staff.display_name}</span>
        </div>
        <div className="summary-row">
          <span className="summary-row__label">When</span>
          <span className="summary-row__value">
            {new Date(slot).toLocaleString([], {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-row__label">Name</span>
          <span className="summary-row__value">{guest.name}</span>
        </div>
        <div className="summary-row">
          <span className="summary-row__label">Phone</span>
          <span className="summary-row__value">{guest.phone}</span>
        </div>
        {guest.email && (
          <div className="summary-row">
            <span className="summary-row__label">Email</span>
            <span className="summary-row__value">{guest.email}</span>
          </div>
        )}
        {notes && (
          <div className="summary-row">
            <span className="summary-row__label">Notes</span>
            <span className="summary-row__value">{notes}</span>
          </div>
        )}

        {error && <p className="error-text" style={{ marginTop: 12 }}>{error}</p>}

        <div className="modal-panel__actions" style={{ marginTop: 16 }}>
          <button type="button" className="primary-button" onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Confirming…' : 'Confirm booking'}
          </button>
          <button type="button" className="secondary-button" onClick={onCancel} disabled={submitting}>
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}
