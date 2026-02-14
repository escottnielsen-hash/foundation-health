import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function InvoiceDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Back button skeleton */}
      <div className="mb-6">
        <div className="h-9 w-36 bg-gray-100 rounded" />
      </div>

      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-56 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-4 w-28 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-12 w-28 bg-gray-200 rounded-lg" />
          <div className="h-11 w-36 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Amount bar skeleton */}
      <Card className="mb-8">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 w-16 bg-gray-100 rounded mb-2" />
                <div className="h-7 w-24 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient info skeleton */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="h-5 w-40 bg-gray-200 rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 w-12 bg-gray-100 rounded mb-2" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Line items skeleton */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="h-5 w-24 bg-gray-200 rounded mb-1" />
          <div className="h-4 w-56 bg-gray-100 rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Table header */}
            <div className="flex items-center gap-4 pb-3 border-b">
              <div className="h-4 w-[30%] bg-gray-100 rounded" />
              <div className="h-4 w-[30%] bg-gray-100 rounded" />
              <div className="h-4 w-[10%] bg-gray-100 rounded" />
              <div className="h-4 w-[15%] bg-gray-100 rounded" />
              <div className="h-4 w-[15%] bg-gray-100 rounded" />
            </div>
            {/* Table rows */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <div className="h-4 w-[30%] bg-gray-200 rounded" />
                <div className="h-4 w-[30%] bg-gray-100 rounded" />
                <div className="h-4 w-[10%] bg-gray-100 rounded" />
                <div className="h-4 w-[15%] bg-gray-200 rounded" />
                <div className="h-4 w-[15%] bg-gray-200 rounded" />
              </div>
            ))}
            {/* Footer */}
            <div className="pt-3 border-t space-y-2">
              <div className="flex justify-end gap-4">
                <div className="h-4 w-16 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
              <div className="flex justify-end gap-4">
                <div className="h-5 w-12 bg-gray-200 rounded" />
                <div className="h-5 w-24 bg-gray-300 rounded" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment history skeleton */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="h-5 w-36 bg-gray-200 rounded mb-1" />
          <div className="h-4 w-52 bg-gray-100 rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100" />
                  <div>
                    <div className="h-4 w-20 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-40 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
