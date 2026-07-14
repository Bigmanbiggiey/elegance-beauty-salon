import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listStaff } from '../api/staff'
import { teamBanner } from '../assets/photos'
import { Media } from '../components/Media'
import { EmptyState } from '../components/ui/EmptyState'
import { InlineError } from '../components/ui/InlineError'
import { Reveal } from '../components/ui/Reveal'
import { Skeleton } from '../components/ui/Skeleton'
import type { Staff } from '../types'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Team() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    listStaff()
      .then(setStaff)
      .catch(() => setError('Could not load the team.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <div className="page">
      <div className="container">
        <Media src={teamBanner} alt="" aspect="wide" className="team-banner" />

        <div className="section-head" style={{ marginTop: 'var(--space-6)' }}>
          <span className="eyebrow">The team</span>
          <h1>Meet your stylists</h1>
          <p>Every member of our team brings their own specialty — pick a favorite, or let us match you.</p>
        </div>

        {error && <InlineError message={error} onRetry={load} />}

        {loading && !error && (
          <div className="card-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="card" key={i}>
                <Skeleton height={220} style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton height={18} width="60%" />
                  <Skeleton height={14} width="90%" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && staff.length === 0 && (
          <EmptyState title="Team profiles coming soon" description="Check back shortly to meet our stylists." />
        )}

        {!loading && !error && staff.length > 0 && (
          <Reveal>
            <div className="card-grid">
              {staff.map((member) => (
                <div key={member.id} className="card profile-card">
                  <Media
                    src={member.photo}
                    alt={member.display_name}
                    aspect="portrait"
                    monogram={initials(member.display_name)}
                  />
                  <div className="profile-card__body">
                    <span className="profile-card__name">{member.display_name}</span>
                    {member.bio && <p className="profile-card__bio">{member.bio}</p>}
                    {member.services.length > 0 && (
                      <div className="tag-row">
                        {member.services.slice(0, 3).map((service) => (
                          <span key={service.id} className="tag">
                            {service.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="profile-card__actions">
                      <Link to="/book" state={{ staff: member }} className="secondary-button">
                        Book with {member.display_name.split(' ')[0]}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  )
}
