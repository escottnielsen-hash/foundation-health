import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>

      {/* Quick Stats Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-7 w-24" />
              <Skeleton className="mt-2 h-3 w-32" />
              <Skeleton className="mt-2 h-4 w-20" />
            </CardContent>
            <div className="absolute right-0 top-0 h-1 w-full">
              <Skeleton className="h-full w-full" />
            </div>
          </Card>
        ))}
      </div>

      {/* Two Column Layout Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments Skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="mt-1 h-4 w-36" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3"
                >
                  <Skeleton className="h-10 w-10 flex-shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="mt-1 h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3"
                >
                  <Skeleton className="h-10 w-10 flex-shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-1 h-4 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4"
              >
                <Skeleton className="h-11 w-11 rounded-lg" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
