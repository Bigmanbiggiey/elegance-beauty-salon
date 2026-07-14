import { apiFetch } from './client'
import type { Appointment, GuestDetails } from '../types'

export function getAvailability(staffId: number, serviceId: number, date: string): Promise<{ slots: string[] }> {
  return apiFetch<{ slots: string[] }>(`/availability/?staff=${staffId}&service=${serviceId}&date=${date}`)
}

export interface CreateAppointmentInput {
  service_id: number
  staff_id: number
  start_at: string
  notes?: string
  client: GuestDetails
}

export function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  return apiFetch<Appointment>('/appointments/', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function listAdminAppointments(date: string, staffId?: number): Promise<Appointment[]> {
  const params = new URLSearchParams({ date })
  if (staffId) params.set('staff', String(staffId))
  return apiFetch<Appointment[]>(`/admin/appointments/?${params.toString()}`)
}

export function updateAppointment(
  id: number,
  patch: Partial<{
    status: Appointment['status']
    staff_id: number
    start_at: string
    cancellation_reason: string
  }>,
): Promise<Appointment> {
  return apiFetch<Appointment>(`/admin/appointments/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}
