import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function Settings() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div>
      <h1>Settings</h1>

      <h2>Account</h2>
      <p>Logged in as {username}</p>
      <button type="button" className="secondary-button" onClick={handleLogout} style={{ marginTop: 12 }}>
        Log out
      </button>

      <h2 style={{ marginTop: 32 }}>Catalog</h2>
      <p className="meta">Services, staff, and working hours are managed in Django admin.</p>
      <a className="secondary-button" href="/django-admin/" target="_blank" rel="noreferrer" style={{ marginTop: 12 }}>
        Open Django admin
      </a>
    </div>
  )
}
