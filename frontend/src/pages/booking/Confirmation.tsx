import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { IconCheck, IconWhatsApp } from '../../components/icons'
import { EmptyState } from '../../components/ui/EmptyState'
import { whatsappHref } from '../../config/business'
import type { Appointment } from '../../types'

function buildIcs(appointment: Appointment): string {
  const format = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${format(appointment.start_at)}`,
    `DTEND:${format(appointment.end_at)}`,
    `SUMMARY:${appointment.service.name} at Elegance Beauty`,
    `DESCRIPTION:Appointment with ${appointment.staff.display_name}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function Confirmation() {
  const location = useLocation()
  const appointment = (location.state as { appointment?: Appointment } | null)?.appointment

  if (!appointment) {
    return (
      <div className="page">
        <div className="container container--narrow">
          <EmptyState
            title="This confirmation has expired"
            description="Refreshing or revisiting this page clears your last booking's details — but don't worry, nothing was lost."
            action={
              <Link to="/book" className="primary-button">
                Book again
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const { service, staff, start_at } = appointment
  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(appointment))}`

  return (
    <div className="page">
      <div className="container container--narrow" style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--good)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <IconCheck size={32} />
        </motion.div>

        <h1>You're booked!</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)' }}>We can't wait to see you at Elegance Beauty.</p>

        <div className="card" style={{ marginTop: 24, padding: 20, textAlign: 'left' }}>
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
              {new Date(start_at).toLocaleString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>
        </div>

        <div className="button-row" style={{ marginTop: 24, justifyContent: 'center' }}>
          <a href={icsHref} download="appointment.ics" className="secondary-button">
            Add to calendar
          </a>
          <Link to="/book" className="secondary-button">
            Book another
          </Link>
        </div>

        <p style={{ marginTop: 24 }}>
          Need to change anything?{' '}
          <a
            href={whatsappHref('Hi! I need to change my appointment.')}
            target="_blank"
            rel="noreferrer"
            className="whatsapp-inline-link"
          >
            <IconWhatsApp size={14} /> Message us on WhatsApp
          </a>
        </p>

        <Link to="/" className="ghost-button" style={{ marginTop: 16, display: 'inline-block' }}>
          Go to home
        </Link>
      </div>
    </div>
  )
}
