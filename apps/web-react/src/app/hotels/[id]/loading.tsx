export default function HotelDetailLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative h-[400px] rounded-lg overflow-hidden bg-gray-200 animate-pulse" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative h-24 rounded-lg overflow-hidden bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center mt-2 space-x-2">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse mt-2" />
          </div>

          <div>
            <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-20 bg-gray-200 rounded animate-pulse" />
          </div>

          <div>
            <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="mt-4 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="h-8 w-1/4 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  )
}
