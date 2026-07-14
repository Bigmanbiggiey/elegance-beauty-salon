import { useEffect, useState } from 'react'
import { updateAppointment } from '../api/appointments'
import { ApiError } from '../api/client'
import { listStaff } from '../api/staff'
import type { Appointment, AppointmentStatus, Staff } from '../types'

const STATUS_OPTIONS: AppointmentStatus[] = ['booked', 'confirmed', 'cancelled', 'completed', 'no_show']

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function AppointmentEditor({
  appointment,
  onClose,
  onSaved,
}: {
  appointment: Appointment
  onClose: () => void
  onSaved: () => void
}) {
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status)
  const [cancellationReason, setCancellationReason] = useState(appointment.cancellation_reason)
  const [staffId, setStaffId] = useState(appointment.staff.id)
  const [startAt, setStartAt] = useState(toDatetimeLocal(appointment.start_at))
  const [staffOptions, setStaffOptions] = useState<Staff[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    listStaff(appointment.service.id)
      .then((result) => {
        if (!cancelled) setStaffOptions(result)
      })
      .catch(() => {
        if (!cancelled) setStaffOptions([appointment.staff])
      })
    return () => {
      cancelled = true
    }
  }, [appointment.service.id, appointment.staff])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateAppointment(appointment.id, {
        status,
        cancellation_reason: cancellationReason,
        staff_id: staffId,
        start_at: new Date(startAt).toISOString(),
      })
      onSaved()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('That time is no longer available for this stylist.')
      } else {
        setError('Could not save changes.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h2>{appointment.client.name}</h2>
        <p className="meta">
          {appointment.service.name} · {appointment.client.phone}
          {appointment.client.email ? ` · ${appointment.client.email}` : ''}
        </p>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={(e) => e.preventDefault()}>
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          {status === 'cancelled' && (
            <label>
              Cancellation reason
              <input value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)} />
            </label>
          )}
          <label>
            Stylist
            <select value={staffId} onChange={(e) => setStaffId(Number(e.target.value))}>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.display_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Start time
            <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
          </label>
          <div className="modal-panel__actions">
            <button type="button" className="primary-button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="secondary-button" onClick={onClose}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
