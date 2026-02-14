export default function NetworkStatsLoading() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Page header skeleton */}
      <div>
        <div className="h-4 w-20 rounded bg-gray-200" />
        <div className="mt-2 h-8 w-48 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-72 rounded bg-gray-100" />
      </div>

      {/* Date range filter skeleton */}
      <div className="h-10 w-96 rounded-lg bg-gray-200" />

      {/* Summary stats skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gray-200" />
              <div>
                <div className="h-7 w-16 rounded bg-gray-200" />
                <div className="mt-1 h-4 w-24 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts grid skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 h-5 w-40 rounded bg-gray-200" />
            <div className="h-72 rounded-lg bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Full-width chart skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 h-5 w-48 rounded bg-gray-200" />
        <div className="h-72 rounded-lg bg-gray-100" />
      </div>

      {/* Provider utilization skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 h-5 w-44 rounded bg-gray-200" />
        <div className="h-72 rounded-lg bg-gray-100" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
