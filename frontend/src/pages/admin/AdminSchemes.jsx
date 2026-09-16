import { useEffect, useMemo, useState } from 'react'
import { listSchemes } from '../../api/admin'
import SchemeDrawer from '../../components/admin/SchemeDrawer'
import { TableSkeleton } from '../../components/Skeletons'

function statusOf(scheme) {
  if (!scheme.isActive) {
    return {
      label: 'Inactive',
      badge: 'bg-surface-container-high text-on-surface-variant',
      dot: 'bg-outline',
    }
  }
  if (!scheme.verifiedAt) {
    return {
      label: 'Needs Audit',
      badge: 'bg-kesari-saffron-soft text-kesari-saffron',
      dot: 'bg-kesari-saffron',
    }
  }
  const staleDays = (Date.now() - new Date(scheme.verifiedAt).getTime()) / 86400000
  if (staleDays > 180) {
    return {
      label: 'Stale (>180d)',
      badge: 'bg-partial-amber-soft text-partial-amber',
      dot: 'bg-partial-amber',
    }
  }
  return {
    label: 'Gazetted & Active',
    badge: 'bg-harita-green-soft text-harita-green',
    dot: 'bg-harita-green',
  }
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
      .catch(() => setError('Failed to load scheme registry.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return schemes
    return schemes.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.ministry?.toLowerCase().includes(q) ||
        s.state?.toLowerCase().includes(q)
    )
  }, [schemes, query])

  return (
    <div className="flex flex-col w-full -mt-6">
      {/* 1. ADMINISTRATIVE CHROME / GLOBAL SYSTEM SUB-HEADER (Module 9) */}
      <div className="w-full bg-chakra-blue text-on-primary py-4 shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-label-sm uppercase tracking-wider bg-kesari-saffron text-on-primary font-bold">
                Confidential
              </span>
              <span className="font-headline-sm text-headline-sm tracking-tight font-bold">
                SAARTHI Administrative Control Center
              </span>
              <span className="text-surface-variant">•</span>
              <span className="font-label-md text-label-md text-surface-variant font-semibold">
                Role: SYSTEM ADMIN
              </span>
            </div>
            {/* Breadcrumb & Architecture Reference */}
            <div className="flex items-center gap-2 text-surface-variant font-label-sm text-label-sm">
              <span className="hover:text-surface-container-lowest transition-colors cursor-pointer">
                Admin Console
              </span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="hover:text-surface-container-lowest transition-colors cursor-pointer">
                Welfare Scheme Registry
              </span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-surface-container-lowest font-semibold">
                Scheme Master &amp; Eligibility Rules
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY WORKSPACE CANVAS */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 flex flex-col gap-6">
        {/* Active Scheme Selector & Status Control Bar */}
        <div className="bg-slate-surface-elevated rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-slate-border">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-xl">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search scheme by title, authority or state jurisdiction…"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-chakra-blue border border-slate-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-harita-green-soft text-harita-green font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-harita-green" />
                {schemes.length} Registered Schemes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawer('new')}
              className="px-4 py-2 rounded-lg bg-kesari-saffron hover:bg-kesari-saffron-vibrant text-on-primary font-label-lg text-label-lg font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Create New Scheme</span>
            </button>
          </div>
        </div>

        {/* Schemes Table */}
        <div className="bg-slate-surface-elevated border border-slate-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead>
              <tr className="border-b border-slate-border bg-slate-surface text-on-surface-variant uppercase font-label-sm text-label-sm">
                <th scope="col" className="px-5 py-3.5 font-bold text-chakra-blue">Scheme Title &amp; Jurisdiction</th>
                <th scope="col" className="px-4 py-3.5 font-bold text-chakra-blue">Authority / Ministry</th>
                <th scope="col" className="px-4 py-3.5 font-bold text-chakra-blue">Level</th>
                <th scope="col" className="px-4 py-3.5 font-bold text-chakra-blue">Statutory Status</th>
                <th scope="col" className="px-4 py-3.5 font-bold text-chakra-blue">Gazette Audit</th>
                <th scope="col" className="px-4 py-3.5 text-right font-bold text-chakra-blue">Action</th>
              </tr>
            </thead>
            {loading ? (
              <TableSkeleton rows={8} cols={6} />
            ) : (
              <tbody className="divide-y divide-slate-border">
                {error && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-error font-body-sm">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">
                    No schemes matching "{query}" found in registry.
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
                      className="hover:bg-slate-surface transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4">
                        <div className="font-headline-sm font-bold text-chakra-blue group-hover:text-kesari-saffron transition-colors">
                          {s.name}
                        </div>
                        <div className="font-label-sm text-on-surface-variant text-[11px] mt-0.5">
                          ID: SCH-{s.schemeId} • Benefit: {s.benefitAmount || 'Direct Benefit Transfer'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-on-surface-variant font-label-md">
                        {s.ministry || 'Government of Maharashtra / Central'}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-chakra-blue-light text-chakra-blue font-semibold">
                          {s.state || 'Central'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${status.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-on-surface-variant font-label-sm">
                        {s.verifiedAt || 'Pending audit'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDrawer(s.schemeId)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-chakra-blue-light text-chakra-blue font-label-md text-label-md font-bold hover:bg-surface-container-high transition-colors"
                        >
                          Configure
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>

        {/* Drawer / Editor */}
        {drawer != null && (
          <SchemeDrawer
            schemeId={drawer === 'new' ? null : drawer}
            onClose={() => setDrawer(null)}
            onSaved={reload}
          />
        )}
      </div>
    </div>
  )
}
