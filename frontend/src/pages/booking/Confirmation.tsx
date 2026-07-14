import { Link, Navigate, useLocation } from 'react-router-dom'
import type { Appointment } from '../../types'

export function Confirmation() {
  const location = useLocation()
  const appointment = (location.state as { appointment?: Appointment } | null)?.appointment

  if (!appointment) return <Navigate to="/" replace />

  const { service, staff, start_at } = appointment

  return (
    <div className="page">
      <h1>You're booked!</h1>
      <p>
        {service.name} with {staff.display_name}
      </p>
      <p>
        {new Date(start_at).toLocaleString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })}
      </p>
      <div className="button-row" style={{ marginTop: 20 }}>
        <Link to="/" className="primary-button">
          Go to home
        </Link>
        <Link to="/book" className="secondary-button">
          Book another appointment
        </Link>
      </div>
    </div>
  )
}
