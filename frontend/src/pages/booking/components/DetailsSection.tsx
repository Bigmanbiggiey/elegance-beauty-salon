import { useState, type FormEvent } from 'react'
import { IconWhatsApp } from '../../../components/icons'
import { whatsappHref } from '../../../config/business'
import type { GuestDetails } from '../../../types'

const PHONE_PATTERN = /^[0-9+()\-.\s]{7,20}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  name?: string
  phone?: string
  email?: string
}

function validate(guest: GuestDetails): FieldErrors {
  const errors: FieldErrors = {}
  if (!guest.name.trim()) errors.name = 'Please enter your name.'
  if (!guest.phone.trim()) errors.phone = "Please enter a phone number so we can reach you."
  else if (!PHONE_PATTERN.test(guest.phone.trim())) errors.phone = "That phone number doesn't look right."
  if (guest.email.trim() && !EMAIL_PATTERN.test(guest.email.trim())) errors.email = "That email doesn't look right."
  return errors
}

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
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const errors = validate(guest)
  const isValid = Object.keys(errors).length === 0

  function markTouched(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, phone: true, email: true })
    if (isValid) onReview()
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={`field${touched.name && errors.name ? ' field--invalid' : ''}`}>
        <label>
          Name
          <input
            value={guest.name}
            onChange={(e) => onChangeGuest({ ...guest, name: e.target.value })}
            onBlur={() => markTouched('name')}
          />
        </label>
        {touched.name && errors.name && <span className="field__error">{errors.name}</span>}
      </div>

      <div className={`field${touched.phone && errors.phone ? ' field--invalid' : ''}`}>
        <label>
          Phone
          <input
            value={guest.phone}
            onChange={(e) => onChangeGuest({ ...guest, phone: e.target.value })}
            onBlur={() => markTouched('phone')}
          />
        </label>
        {touched.phone && errors.phone && <span className="field__error">{errors.phone}</span>}
      </div>

      <div className={`field${touched.email && errors.email ? ' field--invalid' : ''}`}>
        <label>
          Email (optional)
          <input
            type="email"
            value={guest.email}
            onChange={(e) => onChangeGuest({ ...guest, email: e.target.value })}
            onBlur={() => markTouched('email')}
          />
        </label>
        {touched.email && errors.email && <span className="field__error">{errors.email}</span>}
      </div>

      <div className="field">
        <label>
          Notes (optional)
          <textarea value={notes} onChange={(e) => onChangeNotes(e.target.value)} rows={3} />
        </label>
      </div>

      <button type="submit">Review &amp; confirm</button>

      <a
        href={whatsappHref("Hi! I'd like to book an appointment but have a quick question first.")}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-inline-link"
      >
        <IconWhatsApp size={16} /> Prefer WhatsApp? Message us instead
      </a>
    </form>
  )
}
