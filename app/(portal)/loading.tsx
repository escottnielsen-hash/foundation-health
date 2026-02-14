export default function PortalLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Page header skeleton */}
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-80 bg-gray-100 rounded" />
      </div>

      {/* Content area skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
