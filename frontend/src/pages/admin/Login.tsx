import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function Login() {
  const { username, login } = useAuth()
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  if (username) return <Navigate to="/admin" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(user, password)
      navigate('/admin')
    } catch {
      setError('Invalid username or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <h1>Staff login</h1>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input required value={user} onChange={(e) => setUser(e.target.value)} />
        </label>
        <label>
          Password
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  )
}
