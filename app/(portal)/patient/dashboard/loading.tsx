import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Row 1: Welcome Banner Skeleton */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 shadow-lg sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-56 bg-slate-700" />
              <Skeleton className="h-6 w-28 rounded-full bg-slate-700" />
            </div>
            <Skeleton className="h-4 w-72 bg-slate-700" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-36 rounded-lg bg-slate-700" />
            <Skeleton className="h-9 w-28 rounded-lg bg-slate-700" />
          </div>
        </div>
      </div>

      {/* Row 2: KPI Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="relative overflow-hidden border-0 shadow-md">
            <div className="absolute left-0 top-0 h-full w-1">
              <Skeleton className="h-full w-full rounded-none" />
            </div>
            <CardContent className="p-5 pl-4">
              <div className="mb-3 flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-7 w-20" />
              <Skeleton className="mt-2 h-3 w-28" />
              <Skeleton className="mt-2 h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 3: Appointments + Telemedicine Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments Skeleton */}
        <Card className="border-0 shadow-md">
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
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5"
                >
                  <Skeleton className="h-11 w-11 flex-shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Telemedicine Skeleton */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="mt-1 h-4 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5"
                >
                  <Skeleton className="h-11 w-11 flex-shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-44" />
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Claims + Financial Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Claims Skeleton */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="mt-1 h-4 w-44" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5"
                >
                  <Skeleton className="h-11 w-11 flex-shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Snapshot Skeleton */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="mt-1 h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                  {i < 2 && (
                    <div className="my-4">
                      <Skeleton className="h-px w-full" />
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Quick Actions Skeleton */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-1 h-4 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-4"
              >
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-1 text-center">
                  <Skeleton className="mx-auto h-3 w-20" />
                  <Skeleton className="mx-auto h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
