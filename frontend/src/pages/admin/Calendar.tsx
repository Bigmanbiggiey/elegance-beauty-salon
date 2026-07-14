import { useEffect, useRef, useState } from 'react'
import { listAdminAppointments } from '../../api/appointments'
import { AppointmentColumns } from '../../components/AppointmentColumns'
import { AppointmentEditor } from '../../components/AppointmentEditor'
import type { Appointment } from '../../types'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function Calendar() {
  const [date, setDate] = useState(today())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const latestRequestId = useRef(0)

  const refresh = () => {
    const requestId = ++latestRequestId.current
    listAdminAppointments(date)
      .then((result) => {
        if (latestRequestId.current === requestId) setAppointments(result)
      })
      .catch(() => {
        if (latestRequestId.current === requestId) setError('Could not load appointments.')
      })
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  return (
    <div>
      <h1>Calendar</h1>
      <label>
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      {error && <p className="error-text">{error}</p>}
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
