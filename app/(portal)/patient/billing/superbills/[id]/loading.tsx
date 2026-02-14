import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function SuperbillDetailLoading() {
  return (
    <div>
      {/* Back navigation skeleton */}
      <div className="mb-6">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      {/* Main card skeleton */}
      <Card className="mb-8 border-gray-200 shadow-sm">
        <CardContent className="p-8">
          {/* Practice header skeleton */}
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-3 w-16 ml-auto" />
              <Skeleton className="h-4 w-32 ml-auto" />
              <Skeleton className="h-4 w-28 ml-auto" />
            </div>
          </div>

          <Separator className="my-4" />

          {/* Two-column info skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50 space-y-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50 space-y-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>

          {/* Service details skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-3 bg-gray-50/50 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>

          <Separator />

          {/* Diagnosis codes skeleton */}
          <div className="py-4 space-y-3">
            <Skeleton className="h-4 w-40" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50/80">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>

          <Separator />

          {/* Procedure codes skeleton */}
          <div className="py-4 space-y-3">
            <Skeleton className="h-4 w-36" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2.5">
                <div className="col-span-2"><Skeleton className="h-4 w-full" /></div>
                <div className="col-span-1"><Skeleton className="h-4 w-full" /></div>
                <div className="col-span-6"><Skeleton className="h-4 w-3/4" /></div>
                <div className="col-span-3"><Skeleton className="h-4 w-16 ml-auto" /></div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Total charges skeleton */}
          <div className="flex items-center justify-between py-5">
            <div className="space-y-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Action buttons skeleton */}
      <div className="flex items-center gap-3 mb-10">
        <Skeleton className="h-11 w-52 rounded-lg" />
        <Skeleton className="h-11 w-44 rounded-lg" />
      </div>
    </div>
  )
}
