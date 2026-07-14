export interface Service {
  id: number
  name: string
  category: string
  duration_minutes: number
  price: string
}

export interface Staff {
  id: number
  display_name: string
  bio: string
}

export interface Client {
  id: number
  name: string
  phone: string
  email: string
}

export type AppointmentStatus = 'booked' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

export interface Appointment {
  id: number
  client: Client
  staff: Staff
  service: Service
  start_at: string
  end_at: string
  status: AppointmentStatus
  notes: string
  cancellation_reason: string
}

export interface Product {
  id: number
  name: string
  description: string
  category: string
  price: string
  image: string | null
  is_active: boolean
}

export interface GuestDetails {
  name: string
  phone: string
  email: string
}

export interface ClientListItem {
  id: number
  name: string
  phone: string
  email: string
  appointment_count: number
  last_visit: string | null
}

export interface ClientDetail extends ClientListItem {
  notes: string
  appointments: Appointment[]
}

export interface ReportRow {
  count: number
  revenue: string
}

export interface ReportServiceRow extends ReportRow {
  service_id: number
  name: string
}

export interface ReportStaffRow extends ReportRow {
  staff_id: number
  display_name: string
}

export type ReportRange = 'today' | '7d' | '30d'

export interface ReportSummary {
  range: ReportRange
  date_from: string
  date_to: string
  total_revenue: string
  total_appointments: number
  cancelled_count: number
  no_show_count: number
  cancellation_rate: number
  no_show_rate: number
  top_services: ReportServiceRow[]
  top_staff: ReportStaffRow[]
}
