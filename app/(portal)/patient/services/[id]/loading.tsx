import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ServiceDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Back navigation skeleton */}
      <div className="mb-6">
        <div className="h-4 w-32 bg-gray-100 rounded" />
      </div>

      {/* Header skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-24 bg-gray-100 rounded-full" />
          <div className="h-5 w-32 bg-gray-100 rounded-full" />
        </div>
        <div className="h-9 w-72 bg-gray-200 rounded mb-2" />
        <div className="h-5 w-full max-w-xl bg-gray-100 rounded mb-1" />
        <div className="h-5 w-3/4 max-w-xl bg-gray-100 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Service Details skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-20 bg-gray-100 rounded mb-1" />
                    <div className="h-5 w-32 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What's Included skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-36 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gray-100 rounded flex-shrink-0" />
                    <div className="h-5 w-64 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transparency notice skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
            </CardContent>
          </Card>

          {/* FAQ skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-52 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <div className="h-5 w-64 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-full bg-gray-100 rounded mb-1" />
                    <div className="h-4 w-5/6 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pricing card skeleton */}
          <Card className="border-2 border-gray-100">
            <CardHeader className="pb-4">
              <div className="h-3 w-24 bg-gray-100 rounded mb-2" />
              <div className="h-10 w-36 bg-gray-200 rounded" />
              <div className="h-4 w-28 bg-gray-100 rounded mt-1" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-5 space-y-2">
                <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between"
                  >
                    <div className="h-4 w-20 bg-gray-100 rounded" />
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
              <div className="h-px bg-gray-200 my-4" />
              <div className="h-12 w-full bg-gray-200 rounded-lg" />
              <div className="h-3 w-48 bg-gray-100 rounded mx-auto mt-3" />
            </CardContent>
          </Card>

          {/* Quick info skeleton */}
          <Card>
            <CardContent className="p-5">
              <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-100 rounded flex-shrink-0" />
                    <div className="h-4 w-44 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
