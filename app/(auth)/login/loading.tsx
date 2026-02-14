export default function LoginLoading() {
  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse">
      <div className="flex flex-col space-y-1.5 p-6 items-center">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-52 bg-gray-100 rounded" />
      </div>
      <div className="p-6 pt-0 space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <div className="h-4 w-12 bg-gray-100 rounded" />
          <div className="h-11 w-full bg-gray-100 rounded-lg" />
        </div>
        {/* Password field */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-28 bg-gray-100 rounded" />
          </div>
          <div className="h-11 w-full bg-gray-100 rounded-lg" />
        </div>
        {/* Remember me */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-100 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
        {/* Submit button */}
        <div className="h-11 w-full bg-gray-200 rounded-lg" />
      </div>
      <div className="p-6 pt-0 flex justify-center">
        <div className="h-4 w-48 bg-gray-100 rounded" />
      </div>
    </div>
  )
}
