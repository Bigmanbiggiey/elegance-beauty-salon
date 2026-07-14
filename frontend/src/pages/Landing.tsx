import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listServices } from '../api/services'
import { listStaff } from '../api/staff'
import { categoryPhoto, heroImage } from '../assets/photos'
import { Media } from '../components/Media'
import { EmptyState } from '../components/ui/EmptyState'
import { InlineError } from '../components/ui/InlineError'
import { Reveal } from '../components/ui/Reveal'
import { Skeleton } from '../components/ui/Skeleton'
import { IconCalendarCheck } from '../components/icons'
import type { Service, Staff } from '../types'

const TEASER_LIMIT = 4
const STAFF_LIMIT = 6

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Landing() {
  const [services, setServices] = useState<Service[]>([])
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [servicesLoading, setServicesLoading] = useState(true)

  const [staff, setStaff] = useState<Staff[]>([])
  const [staffLoading, setStaffLoading] = useState(true)

  function loadServices() {
    setServicesLoading(true)
    setServicesError(null)
    listServices()
      .then(setServices)
      .catch(() => setServicesError('Could not load services.'))
      .finally(() => setServicesLoading(false))
  }

  useEffect(() => {
    loadServices()
    listStaff()
      .then(setStaff)
      .catch(() => setStaff([]))
      .finally(() => setStaffLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="container">
        <section className="hero-split">
          <div>
            <span className="eyebrow">Now booking</span>
            <h1>Look stunning. Feel elegant.</h1>
            <p className="hero__sub" style={{ marginTop: 16, maxWidth: '46ch', color: 'var(--ink-soft)' }}>
              Elegance Beauty brings bold color, precision cuts, and glam styling together in one
              place — book your appointment in under a minute, no account needed.
            </p>
            <div className="hero-split__actions">
              <Link to="/book" className="primary-button">
                Book an appointment
              </Link>
              <Link to="/services" className="secondary-button">
                Explore services
              </Link>
            </div>
            <p className="hero-split__note">Walk-ins welcome · Message us on WhatsApp anytime</p>
          </div>

          <div className="hero-split__media">
            <Media src={heroImage} alt="Stylist braiding a client's hair" aspect="portrait" />
            <div className="hero-badge">
              <span className="hero-badge__icon">
                <IconCalendarCheck size={18} />
              </span>
              <span>
                <span className="hero-badge__title" style={{ display: 'block' }}>
                  Book in under a minute
                </span>
                <span className="hero-badge__subtitle">No account needed</span>
              </span>
            </div>
          </div>
        </section>

        <Reveal className="section">
          <div className="value-props">
            <div className="value-prop">
              <span className="value-prop__icon">✂</span>
              <div className="value-prop__title">Precision styling</div>
              <p className="value-prop__description">
                Cuts and finishes tailored to you, from quick trims to full transformations.
              </p>
            </div>
            <div className="value-prop">
              <span className="value-prop__icon">✦</span>
              <div className="value-prop__title">Vibrant color</div>
              <p className="value-prop__description">
                Balayage, highlights, and bold color done with real technique.
              </p>
            </div>
            <div className="value-prop">
              <span className="value-prop__icon">⚡</span>
              <div className="value-prop__title">Effortless booking</div>
              <p className="value-prop__description">
                Pick a time, share your details, done — or message us on WhatsApp instead.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal className="section">
          <div className="section-head section-head--split">
            <div>
              <span className="eyebrow">Menu</span>
              <h2>Our services</h2>
            </div>
            {services.length > 0 && <Link to="/services" className="ghost-button">See all services →</Link>}
          </div>

          {servicesError && <InlineError message={servicesError} onRetry={loadServices} />}

          {servicesLoading && !servicesError && (
            <div className="card-grid">
              {Array.from({ length: TEASER_LIMIT }).map((_, i) => (
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

          {!servicesLoading && !servicesError && services.length === 0 && (
            <EmptyState title="Services coming soon" description="Check back shortly — our menu is being finalized." />
          )}

          {!servicesLoading && !servicesError && services.length > 0 && (
            <div className="card-grid">
              {services.slice(0, TEASER_LIMIT).map((service) => (
                <div key={service.id} className="card service-card">
                  <Media
                    src={service.image || categoryPhoto(service.category, service.id)}
                    alt={service.name}
                    aspect="landscape"
                  />
                  <div className="service-card__body">
                    {service.category && <span className="service-card__category">{service.category}</span>}
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
          )}
        </Reveal>

        <Reveal className="section">
          <div className="section-head section-head--split">
            <div>
              <span className="eyebrow">The team</span>
              <h2>Meet your stylists</h2>
            </div>
            {staff.length > 0 && <Link to="/team" className="ghost-button">Meet everyone →</Link>}
          </div>

          {staffLoading && (
            <div className="staff-strip">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton height={200} style={{ borderRadius: 'var(--radius-md)' }} />
                  <Skeleton height={14} width="60%" style={{ marginTop: 12 }} />
                </div>
              ))}
            </div>
          )}

          {!staffLoading && staff.length === 0 && (
            <EmptyState title="Meet the team soon" description="Our stylist profiles are on their way." />
          )}

          {!staffLoading && staff.length > 0 && (
            <div className="staff-strip">
              {staff.slice(0, STAFF_LIMIT).map((member) => (
                <Link key={member.id} to="/team" className="staff-strip__item">
                  <Media src={member.photo} alt={member.display_name} aspect="portrait" monogram={initials(member.display_name)} />
                  <div className="staff-strip__name">{member.display_name}</div>
                  {member.bio && <div className="staff-strip__role">{member.bio.slice(0, 40)}</div>}
                </Link>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal className="section">
          <div className="cta-band">
            <h2>Ready for your best look yet?</h2>
            <p>Book online in under a minute, or message us on WhatsApp if you'd rather chat first.</p>
            <Link to="/book" className="primary-button">
              Book an appointment
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
