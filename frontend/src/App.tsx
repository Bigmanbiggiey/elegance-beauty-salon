import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { PublicShell } from './components/PublicShell'
import { RequireAuth } from './components/RequireAuth'
import { AuthProvider } from './context/AuthContext'
import { AdminLayout } from './pages/admin/AdminLayout'
import { Calendar } from './pages/admin/Calendar'
import { ClientDetail } from './pages/admin/ClientDetail'
import { Clients } from './pages/admin/Clients'
import { Login } from './pages/admin/Login'
import { Products } from './pages/admin/Products'
import { Reports } from './pages/admin/Reports'
import { Settings } from './pages/admin/Settings'
import { Today } from './pages/admin/Today'
import { Landing } from './pages/Landing'
import { Services } from './pages/Services'
import { Shop } from './pages/Shop'
import { BookingPage } from './pages/booking/BookingPage'
import { Confirmation } from './pages/booking/Confirmation'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicShell />}>
          <Route path="/" element={<Landing />} />
          <Route path="/services" element={<Services />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/book/confirmation" element={<Confirmation />} />
          <Route path="/admin/login" element={<Login />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="today" replace />} />
          <Route path="today" element={<Today />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
