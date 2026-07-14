const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    const detail =
      typeof body === 'object' && body !== null && 'detail' in body
        ? String((body as { detail: unknown }).detail)
        : `Request failed with status ${status}`
    super(detail)
    this.status = status
    this.body = body
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  const headers = new Headers(options.headers)
  // Skip Content-Type for FormData bodies (image uploads) — the browser sets
  // the correct multipart boundary itself; overriding it here would break parsing.
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (UNSAFE_METHODS.has(method)) {
    const csrfToken = getCookie('csrftoken')
    if (csrfToken) headers.set('X-CSRFToken', csrfToken)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'same-origin',
  })

  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(response.status, body)
  }

  return body as T
}
