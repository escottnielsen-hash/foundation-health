import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ProfileLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-9 w-40 bg-gray-200 rounded mb-2" />
        <div className="h-5 w-72 bg-gray-100 rounded" />
      </div>

      {/* Personal Information Card skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-100 rounded mb-1" />
                  <div className="h-5 w-40 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-100 rounded mb-1" />
                  <div className="h-5 w-48 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Card skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 w-24 bg-gray-100 rounded mb-1" />
                <div className="h-5 w-36 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insurance Card skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <div className="h-6 w-44 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-56 bg-gray-100 rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 w-28 bg-gray-100 rounded mb-1" />
                <div className="h-5 w-36 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit button skeleton */}
      <div className="flex justify-end">
        <div className="h-11 w-28 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}
