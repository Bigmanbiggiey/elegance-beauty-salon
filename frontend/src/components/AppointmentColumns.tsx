import type { Appointment } from '../types'

export function AppointmentColumns({
  appointments,
  onSelect,
}: {
  appointments: Appointment[]
  onSelect: (appointment: Appointment) => void
}) {
  const columns = new Map<number, { name: string; appointments: Appointment[] }>()
  for (const appt of appointments) {
    if (!columns.has(appt.staff.id)) columns.set(appt.staff.id, { name: appt.staff.display_name, appointments: [] })
    columns.get(appt.staff.id)!.appointments.push(appt)
  }

  if (columns.size === 0) return <p>No appointments on this date.</p>

  return (
    <div className="calendar-columns">
      {[...columns.entries()].map(([staffId, col]) => (
        <div key={staffId} className="calendar-column">
          <h2>{col.name}</h2>
          {col.appointments
            .sort((a, b) => a.start_at.localeCompare(b.start_at))
            .map((appt) => (
              <div
                key={appt.id}
                className={`appointment-card status-${appt.status}`}
                onClick={() => onSelect(appt)}
              >
                <div>{new Date(appt.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div>{appt.client.name}</div>
                <div className="meta">
                  {appt.service.name} · {appt.status}
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}
