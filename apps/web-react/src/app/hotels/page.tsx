import { HotelSearch } from '../../components/hotels/hotel-search'
import { HotelList } from '../../components/hotels/hotel-list'
import { HotelFilters } from '../../components/hotels/hotel-filters'
import { searchHotels } from '../../lib/api'
import { Suspense } from 'react'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

async function HotelsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const urlSearchParams = new URLSearchParams(params as Record<string, string>).toString()
  const initialHotels = await searchHotels(urlSearchParams)

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Find your perfect stay</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Browse through our curated selection of hotels</p>
        </div>

        <div className="sticky top-8 z-10 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md py-4 mb-6">
          <HotelSearch />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <HotelFilters />
            </div>
          </aside>

          <section className="lg:col-span-9">
            <Suspense fallback={<div>Loading...</div>}>
              <HotelList initialHotels={initialHotels} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  )
}

export default HotelsPage
