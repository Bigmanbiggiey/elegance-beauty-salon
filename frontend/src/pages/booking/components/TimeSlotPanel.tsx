interface HourGroup {
  hourLabel: string
  slots: string[]
}

function groupByHour(slots: string[]): HourGroup[] {
  const groups = new Map<string, string[]>()
  for (const slot of slots) {
    const hourLabel = new Date(slot).toLocaleTimeString([], { hour: 'numeric', hour12: true })
    if (!groups.has(hourLabel)) groups.set(hourLabel, [])
    groups.get(hourLabel)!.push(slot)
  }
  return [...groups.entries()].map(([hourLabel, hourSlots]) => ({ hourLabel, slots: hourSlots }))
}

export function TimeSlotPanel({
  slots,
  onSelectSlot,
}: {
  slots: string[]
  onSelectSlot: (slot: string) => void
}) {
  const groups = groupByHour(slots)

  if (groups.length === 0) return null

  return (
    <div className="time-panel">
      {groups.map((group) => (
        <div key={group.hourLabel} className="time-panel__row">
          <span className="time-panel__hour">{group.hourLabel}</span>
          <div className="time-panel__times">
            {group.slots.map((slot) => (
              <button key={slot} type="button" className="slot-button" onClick={() => onSelectSlot(slot)}>
                {new Date(slot).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
