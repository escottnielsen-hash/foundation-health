import { Skeleton } from '@/components/ui/skeleton'

export default function LocationDetailLoading() {
  return (
    <div className="space-y-8">
      {/* Back nav skeleton */}
      <Skeleton className="h-5 w-36" />

      {/* Hero skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Skeleton className="h-32 w-full rounded-none" />
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-8">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-11 w-44" />
            </div>
          </div>
          <Skeleton className="h-px w-full my-5" />
          <div className="flex gap-6">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-44 rounded-md" />
        </div>

        {/* Tab content skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}
