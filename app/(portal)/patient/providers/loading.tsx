import { Skeleton } from '@/components/ui/skeleton'

export default function ProvidersLoading() {
  return (
    <div className="space-y-8">
      {/* Page header skeleton */}
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      {/* Filter skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 w-56" />
          <Skeleton className="h-11 w-56" />
        </div>
      </div>

      {/* Results count skeleton */}
      <Skeleton className="h-5 w-32" />

      {/* Provider cards skeleton grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
                <div className="flex gap-1.5 pt-1">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
