import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listServices } from '../api/services'
import type { Service } from '../types'

const TEASER_LIMIT = 4

export function Landing() {
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listServices()
      .then(setServices)
      .catch(() => setError('Could not load services.'))
  }, [])

  return (
    <div className="page">
      <section className="hero">
        <h1>Look good. Feel better.</h1>
        <p className="hero__sub">
          Book your next haircut, color, or styling appointment in under a minute — no account
          needed.
        </p>
        <Link to="/book" className="primary-button">
          Book an appointment
        </Link>
      </section>

      <section>
        <h2>Our services</h2>
        {error && <p className="error-text">{error}</p>}
        <div className="services-teaser">
          {services.slice(0, TEASER_LIMIT).map((service) => (
            <Link key={service.id} to="/book" state={{ service }} className="services-teaser__item">
              <div>{service.name}</div>
              <div className="meta">
                {service.duration_minutes} min · ${service.price}
              </div>
            </Link>
          ))}
          {services.length === 0 && !error && <p>Services coming soon.</p>}
        </div>
        {services.length > 0 && (
          <p style={{ marginTop: 16 }}>
            <Link to="/services">See all services →</Link>
          </p>
        )}
      </section>
    </div>
  )
}
