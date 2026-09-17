import client from './client'

export async function submitSchemeReport(data) {
  const res = await client.post('/api/reports', data)
  return res.data
}

export async function listAdminSchemeReports(status = 'ALL') {
  const res = await client.get('/api/admin/reports', { params: { status } })
  return res.data
}

export async function updateAdminSchemeReportStatus(reportId, data) {
  const res = await client.post(`/api/admin/reports/${reportId}`, data)
  return res.data
}
