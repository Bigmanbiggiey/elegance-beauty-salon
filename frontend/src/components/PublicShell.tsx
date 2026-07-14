import { Outlet } from 'react-router-dom'
import { PublicHeader } from './PublicHeader'

export function PublicShell() {
  return (
    <div className="public-shell">
      <PublicHeader />
      <Outlet />
    </div>
  )
}
