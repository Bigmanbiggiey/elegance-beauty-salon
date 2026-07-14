import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listClients } from '../../api/clients'
import type { ClientListItem } from '../../types'

export function Clients() {
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<ClientListItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const handle = setTimeout(() => {
      listClients(search || undefined)
        .then((result) => {
          if (!cancelled) setClients(result)
        })
        .catch(() => {
          if (!cancelled) setError('Could not load clients.')
        })
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [search])

  return (
    <div>
      <h1>Clients</h1>
      <label>
        Search
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or phone" />
      </label>
      {error && <p className="error-text">{error}</p>}
      <div style={{ marginTop: 20 }}>
        {clients.map((client) => (
          <Link key={client.id} to={`/admin/clients/${client.id}`} className="client-row">
            <div>
              <div>{client.name}</div>
              <div className="meta">{client.phone}</div>
            </div>
            <div className="meta">
              {client.appointment_count} visit{client.appointment_count === 1 ? '' : 's'}
              {client.last_visit && <> · last {new Date(client.last_visit).toLocaleDateString()}</>}
            </div>
          </Link>
        ))}
        {clients.length === 0 && !error && <p>No clients found.</p>}
      </div>
    </div>
  )
}
