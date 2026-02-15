import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function TelemedicineRequestLoading() {
  return (
    <div className="max-w-3xl animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-9 w-72 bg-gray-200 rounded mb-2" />
        <div className="h-5 w-64 bg-gray-100 rounded" />
      </div>

      {/* Back button skeleton */}
      <div className="mb-8">
        <div className="h-9 w-36 bg-gray-100 rounded-lg" />
      </div>

      {/* Session Type Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-100 rounded mt-1" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl border-2 border-gray-200" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Physician Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-72 bg-gray-100 rounded mt-1" />
        </CardHeader>
        <CardContent>
          <div className="h-11 w-80 bg-gray-200 rounded-lg" />
        </CardContent>
      </Card>

      {/* Date & Time Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-80 bg-gray-100 rounded mt-1" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 max-w-md">
            <div>
              <div className="h-4 w-12 bg-gray-100 rounded mb-1.5" />
              <div className="h-11 bg-gray-200 rounded-lg" />
            </div>
            <div>
              <div className="h-4 w-12 bg-gray-100 rounded mb-1.5" />
              <div className="h-11 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reason Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="h-6 w-36 bg-gray-200 rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-28 bg-gray-200 rounded-lg max-w-lg" />
        </CardContent>
      </Card>

      {/* State Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="h-6 w-40 bg-gray-200 rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-11 w-80 bg-gray-200 rounded-lg" />
        </CardContent>
      </Card>

      {/* Consent Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-gray-100 rounded-lg mb-4" />
          <div className="flex items-center gap-3">
            <div className="h-6 w-11 bg-gray-200 rounded-full" />
            <div className="h-4 w-56 bg-gray-100 rounded" />
          </div>
        </CardContent>
      </Card>

      {/* Submit buttons */}
      <div className="flex items-center justify-end gap-4 mt-8">
        <div className="h-11 w-24 bg-gray-200 rounded-lg" />
        <div className="h-11 w-40 bg-gray-300 rounded-lg" />
      </div>
    </div>
  )
}
