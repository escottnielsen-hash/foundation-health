import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function SuccessLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card className="overflow-hidden">
        {/* Green accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />

        <CardHeader className="flex flex-col items-center text-center">
          <Skeleton className="mb-2 h-16 w-16 rounded-full" />
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Payment details skeleton */}
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Superbill notice skeleton */}
          <Skeleton className="h-16 w-full rounded-lg" />

          {/* Action links skeleton */}
          <div className="space-y-2 pt-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
