import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listServices } from '../api/services'
import { categoryPhoto, photosForCategory } from '../assets/photos'
import { Media } from '../components/Media'
import { PortfolioGallery } from '../components/PortfolioGallery'
import { EmptyState } from '../components/ui/EmptyState'
import { InlineError } from '../components/ui/InlineError'
import { Reveal } from '../components/ui/Reveal'
import { Skeleton } from '../components/ui/Skeleton'
import type { Service } from '../types'

export function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    listServices()
      .then(setServices)
      .catch(() => setError('Could not load services. Is the backend running?'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const groups = new Map<string, Service[]>()
  for (const service of services) {
    const category = service.category || 'Other'
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category)!.push(service)
  }

  return (
    <div className="page">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Menu</span>
          <h1>Services</h1>
          <p>The full Elegance Beauty menu, grouped by category — pick one to see details, or book straight away.</p>
        </div>

        {error && <InlineError message={error} onRetry={load} />}

        {loading && !error && (
          <div className="card-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="card" key={i}>
                <Skeleton height={150} style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton height={12} width="40%" />
                  <Skeleton height={18} width="70%" />
                  <Skeleton height={14} width="50%" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <EmptyState title="Services coming soon" description="Our menu is being finalized — check back shortly." />
        )}

        {!loading &&
          !error &&
          [...groups.entries()].map(([category, items], i) => (
            <Reveal key={category} delay={Math.min(i * 0.06, 0.24)} className="section">
              <h2>{category}</h2>
              <PortfolioGallery title={category} photos={photosForCategory(category)} />
              <div className="card-grid" style={{ marginTop: 16 }}>
                {items.map((service) => (
                  <div key={service.id} className="card service-card">
                    <Media
                      src={service.image || categoryPhoto(service.category, service.id)}
                      alt={service.name}
                      aspect="landscape"
                    />
                    <div className="service-card__body">
                      <Link to={`/services/${service.id}`} className="service-card__name" style={{ textDecoration: 'none' }}>
                        {service.name}
                      </Link>
                      <span className="service-card__meta">
                        {service.duration_minutes} min · ${service.price}
                      </span>
                      <div className="service-card__actions">
                        <Link to="/book" state={{ service }} className="secondary-button" style={{ padding: '8px 18px' }}>
                          Book
                        </Link>
                        <Link to={`/services/${service.id}`} className="ghost-button">
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
      </div>
    </div>
  )
}
