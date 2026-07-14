import { apiFetch } from './client'
import type { Staff } from '../types'

export function listStaff(serviceId: number): Promise<Staff[]> {
  return apiFetch<Staff[]>(`/staff/?service=${serviceId}`)
}
