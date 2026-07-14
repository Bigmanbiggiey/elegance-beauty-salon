import { apiFetch } from './client'

export function login(username: string, password: string): Promise<{ username: string }> {
  return apiFetch<{ username: string }>('/admin/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout(): Promise<void> {
  return apiFetch<void>('/admin/logout/', { method: 'POST' })
}

export function getCurrentUser(): Promise<{ username: string }> {
  return apiFetch<{ username: string }>('/admin/me/')
}
