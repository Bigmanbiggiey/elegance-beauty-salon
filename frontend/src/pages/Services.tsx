import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listServices } from '../api/services'
import type { Service } from '../types'

export function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listServices()
      .then(setServices)
      .catch(() => setError('Could not load services.'))
  }, [])

  const groups = new Map<string, Service[]>()
  for (const service of services) {
    const category = service.category || 'Other'
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category)!.push(service)
  }

  return (
    <div className="page">
      <h1>Services</h1>
      {error && <p className="error-text">{error}</p>}
      {[...groups.entries()].map(([category, items]) => (
        <section key={category} className="booking-section">
          <h2>{category}</h2>
          <div className="services-teaser">
            {items.map((service) => (
              <Link key={service.id} to="/book" state={{ service }} className="services-teaser__item">
                <div>{service.name}</div>
                <div className="meta">
                  {service.duration_minutes} min · ${service.price}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
      {services.length === 0 && !error && <p>Services coming soon.</p>}
    </div>
  )
}
