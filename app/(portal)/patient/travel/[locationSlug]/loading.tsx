import { Skeleton } from '@/components/ui/skeleton'

export default function LocationGuideLoading() {
  return (
    <div className="space-y-8">
      {/* Back button skeleton */}
      <Skeleton className="h-8 w-48" />

      {/* Hero skeleton */}
      <div className="rounded-2xl bg-gray-100 p-8 md:p-10">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-9 w-64" />
        <Skeleton className="mt-2 h-5 w-48" />
        <Skeleton className="mt-4 h-5 w-full max-w-lg" />
        <Skeleton className="mt-2 h-5 w-96" />
        <div className="mt-6 flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-6 w-48 rounded-full" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-11 w-full max-w-lg rounded-lg" />

      {/* Tab content skeleton */}
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-4 w-64" />
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-4 rounded-lg bg-gray-50 p-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
