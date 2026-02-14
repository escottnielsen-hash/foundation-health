import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function EncounterDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Back button skeleton */}
      <div className="mb-6">
        <div className="h-9 w-40 bg-gray-100 rounded" />
      </div>

      {/* Header skeleton */}
      <div className="mb-8">
        <div className="flex items-start gap-3 mb-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Tabs skeleton */}
      <div className="mb-6">
        <div className="inline-flex h-11 items-center rounded-lg bg-gray-100 p-1 gap-1 w-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 flex-1 rounded-md" />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
