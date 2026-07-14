import { useEffect, useState } from 'react'
import { listAdminAppointments } from '../../api/appointments'
import { AppointmentColumns } from '../../components/AppointmentColumns'
import { AppointmentEditor } from '../../components/AppointmentEditor'
import type { Appointment } from '../../types'

// Keep in sync with backend/booking/services.py::ACTIVE_STATUSES
const ACTIVE_STATUSES = new Set(['booked', 'confirmed', 'completed'])

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function Today() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = () => {
    listAdminAppointments(today())
      .then(setAppointments)
      .catch(() => setError("Could not load today's appointments."))
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const revenue = appointments
    .filter((appt) => ACTIVE_STATUSES.has(appt.status))
    .reduce((sum, appt) => sum + Number(appt.service.price), 0)

  return (
    <div>
      <h1>Today</h1>
      {error && <p className="error-text">{error}</p>}
      <div className="stat-row">
        <div className="stat-tile">
          <span className="stat-tile__value">{appointments.length}</span>
          <span className="stat-tile__label">Appointments</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__value">${revenue.toFixed(2)}</span>
          <span className="stat-tile__label">Revenue</span>
        </div>
      </div>
      <AppointmentColumns appointments={appointments} onSelect={setSelected} />
      {selected && (
        <AppointmentEditor
          appointment={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}
