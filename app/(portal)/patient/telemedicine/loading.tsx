import { Card, CardContent } from '@/components/ui/card'

export default function TelemedicineLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-9 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-5 w-80 bg-gray-100 rounded" />
        </div>
        <div className="h-11 w-40 bg-gray-200 rounded-lg" />
      </div>

      {/* Filter bar skeleton */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-12 bg-gray-100 rounded" />
            <div className="h-11 w-48 bg-gray-200 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-14 bg-gray-100 rounded" />
            <div className="h-11 w-44 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="h-5 w-32 bg-gray-100 rounded" />
      </div>

      {/* Section title skeleton */}
      <div className="h-6 w-40 bg-gray-200 rounded mb-3" />

      {/* Session cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-28 bg-gray-200 rounded-full" />
                    <div className="h-5 w-20 bg-gray-100 rounded-full" />
                  </div>
                  <div className="h-4 w-64 bg-gray-100 rounded mb-2" />
                  <div className="flex items-center gap-4">
                    <div className="h-3 w-36 bg-gray-100 rounded" />
                    <div className="h-3 w-28 bg-gray-100 rounded" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="w-5 h-5 bg-gray-100 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
