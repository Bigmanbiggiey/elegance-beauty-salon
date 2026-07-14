import { useEffect, useState } from 'react'
import { getAvailability } from '../../../api/appointments'
import type { Service, Staff } from '../../../types'
import { TimeSlotPanel } from './TimeSlotPanel'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function TimeSection({
  service,
  staff,
  date,
  onChangeDate,
  onSelectSlot,
  conflictMessage,
}: {
  service: Service
  staff: Staff
  date: string
  onChangeDate: (date: string) => void
  onSelectSlot: (slot: string) => void
  conflictMessage: string | null
}) {
  const [slots, setSlots] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getAvailability(staff.id, service.id, date)
      .then((res) => {
        if (!cancelled) setSlots(res.slots)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load availability.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [service, staff, date])

  return (
    <div>
      <label>
        Date
        <input type="date" value={date} min={today()} onChange={(e) => onChangeDate(e.target.value)} />
      </label>
      {conflictMessage && <p className="error-text">{conflictMessage}</p>}
      {error && <p className="error-text">{error}</p>}
      {loading && <p>Loading available times…</p>}
      {!loading && slots.length === 0 && !error && <p>No available times on this date.</p>}
      <TimeSlotPanel slots={slots} onSelectSlot={onSelectSlot} />
    </div>
  )
}
