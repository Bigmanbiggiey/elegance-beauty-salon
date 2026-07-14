import { useEffect, useState } from 'react'
import { listServices } from '../../../api/services'
import type { Service } from '../../../types'

export function ServiceSection({ onSelect }: { onSelect: (service: Service) => void }) {
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string | null>(null)

  useEffect(() => {
    listServices()
      .then(setServices)
      .catch(() => setError('Could not load services. Is the backend running?'))
  }, [])

  if (error) return <p className="error-text">{error}</p>

  const groups = new Map<string, Service[]>()
  for (const service of services) {
    const cat = service.category || 'Other'
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(service)
  }
  const categories = [...groups.keys()].sort()

  if (!category) {
    return (
      <div>
        <div className="option-list">
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
        {categories.length === 0 && <p>No services available yet.</p>}
      </div>
    )
  }

  return (
    <div>
      <button type="button" className="back-link" onClick={() => setCategory(null)}>
        ← Categories
      </button>
      <div className="option-list">
        {groups.get(category)!.map((service) => (
          <button key={service.id} className="option-button" onClick={() => onSelect(service)}>
            <div>{service.name}</div>
            <div className="meta">
              {service.duration_minutes} min · ${service.price}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
