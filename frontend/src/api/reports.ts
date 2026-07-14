import { apiFetch } from './client'
import type { ReportRange, ReportSummary } from '../types'

export function getReportSummary(range: ReportRange): Promise<ReportSummary> {
  return apiFetch<ReportSummary>(`/admin/reports/summary/?range=${range}`)
}
