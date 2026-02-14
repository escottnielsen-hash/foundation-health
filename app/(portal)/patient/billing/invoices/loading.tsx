import { Card, CardContent } from '@/components/ui/card'

export default function InvoicesLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-9 w-36 bg-gray-200 rounded mb-2" />
        <div className="h-5 w-64 bg-gray-100 rounded" />
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="h-3 w-28 bg-gray-100 rounded mb-3" />
              <div className="h-8 w-24 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-12 bg-gray-100 rounded" />
          <div className="h-11 w-44 bg-gray-200 rounded-lg" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-10 bg-gray-100 rounded" />
          <div className="h-11 w-40 bg-gray-200 rounded-lg" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-6 bg-gray-100 rounded" />
          <div className="h-11 w-40 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Invoice rows skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-5 w-36 bg-gray-200 rounded" />
                    <div className="h-5 w-16 bg-gray-100 rounded-full" />
                  </div>
                  <div className="h-4 w-56 bg-gray-100 rounded mb-2" />
                  <div className="flex items-center gap-4">
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-6 w-20 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
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
