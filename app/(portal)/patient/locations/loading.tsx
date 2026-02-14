import { Skeleton } from '@/components/ui/skeleton'

export default function LocationsLoading() {
  return (
    <div className="space-y-8">
      {/* Page header skeleton */}
      <div>
        <Skeleton className="h-9 w-52" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      {/* Filter skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 flex-1" />
        </div>
      </div>

      {/* Results count skeleton */}
      <Skeleton className="h-5 w-32" />

      {/* Location cards skeleton grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
