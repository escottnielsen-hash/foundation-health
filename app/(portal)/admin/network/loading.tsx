export default function NetworkOverviewLoading() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Page header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-56 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-80 rounded bg-gray-100" />
        </div>
        <div className="h-10 w-40 rounded-lg bg-gray-200" />
      </div>

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

      {/* Hub-Spoke Diagram skeleton */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-6">
        <div className="mb-6">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="mt-1 h-4 w-56 rounded bg-gray-100" />
        </div>
        <div className="flex items-center justify-center py-16">
          {/* Central hub skeleton */}
          <div className="relative">
            <div className="h-36 w-52 rounded-2xl border-2 border-gray-200 bg-white" />
            {/* Spoke skeletons radiating out */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2">
              <div className="h-28 w-44 rounded-2xl border border-gray-200 bg-white" />
            </div>
            <div className="absolute -bottom-32 -left-40">
              <div className="h-28 w-44 rounded-2xl border border-gray-200 bg-white" />
            </div>
            <div className="absolute -bottom-32 -right-40">
              <div className="h-28 w-44 rounded-2xl border border-gray-200 bg-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Location cards skeleton */}
      <div>
        <div className="mb-4 h-6 w-32 rounded bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 border-l-4 border-l-gray-300 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-5 w-32 rounded bg-gray-200" />
                  <div className="mt-1 h-3 w-20 rounded bg-gray-100" />
                </div>
                <div className="h-5 w-12 rounded-full bg-gray-200" />
              </div>
              <div className="mt-3 flex gap-4">
                <div className="h-4 w-20 rounded bg-gray-100" />
                <div className="h-4 w-24 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
