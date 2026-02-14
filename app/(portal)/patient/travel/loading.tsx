import { Skeleton } from '@/components/ui/skeleton'

export default function TravelPlanningLoading() {
  return (
    <div className="space-y-10">
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-gray-100 p-8 md:p-12">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-3 h-10 w-80" />
        <Skeleton className="mt-4 h-5 w-full max-w-xl" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      {/* Quick links skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-52" />
            </div>
          </div>
        ))}
      </div>

      {/* Section heading skeleton */}
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>

      {/* Location cards skeleton */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <Skeleton className="h-11 w-11 rounded-lg" />
            <Skeleton className="mt-4 h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-3/4" />
            <Skeleton className="mt-4 h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
