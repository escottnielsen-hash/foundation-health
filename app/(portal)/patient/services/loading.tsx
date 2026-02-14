import { Card, CardContent } from '@/components/ui/card'

export default function ServicesLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-9 w-40 bg-gray-200 rounded mb-2" />
        <div className="h-5 w-80 bg-gray-100 rounded" />
      </div>

      {/* Cash-pay notice skeleton */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 h-20" />

      {/* Filter bar skeleton */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 min-w-0">
            <div className="h-4 w-24 bg-gray-100 rounded mb-1.5" />
            <div className="h-11 w-full bg-gray-200 rounded-lg" />
          </div>
          <div className="w-full sm:w-52">
            <div className="h-4 w-16 bg-gray-100 rounded mb-1.5" />
            <div className="h-11 w-full bg-gray-200 rounded-lg" />
          </div>
          <div className="w-full sm:w-52">
            <div className="h-4 w-14 bg-gray-100 rounded mb-1.5" />
            <div className="h-11 w-full bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="h-4 w-32 bg-gray-100 rounded mt-3" />
      </div>

      {/* Category section skeleton */}
      {Array.from({ length: 2 }).map((_, sectionIdx) => (
        <div key={sectionIdx} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 w-36 bg-gray-200 rounded" />
            <div className="flex-1 h-px bg-gray-200" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, cardIdx) => (
              <Card key={cardIdx} className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-5 w-20 bg-gray-100 rounded-full" />
                  </div>
                  <div className="h-6 w-48 bg-gray-200 rounded mb-1.5" />
                  <div className="h-4 w-full bg-gray-100 rounded mb-1" />
                  <div className="h-4 w-3/4 bg-gray-100 rounded mb-4" />
                  <div className="pt-3 border-t border-gray-100 flex items-end justify-between">
                    <div>
                      <div className="h-3 w-20 bg-gray-100 rounded mb-1" />
                      <div className="h-7 w-24 bg-gray-200 rounded" />
                    </div>
                    <div className="text-right">
                      <div className="h-3 w-14 bg-gray-100 rounded mb-1" />
                      <div className="h-5 w-16 bg-gray-200 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
