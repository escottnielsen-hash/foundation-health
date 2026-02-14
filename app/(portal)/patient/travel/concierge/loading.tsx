import { Skeleton } from '@/components/ui/skeleton'

export default function ConciergeLoading() {
  return (
    <div className="space-y-8">
      {/* Back button skeleton */}
      <Skeleton className="h-8 w-48" />

      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-5 w-full max-w-xl" />
      <Skeleton className="h-5 w-96" />

      {/* Service highlights skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-1 h-4 w-48" />
          </div>
        ))}
      </div>

      {/* Form skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />

        <div className="mt-6 space-y-6">
          {/* Select fields */}
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          ))}

          {/* Textarea */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>

          {/* Special requirements */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>

          {/* Button */}
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
