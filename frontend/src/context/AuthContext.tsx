import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '../api/auth'

interface AuthState {
  username: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then((res) => setUsername(res.username))
      .catch(() => setUsername(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (u: string, p: string) => {
    const res = await apiLogin(u, p)
    setUsername(res.username)
  }

  const logout = async () => {
    await apiLogout()
    setUsername(null)
  }

  return <AuthContext.Provider value={{ username, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
