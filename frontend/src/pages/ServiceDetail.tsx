import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listServices } from '../api/services'
import { listStaff } from '../api/staff'
import { categoryPhoto } from '../assets/photos'
import { Media } from '../components/Media'
import { EmptyState } from '../components/ui/EmptyState'
import { InlineError } from '../components/ui/InlineError'
import { Reveal } from '../components/ui/Reveal'
import { Skeleton } from '../components/ui/Skeleton'
import type { Service, Staff } from '../types'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function ServiceDetail() {
  const { id } = useParams<{ id: string }>()
  const [service, setService] = useState<Service | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staff, setStaff] = useState<Staff[]>([])
  const [staffLoading, setStaffLoading] = useState(true)

  function load() {
    setLoading(true)
    setError(null)
    setNotFound(false)
    listServices()
      .then((services) => {
        const found = services.find((s) => s.id === Number(id))
        if (!found) {
          setNotFound(true)
          return
        }
        setService(found)
      })
      .catch(() => setError('Could not load this service.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  useEffect(() => {
    if (!service) return
    setStaffLoading(true)
    listStaff(service.id)
      .then(setStaff)
      .catch(() => setStaff([]))
      .finally(() => setStaffLoading(false))
  }, [service])

  if (loading) {
    return (
      <div className="page">
        <div className="container container--narrow">
          <Skeleton height={280} style={{ borderRadius: 'var(--radius-lg)' }} />
          <Skeleton height={16} width="30%" style={{ marginTop: 24 }} />
          <Skeleton height={40} width="70%" style={{ marginTop: 12 }} />
          <Skeleton height={80} style={{ marginTop: 16 }} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <div className="container container--narrow">
          <InlineError message={error} onRetry={load} />
        </div>
      </div>
    )
  }

  if (notFound || !service) {
    return (
      <div className="page">
        <div className="container container--narrow">
          <EmptyState
            title="Service not found"
            description="This service may have been removed or renamed."
            action={
              <Link to="/services" className="secondary-button">
                Back to services
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container container--narrow">
        <Link to="/services" className="back-link">
          ← All services
        </Link>

        <div className="section" style={{ paddingBottom: 0 }}>
          <Media
            src={service.image || categoryPhoto(service.category, service.id)}
            alt={service.name}
            aspect="landscape"
          />
        </div>

        <Reveal>
          {service.category && <span className="eyebrow">{service.category}</span>}
          <h1>{service.name}</h1>
          <p className="service-card__meta" style={{ fontSize: 'var(--text-body)' }}>
            {service.duration_minutes} min · ${service.price}
          </p>

          {service.description && (
            <p style={{ marginTop: 16, color: 'var(--ink-soft)' }}>{service.description}</p>
          )}

          <div className="hero-split__actions" style={{ marginTop: 24 }}>
            <Link to="/book" state={{ service }} className="primary-button">
              Book this service
            </Link>
          </div>
        </Reveal>

        <Reveal className="section">
          <h2>Recommended stylists</h2>
          {staffLoading && (
            <div className="staff-strip">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton height={160} style={{ borderRadius: 'var(--radius-md)' }} />
                  <Skeleton height={14} width="60%" style={{ marginTop: 12 }} />
                </div>
              ))}
            </div>
          )}
          {!staffLoading && staff.length === 0 && (
            <EmptyState title="Any of our stylists can help" description="Pick a time and we'll match you with someone great." />
          )}
          {!staffLoading && staff.length > 0 && (
            <div className="staff-strip">
              {staff.map((member) => (
                <Link key={member.id} to="/team" className="staff-strip__item">
                  <Media src={member.photo} alt={member.display_name} aspect="portrait" monogram={initials(member.display_name)} />
                  <div className="staff-strip__name">{member.display_name}</div>
                </Link>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </div>
  )
}
