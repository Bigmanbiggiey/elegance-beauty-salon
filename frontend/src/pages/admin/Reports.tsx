import { useEffect, useState } from 'react'
import { getReportSummary } from '../../api/reports'
import type { ReportRange, ReportSummary } from '../../types'

const RANGES: { value: ReportRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
]

export function Reports() {
  const [range, setRange] = useState<ReportRange>('today')
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getReportSummary(range)
      .then((result) => {
        if (!cancelled) setSummary(result)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load report.')
      })
    return () => {
      cancelled = true
    }
  }, [range])

  return (
    <div>
      <h1>Reports</h1>
      <div className="range-toggle">
        {RANGES.map((r) => (
          <button
            key={r.value}
            type="button"
            className={`range-toggle__button${range === r.value ? ' active' : ''}`}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}
      {!summary && !error && <p>Loading…</p>}

      {summary && (
        <>
          <div className="stat-row">
            <div className="stat-tile">
              <span className="stat-tile__value">${summary.total_revenue}</span>
              <span className="stat-tile__label">Revenue</span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile__value">{summary.total_appointments}</span>
              <span className="stat-tile__label">Appointments</span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile__value">{(summary.cancellation_rate * 100).toFixed(0)}%</span>
              <span className="stat-tile__label">Cancellation rate</span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile__value">{(summary.no_show_rate * 100).toFixed(0)}%</span>
              <span className="stat-tile__label">No-show rate</span>
            </div>
          </div>

          <h2>Top services</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Bookings</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {summary.top_services.map((row) => (
                <tr key={row.service_id}>
                  <td>{row.name}</td>
                  <td>{row.count}</td>
                  <td>${row.revenue}</td>
                </tr>
              ))}
              {summary.top_services.length === 0 && (
                <tr>
                  <td colSpan={3}>No data for this range.</td>
                </tr>
              )}
            </tbody>
          </table>

          <h2 style={{ marginTop: 24 }}>Top staff</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Stylist</th>
                <th>Bookings</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {summary.top_staff.map((row) => (
                <tr key={row.staff_id}>
                  <td>{row.display_name}</td>
                  <td>{row.count}</td>
                  <td>${row.revenue}</td>
                </tr>
              ))}
              {summary.top_staff.length === 0 && (
                <tr>
                  <td colSpan={3}>No data for this range.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
