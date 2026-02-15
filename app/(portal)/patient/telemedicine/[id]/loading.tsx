import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function SessionDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Back button skeleton */}
      <div className="h-9 w-36 bg-gray-100 rounded-lg mb-6" />

      {/* Session header card skeleton */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-56 bg-gray-200 rounded" />
                <div className="h-6 w-24 bg-gray-100 rounded-full" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="h-5 w-40 bg-gray-100 rounded" />
                <div className="h-5 w-32 bg-gray-100 rounded" />
                <div className="h-5 w-28 bg-gray-100 rounded" />
                <div className="h-5 w-20 bg-gray-100 rounded" />
              </div>
              <div className="mt-4 h-20 bg-gray-50 rounded-lg" />
            </div>
            <div className="h-12 w-36 bg-gray-200 rounded-lg" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-44 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat sidebar skeleton */}
        <div className="lg:col-span-1">
          <Card>
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="h-5 w-24 bg-gray-200 rounded" />
            </div>
            <div className="p-4 space-y-3 min-h-[200px]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className="h-10 w-48 bg-gray-100 rounded-2xl" />
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-10 bg-gray-100 rounded-full" />
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
