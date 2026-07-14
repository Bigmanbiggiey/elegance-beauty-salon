import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: 'today', label: 'Today' },
  { to: 'calendar', label: 'Calendar' },
  { to: 'clients', label: 'Clients' },
  { to: 'products', label: 'Products' },
  { to: 'reports', label: 'Reports' },
  { to: 'settings', label: 'Settings' },
]

export function AdminLayout() {
  const { username } = useAuth()

  return (
    <div className="admin-shell">
      <nav className="admin-shell__rail">
        <span className="admin-shell__brand">Salon Admin</span>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `admin-shell__nav-link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="admin-shell__nav-link admin-shell__view-site"
        >
          View Site ↗
        </a>
        <div className="admin-shell__user">Logged in as {username}</div>
      </nav>
      <div className="admin-shell__content">
        <Outlet />
      </div>
    </div>
  )
}
