import { apiFetch } from './client'
import type { ClientDetail, ClientListItem } from '../types'

export function listClients(search?: string): Promise<ClientListItem[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiFetch<ClientListItem[]>(`/admin/clients/${params}`)
}

export function getClient(id: number): Promise<ClientDetail> {
  return apiFetch<ClientDetail>(`/admin/clients/${id}/`)
}

export function updateClientNotes(id: number, notes: string): Promise<ClientDetail> {
  return apiFetch<ClientDetail>(`/admin/clients/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  })
}
