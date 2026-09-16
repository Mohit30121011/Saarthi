// Tiranga Civic Modern Skeleton Loaders
// Provides responsive, realistic skeleton screens with smooth gradient shimmers

export function SchemeCardSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="relative flex flex-col justify-between rounded-xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden"
        >
          {/* Top Micro Strip */}
          <div className="h-1 w-full skeleton-box" />

          <div className="p-6 space-y-4">
            {/* Meta Tags */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-28 rounded-md skeleton-box" />
                <div className="h-4 w-16 rounded skeleton-box" />
              </div>
              <div className="h-6 w-24 rounded-full skeleton-box" />
            </div>

            {/* Scheme Title */}
            <div className="space-y-2">
              <div className="h-5 w-3/4 rounded skeleton-box" />
              <div className="h-4 w-1/2 rounded skeleton-box" />
              <div className="h-3 w-40 rounded skeleton-box" />
            </div>

            {/* Value Metric Banner */}
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full skeleton-box shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-5 w-28 rounded skeleton-box" />
                  <div className="h-3 w-48 rounded skeleton-box" />
                </div>
              </div>
            </div>

            {/* Why You Qualify Reason Box */}
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#DEE8FF] space-y-2">
              <div className="h-4 w-28 rounded skeleton-box" />
              <div className="h-3 w-full rounded skeleton-box" />
              <div className="h-3 w-4/5 rounded skeleton-box" />
            </div>

            {/* Deadline status pill */}
            <div className="h-8 w-full rounded-lg skeleton-box" />

            {/* Docs line */}
            <div className="h-4 w-3/5 rounded skeleton-box" />
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-3">
            <div className="h-8 w-8 rounded-lg skeleton-box" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 rounded-lg skeleton-box" />
              <div className="h-8 w-28 rounded-lg skeleton-box" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-64 rounded skeleton-box" />
        <div className="h-7 w-56 rounded-lg skeleton-box" />
      </div>

      {/* Top Citizen Hero Banner Skeleton */}
      <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 lg:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="h-5 w-36 rounded skeleton-box" />
              <div className="h-5 w-44 rounded skeleton-box" />
            </div>
            <div className="h-8 w-72 rounded-lg skeleton-box" />
            <div className="h-4 w-full rounded skeleton-box" />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-44 rounded-xl skeleton-box" />
            <div className="h-10 w-36 rounded-xl skeleton-box" />
          </div>
        </div>

        {/* 4 Bento Stat Tiles Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-[#F0F3FF] border border-[#DEE8FF] space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded skeleton-box" />
                <div className="w-8 h-8 rounded-lg skeleton-box" />
              </div>
              <div className="h-8 w-28 rounded skeleton-box" />
              <div className="h-4 w-40 rounded skeleton-box" />
            </div>
          ))}
        </div>
      </div>

      {/* Profile Diagnostic Bar Skeleton */}
      <div className="h-16 w-full rounded-xl bg-[#FFF3EB] skeleton-box" />

      {/* Category Pills Skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-48 rounded skeleton-box" />
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-32 rounded-full skeleton-box shrink-0" />
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <SchemeCardSkeleton count={6} />
    </div>
  )
}

export function ChecklistSkeleton() {
  return (
    <div className="flex flex-col w-full -mt-6 animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="w-full bg-[#0D2240] text-white py-8 shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6">
          <div className="h-4 w-56 rounded bg-white/20" />
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="h-5 w-36 rounded-full bg-white/20" />
              <div className="h-9 w-80 rounded-lg bg-white/20" />
              <div className="h-4 w-full rounded bg-white/10" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-40 rounded-lg bg-white/20" />
              <div className="h-11 w-44 rounded-lg bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-6">
        {/* Controls Bar */}
        <div className="h-14 w-full rounded-xl bg-white border border-[#E2E8F0] skeleton-box" />

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-20 w-full rounded-xl skeleton-box" />
            {[1, 2, 3].map((cat) => (
              <div key={cat} className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="h-5 w-40 rounded skeleton-box" />
                  <div className="h-5 w-20 rounded-full skeleton-box" />
                </div>
                {[1, 2].map((item) => (
                  <div key={item} className="p-4 rounded-xl border border-[#E2E8F0] space-y-3 bg-[#F8FAFC]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded skeleton-box" />
                        <div className="h-5 w-48 rounded skeleton-box" />
                      </div>
                      <div className="h-6 w-24 rounded-full skeleton-box" />
                    </div>
                    <div className="h-3 w-3/4 rounded skeleton-box" />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="h-64 rounded-xl bg-white border border-[#E2E8F0] p-6 skeleton-box" />
            <div className="h-48 rounded-xl bg-white border border-[#E2E8F0] p-6 skeleton-box" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function BookmarksSkeleton() {
  return (
    <div className="flex flex-col w-full -mt-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="w-full bg-[#0D2240] text-white py-10 shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="h-5 w-44 rounded-full bg-white/20" />
              <div className="h-5 w-28 rounded bg-white/20" />
            </div>
            <div className="h-9 w-72 rounded-lg bg-white/20" />
          </div>
          <div className="h-10 w-48 rounded-xl bg-white/20" />
        </div>
      </div>

      {/* Body Skeleton */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-6">
        <div className="h-14 w-full rounded-xl bg-white border border-[#E2E8F0] skeleton-box" />
        <SchemeCardSkeleton count={6} />
      </div>
    </div>
  )
}

export function SchemeDetailSkeleton() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pb-16 space-y-6 pt-4 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-72 rounded skeleton-box" />

      {/* Hero Banner Skeleton */}
      <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 lg:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <div className="h-6 w-32 rounded-md skeleton-box" />
              <div className="h-6 w-24 rounded-md skeleton-box" />
              <div className="h-6 w-36 rounded-full skeleton-box" />
            </div>
            <div className="h-8 w-3/4 rounded-lg skeleton-box" />
            <div className="h-4 w-full rounded skeleton-box" />
            <div className="h-4 w-4/5 rounded skeleton-box" />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-11 w-40 rounded-xl skeleton-box" />
            <div className="h-11 w-32 rounded-xl skeleton-box" />
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-[#F0F3FF] border border-[#DEE8FF] space-y-2">
              <div className="h-4 w-28 rounded skeleton-box" />
              <div className="h-7 w-36 rounded skeleton-box" />
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-64 rounded-2xl bg-white border border-[#E2E8F0] p-6 skeleton-box" />
          <div className="h-48 rounded-2xl bg-white border border-[#E2E8F0] p-6 skeleton-box" />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="h-56 rounded-2xl bg-white border border-[#E2E8F0] p-6 skeleton-box" />
          <div className="h-44 rounded-2xl bg-white border border-[#E2E8F0] p-6 skeleton-box" />
        </div>
      </div>
    </div>
  )
}

export function NotificationSkeleton() {
  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-8 animate-pulse">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="space-y-2 max-w-xl">
          <div className="h-5 w-44 rounded-full skeleton-box" />
          <div className="h-9 w-80 rounded-lg skeleton-box" />
          <div className="h-4 w-full rounded skeleton-box" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-32 rounded-lg skeleton-box" />
          <div className="h-9 w-32 rounded-lg skeleton-box" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-28 rounded-lg skeleton-box shrink-0" />
        ))}
      </div>

      {/* Notification Rows */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-full skeleton-box shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-24 rounded skeleton-box" />
                  <div className="h-4 w-32 rounded skeleton-box" />
                </div>
                <div className="h-5 w-3/4 rounded skeleton-box" />
                <div className="h-4 w-full rounded skeleton-box" />
              </div>
            </div>
            <div className="h-9 w-36 rounded-lg skeleton-box shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg skeleton-box" />
        <div className="h-4 w-64 rounded skeleton-box" />
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-28 rounded skeleton-box" />
              <div className="h-12 w-full rounded-xl skeleton-box" />
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
          <div className="h-11 w-36 rounded-xl skeleton-box" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 6, cols = 6 }) {
  return (
    <tbody className="divide-y divide-slate-border">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="px-5 py-4">
              <div
                className="h-4 rounded skeleton-box"
                style={{ width: cIdx === 0 ? '80%' : cIdx === cols - 1 ? '40%' : '60%' }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
