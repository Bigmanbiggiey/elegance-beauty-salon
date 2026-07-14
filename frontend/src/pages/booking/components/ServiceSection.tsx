import { useEffect, useState } from 'react'
import { categoryPhoto } from '../../../assets/photos'
import { Media } from '../../../components/Media'
import { EmptyState } from '../../../components/ui/EmptyState'
import { InlineError } from '../../../components/ui/InlineError'
import { Skeleton } from '../../../components/ui/Skeleton'
import { listServices } from '../../../api/services'
import type { Service } from '../../../types'

export function ServiceSection({ onSelect }: { onSelect: (service: Service) => void }) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string | null>(null)

  function load() {
    let cancelled = false
    setLoading(true)
    setError(null)
    listServices()
      .then((result) => {
        if (!cancelled) setServices(result)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load services. Is the backend running?')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }

  useEffect(load, [])

  if (loading) {
    return (
      <div className="option-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={68} />
        ))}
      </div>
    )
  }

  if (error) return <InlineError message={error} onRetry={load} />

  const groups = new Map<string, Service[]>()
  for (const service of services) {
    const cat = service.category || 'Other'
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(service)
  }
  const categories = [...groups.keys()].sort()

  if (categories.length === 0) {
    return <EmptyState title="No services available yet" description="Please check back shortly." />
  }

  if (!category) {
    return (
      <div className="option-grid">
        {categories.map((cat) => {
          const items = groups.get(cat)!
          return (
            <button key={cat} className="option-button" onClick={() => setCategory(cat)}>
              <div>{cat}</div>
              <div className="meta">
                {items.length} service{items.length === 1 ? '' : 's'}
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <button type="button" className="back-link" onClick={() => setCategory(null)}>
        ← Categories
      </button>
      <div className="option-grid" style={{ marginTop: 12 }}>
        {groups.get(category)!.map((service) => (
          <button
            key={service.id}
            className="option-button option-button--with-media"
            onClick={() => onSelect(service)}
          >
            <Media
              src={service.image || categoryPhoto(service.category, service.id)}
              alt=""
              aspect="square"
              className="option-button__thumb"
            />
            <span>
              <div>{service.name}</div>
              <div className="meta">
                {service.duration_minutes} min · ${service.price}
              </div>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
