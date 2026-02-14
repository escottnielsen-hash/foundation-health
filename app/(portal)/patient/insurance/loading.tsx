import { Card, CardContent } from '@/components/ui/card'

export default function InsuranceLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-44 bg-gray-200 rounded-lg" />
      </div>

      {/* Info banner skeleton */}
      <div className="mb-8">
        <Card className="border-blue-100 bg-blue-50/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-blue-100 rounded" />
                <div className="h-3 w-full bg-blue-100 rounded" />
                <div className="h-3 w-3/4 bg-blue-100 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100" />
              <div>
                <div className="h-7 w-8 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-10 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>

      {/* Card skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-64 bg-gray-200 rounded" />
                  <div className="h-3 w-40 bg-gray-200 rounded" />
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
