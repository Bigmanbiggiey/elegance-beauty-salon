import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { username, loading } = useAuth()

  if (loading) return <p>Loading…</p>
  if (!username) return <Navigate to="/admin/login" replace />

  return <>{children}</>
}
