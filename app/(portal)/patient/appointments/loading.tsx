import { Card, CardContent } from '@/components/ui/card'

export default function AppointmentsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="h-9 w-44 bg-gray-200 rounded mb-2" />
          <div className="h-5 w-72 bg-gray-100 rounded" />
        </div>
        <div className="h-11 w-40 bg-gray-200 rounded-lg" />
      </div>

      {/* Tabs skeleton */}
      <div className="mb-6">
        <div className="inline-flex h-11 items-center gap-1 rounded-lg bg-gray-100 p-1">
          <div className="h-8 w-28 bg-gray-200 rounded-md" />
          <div className="h-8 w-20 bg-white rounded-md" />
        </div>
      </div>

      {/* Appointment cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-5 w-48 bg-gray-200 rounded" />
                    <div className="h-5 w-20 bg-gray-100 rounded-full" />
                  </div>
                  <div className="h-4 w-60 bg-gray-100 rounded mb-2" />
                  <div className="flex items-center gap-4">
                    <div className="h-3 w-32 bg-gray-100 rounded" />
                    <div className="h-3 w-40 bg-gray-100 rounded" />
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
