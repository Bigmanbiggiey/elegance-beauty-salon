import { useEffect, useState } from 'react'
import { listStaff } from '../../../api/staff'
import type { Service, Staff } from '../../../types'

export function StaffSection({
  service,
  onSelect,
}: {
  service: Service
  onSelect: (staff: Staff) => void
}) {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listStaff(service.id)
      .then((result) => {
        if (!cancelled) setStaffList(result)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load staff.')
      })
    return () => {
      cancelled = true
    }
  }, [service])

  return (
    <div>
      {error && <p className="error-text">{error}</p>}
      <div className="option-list">
        {staffList.map((staff) => (
          <button key={staff.id} className="option-button" onClick={() => onSelect(staff)}>
            <div>{staff.display_name}</div>
            {staff.bio && <div className="meta">{staff.bio}</div>}
          </button>
        ))}
        {staffList.length === 0 && !error && <p>No staff currently offer this service.</p>}
      </div>
    </div>
  )
}
