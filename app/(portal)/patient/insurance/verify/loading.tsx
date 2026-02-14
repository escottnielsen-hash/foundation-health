import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function VerifyInsuranceLoading() {
  return (
    <div className="animate-pulse">
      {/* Back link skeleton */}
      <div className="mb-6">
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>

      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-80 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form skeleton */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-11 w-full bg-gray-100 rounded-lg" />
                </div>
              ))}
              <div className="flex justify-end gap-4 pt-2">
                <div className="h-10 w-20 bg-gray-200 rounded-lg" />
                <div className="h-10 w-48 bg-gray-200 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
