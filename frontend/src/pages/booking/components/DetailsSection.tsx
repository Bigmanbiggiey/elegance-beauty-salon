import type { FormEvent } from 'react'
import type { GuestDetails } from '../../../types'

export function DetailsSection({
  guest,
  notes,
  onChangeGuest,
  onChangeNotes,
  onReview,
}: {
  guest: GuestDetails
  notes: string
  onChangeGuest: (guest: GuestDetails) => void
  onChangeNotes: (notes: string) => void
  onReview: () => void
}) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onReview()
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name
        <input required value={guest.name} onChange={(e) => onChangeGuest({ ...guest, name: e.target.value })} />
      </label>
      <label>
        Phone
        <input required value={guest.phone} onChange={(e) => onChangeGuest({ ...guest, phone: e.target.value })} />
      </label>
      <label>
        Email (optional)
        <input
          type="email"
          value={guest.email}
          onChange={(e) => onChangeGuest({ ...guest, email: e.target.value })}
        />
      </label>
      <label>
        Notes (optional)
        <textarea value={notes} onChange={(e) => onChangeNotes(e.target.value)} />
      </label>
      <button type="submit">Review &amp; confirm</button>
    </form>
  )
}
