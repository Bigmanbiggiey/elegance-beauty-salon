import { apiFetch } from './client'
import type { Service } from '../types'

export function listServices(): Promise<Service[]> {
  return apiFetch<Service[]>('/services/')
}
