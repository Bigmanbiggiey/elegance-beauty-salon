import { useEffect, useMemo, useState } from 'react'
import { getAvailability } from '../../../api/appointments'
import { listStaff } from '../../../api/staff'
import { InlineError } from '../../../components/ui/InlineError'
import { Skeleton } from '../../../components/ui/Skeleton'
import type { Service, Staff } from '../../../types'
import { TimeSlotPanel } from './TimeSlotPanel'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

interface SlotOption {
  time: string
  staffIds: number[]
}

/** Combines stylist choice into the time step: defaults to "any available
 * stylist" (aggregated availability across every staff qualified for the
 * service), with an optional inline filter for a specific person. Removes a
 * whole mandatory screen from the original service → stylist → time flow. */
export function TimeStylistSection({
  service,
  date,
  onChangeDate,
  onSelectSlot,
  conflictMessage,
  initialStylist,
}: {
  service: Service
  date: string
  onChangeDate: (date: string) => void
  onSelectSlot: (staff: Staff, slot: string) => void
  conflictMessage: string | null
  initialStylist?: Staff | null
}) {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [staffLoading, setStaffLoading] = useState(true)
  const [staffError, setStaffError] = useState<string | null>(null)

  const [slotsByStaff, setSlotsByStaff] = useState<Record<number, string[]>>({})
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [selectedStylistId, setSelectedStylistId] = useState<number | null>(null)
  const [showStylistFilter, setShowStylistFilter] = useState(false)
  const [appliedInitialStylist, setAppliedInitialStylist] = useState(false)

  function loadStaff() {
    setStaffLoading(true)
    setStaffError(null)
    listStaff(service.id)
      .then(setStaffList)
      .catch(() => setStaffError('Could not load stylists.'))
      .finally(() => setStaffLoading(false))
  }

  useEffect(loadStaff, [service])

  useEffect(() => {
    if (appliedInitialStylist || !initialStylist || staffList.length === 0) return
    if (staffList.some((member) => member.id === initialStylist.id)) {
      setSelectedStylistId(initialStylist.id)
      setShowStylistFilter(true)
    }
    setAppliedInitialStylist(true)
  }, [staffList, initialStylist, appliedInitialStylist])

  useEffect(() => {
    let cancelled = false
    if (staffList.length === 0) {
      setSlotsByStaff({})
      return
    }
    setSlotsLoading(true)
    Promise.all(
      staffList.map((member) =>
        getAvailability(member.id, service.id, date)
          .then((res) => [member.id, res.slots] as const)
          .catch(() => [member.id, [] as string[]] as const),
      ),
    ).then((pairs) => {
      if (cancelled) return
      const next: Record<number, string[]> = {}
      for (const [staffId, slots] of pairs) next[staffId] = slots
      setSlotsByStaff(next)
      setSlotsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [staffList, service, date])

  const mergedOptions = useMemo<SlotOption[]>(() => {
    const map = new Map<string, number[]>()
    for (const member of staffList) {
      for (const slot of slotsByStaff[member.id] ?? []) {
        if (!map.has(slot)) map.set(slot, [])
        map.get(slot)!.push(member.id)
      }
    }
    return [...map.entries()]
      .map(([time, staffIds]) => ({ time, staffIds }))
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [staffList, slotsByStaff])

  const visibleSlots = useMemo(
    () =>
      (selectedStylistId == null
        ? mergedOptions
        : mergedOptions.filter((option) => option.staffIds.includes(selectedStylistId))
      ).map((option) => option.time),
    [mergedOptions, selectedStylistId],
  )

  function handlePickSlot(slot: string) {
    const option = mergedOptions.find((o) => o.time === slot)
    if (!option) return
    const staffId =
      selectedStylistId != null && option.staffIds.includes(selectedStylistId)
        ? selectedStylistId
        : option.staffIds[0]
    const assigned = staffList.find((member) => member.id === staffId)
    if (assigned) onSelectSlot(assigned, slot)
  }

  const loading = staffLoading || slotsLoading

  return (
    <div>
      <label>
        Date
        <input type="date" value={date} min={today()} onChange={(e) => onChangeDate(e.target.value)} />
      </label>

      {!staffLoading && !staffError && staffList.length > 1 && (
        <div style={{ marginTop: 12 }}>
          {!showStylistFilter ? (
            <button type="button" className="ghost-button" onClick={() => setShowStylistFilter(true)}>
              Prefer a specific stylist?
            </button>
          ) : (
            <div className="chip-row">
              <button
                type="button"
                className={`chip${selectedStylistId == null ? ' selected' : ''}`}
                onClick={() => setSelectedStylistId(null)}
              >
                Any stylist
              </button>
              {staffList.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  className={`chip${selectedStylistId === member.id ? ' selected' : ''}`}
                  onClick={() => setSelectedStylistId(member.id)}
                >
                  {member.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {conflictMessage && (
        <p className="error-text" style={{ marginTop: 12 }}>
          {conflictMessage}
        </p>
      )}
      {staffError && <InlineError message={staffError} onRetry={loadStaff} />}

      {loading && !staffError && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton height={44} />
          <Skeleton height={44} width="88%" />
          <Skeleton height={44} width="72%" />
        </div>
      )}

      {!loading && !staffError && staffList.length === 0 && (
        <p style={{ marginTop: 16 }}>No stylists currently offer this service.</p>
      )}

      {!loading && !staffError && staffList.length > 0 && visibleSlots.length === 0 && (
        <p style={{ marginTop: 16 }}>No available times on this date — try another day.</p>
      )}

      {!loading && !staffError && visibleSlots.length > 0 && (
        <TimeSlotPanel slots={visibleSlots} onSelectSlot={handlePickSlot} />
      )}
    </div>
  )
}
