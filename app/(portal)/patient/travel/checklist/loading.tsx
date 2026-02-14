import { Skeleton } from '@/components/ui/skeleton'

export default function ChecklistLoading() {
  return (
    <div className="space-y-8">
      {/* Back button skeleton */}
      <Skeleton className="h-8 w-48" />

      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div>
          <Skeleton className="h-9 w-56" />
          <Skeleton className="mt-1 h-4 w-72" />
        </div>
      </div>
      <Skeleton className="h-5 w-full max-w-xl" />

      {/* Progress card skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="mt-4 h-3 w-full rounded-full" />
      </div>

      {/* Category sections skeleton */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-44" />
              <Skeleton className="mt-1 h-3 w-56" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3 px-3 py-2.5">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
