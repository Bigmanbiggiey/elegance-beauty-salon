import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getClient, updateClientNotes } from '../../api/clients'
import type { ClientDetail as ClientDetailType } from '../../types'

export function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const [client, setClient] = useState<ClientDetailType | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getClient(Number(id))
      .then((c) => {
        if (cancelled) return
        setClient(c)
        setNotes(c.notes)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load client.')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const handleSaveNotes = async () => {
    if (!client) return
    setSaving(true)
    setError(null)
    try {
      const updated = await updateClientNotes(client.id, notes)
      setClient(updated)
    } catch {
      setError('Could not save notes.')
    } finally {
      setSaving(false)
    }
  }

  if (error) return <p className="error-text">{error}</p>
  if (!client) return <p>Loading…</p>

  return (
    <div>
      <h1>{client.name}</h1>
      <p className="meta">
        {client.phone}
        {client.email && ` · ${client.email}`}
      </p>

      <div style={{ marginTop: 20 }}>
        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
        </label>
        <button type="button" className="primary-button" onClick={handleSaveNotes} disabled={saving}>
          {saving ? 'Saving…' : 'Save notes'}
        </button>
      </div>

      <h2 style={{ marginTop: 32 }}>Appointment history</h2>
      {client.appointments.length === 0 && <p>No appointments yet.</p>}
      {client.appointments.map((appt) => (
        <div key={appt.id} className={`appointment-card status-${appt.status}`} style={{ cursor: 'default' }}>
          <div>{new Date(appt.start_at).toLocaleString()}</div>
          <div>
            {appt.service.name} with {appt.staff.display_name}
          </div>
          <div className="meta">{appt.status}</div>
        </div>
      ))}
    </div>
  )
}
