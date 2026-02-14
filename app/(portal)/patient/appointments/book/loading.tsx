import { Card, CardContent } from '@/components/ui/card'

export default function BookAppointmentLoading() {
  return (
    <div className="animate-pulse">
      {/* Back button skeleton */}
      <div className="mb-6">
        <div className="h-9 w-44 bg-gray-100 rounded-lg" />
      </div>

      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-9 w-56 bg-gray-200 rounded mb-2" />
        <div className="h-5 w-80 bg-gray-100 rounded" />
      </div>

      {/* Step indicator skeleton */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="h-4 w-16 bg-gray-100 rounded hidden sm:block" />
            {i < 3 && <div className="w-8 sm:w-12 h-px bg-gray-200 mx-2" />}
          </div>
        ))}
      </div>

      {/* Service cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                    <div className="h-3 w-24 bg-gray-100 rounded-full" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
