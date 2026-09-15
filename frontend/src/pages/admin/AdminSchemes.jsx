import { useEffect, useMemo, useState } from 'react'
import { listSchemes } from '../../api/admin'
import SchemeDrawer from '../../components/admin/SchemeDrawer'

function statusOf(scheme) {
  if (!scheme.isActive) return { label: 'Inactive', dot: 'bg-saarthi-muted' }
  if (!scheme.verifiedAt) return { label: 'Needs Verification', dot: 'bg-saarthi-saffron' }
  const staleDays = (Date.now() - new Date(scheme.verifiedAt).getTime()) / 86400000
  if (staleDays > 180) return { label: 'Needs Verification', dot: 'bg-saarthi-saffron' }
  return { label: 'Active', dot: 'bg-saarthi-green' }
}

export default function AdminSchemes() {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [drawer, setDrawer] = useState(null) // null closed | 'new' | schemeId

  function reload() {
    setLoading(true)
    return listSchemes()
      .then((data) => setSchemes(data))
      .catch(() => setError('Failed to load schemes.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return schemes
    return schemes.filter(
      (s) => s.name?.toLowerCase().includes(q) || s.ministry?.toLowerCase().includes(q) || s.state?.toLowerCase().includes(q)
    )
  }, [schemes, query])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-fraunces text-2xl text-saarthi-ink">Schemes</h1>
        <button
          onClick={() => setDrawer('new')}
          className="px-3.5 py-2 rounded-lg bg-saarthi-green text-white text-sm font-medium hover:bg-saarthi-green-hover transition-colors"
        >
          + Add Scheme
        </button>
      </div>

      <div className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, ministry, or state"
          className="w-full max-w-sm px-3 py-2 text-sm rounded-lg border border-saarthi-border saarthi-input-focus bg-white"
        />
      </div>

      <div className="bg-white border border-saarthi-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-saarthi-border text-left text-xs uppercase tracking-wide text-saarthi-muted">
              <th scope="col" className="px-4 py-2.5 font-medium">Scheme Name</th>
              <th scope="col" className="px-4 py-2.5 font-medium">State</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Last Verified</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-saarthi-border last:border-0" style={{ height: 44 }}>
                  <td className="px-4" colSpan={4}>
                    <div className="h-3 w-2/3 bg-saarthi-border rounded animate-pulse" />
                  </td>
                </tr>
              ))}

            {!loading && error && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-saarthi-error text-sm">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-saarthi-muted text-sm">
                  No schemes found.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              filtered.map((s) => {
                const status = statusOf(s)
                return (
                  <tr
                    key={s.schemeId}
                    onClick={() => setDrawer(s.schemeId)}
                    className="border-b border-saarthi-border last:border-0 hover:bg-saarthi-bg cursor-pointer"
                    style={{ height: 44 }}
                  >
                    <td className="px-4 text-saarthi-ink font-medium">{s.name}</td>
                    <td className="px-4 text-saarthi-body">{s.state || 'Central'}</td>
                    <td className="px-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        <span className="text-saarthi-body">{status.label}</span>
                      </span>
                    </td>
                    <td className="px-4 text-saarthi-muted">{s.verifiedAt || '—'}</td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {drawer != null && (
        <SchemeDrawer
          schemeId={drawer === 'new' ? null : drawer}
          onClose={() => setDrawer(null)}
          onSaved={reload}
        />
      )}
    </div>
  )
}
