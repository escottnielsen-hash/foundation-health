export default function SessionRoomLoading() {
  return (
    <div className="-m-6 lg:-m-8 flex flex-col lg:flex-row h-full min-h-[calc(100vh-4rem)] animate-pulse">
      {/* Main video area skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Top bar skeleton */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="h-5 w-28 bg-gray-700 rounded-full" />
            <div className="h-8 w-24 bg-gray-800 rounded-lg" />
          </div>
          <div className="h-9 w-32 bg-gray-700 rounded-lg" />
        </div>

        {/* Video area skeleton */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center min-h-[300px] lg:min-h-[480px]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-800" />
            <div className="h-5 w-48 bg-gray-800 rounded" />
          </div>
        </div>

        {/* Controls skeleton */}
        <div className="flex items-center justify-center gap-3 p-4 bg-gray-800">
          <div className="h-12 w-12 rounded-full bg-gray-700" />
          <div className="h-12 w-12 rounded-full bg-gray-700" />
          <div className="h-12 w-12 rounded-full bg-gray-700" />
        </div>
      </div>

      {/* Right sidebar skeleton */}
      <div className="w-full lg:w-96 flex flex-col bg-white border-l border-gray-200">
        {/* Physician info skeleton */}
        <div className="p-4 border-b border-gray-100">
          <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-200" />
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          </div>
        </div>

        {/* Chat skeleton */}
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className="h-10 w-44 bg-gray-100 rounded-2xl" />
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-10 bg-gray-100 rounded-full" />
            <div className="h-10 w-10 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
