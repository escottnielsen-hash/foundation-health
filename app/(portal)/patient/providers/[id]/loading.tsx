import { Skeleton } from '@/components/ui/skeleton'

export default function ProviderDetailLoading() {
  return (
    <div className="space-y-8">
      {/* Back navigation skeleton */}
      <Skeleton className="h-5 w-36" />

      {/* Hero section skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse" />
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-10">
            <Skeleton className="h-20 w-20 rounded-full border-4 border-white" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-32 rounded-full" />
                <Skeleton className="h-5 w-40 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-11 w-40 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-20 rounded-lg" />
          <Skeleton className="h-11 w-28 rounded-lg" />
          <Skeleton className="h-11 w-24 rounded-lg" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Bio card skeleton */}
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <Skeleton className="h-6 w-28 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
