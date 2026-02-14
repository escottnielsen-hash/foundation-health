import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back link skeleton */}
      <Skeleton className="h-4 w-28" />

      {/* Page header skeleton */}
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      {/* Order Summary Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-1 h-4 w-40" />
              </div>
            </div>
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Practice name skeleton */}
          <Skeleton className="h-4 w-44" />

          {/* Line items skeleton */}
          <div className="rounded-lg border border-gray-100 bg-gray-50/50">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <Skeleton className="h-3 w-full" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-gray-50 px-4 py-3 last:border-b-0"
              >
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          {/* Totals skeleton */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="my-2 h-px w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-7 w-28" />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </CardFooter>
      </Card>

      {/* Price transparency skeleton */}
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  )
}
