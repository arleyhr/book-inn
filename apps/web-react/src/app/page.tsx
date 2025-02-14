import { Hero } from '../components/home/hero'
import { FeaturedHotels } from '../components/hotels/featured-hotels'
import { SearchParams } from '../components/search/search-bar'
import { getFeaturedHotels } from '../lib/server-actions'
import { redirect } from 'next/navigation'

const FEATURED_GRID_TEMPLATE = [
  { cols: 2, rows: 2 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 2 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 1 },
]

const formatDate = (date: string) => {
  return new Date(date).toISOString().split('T')[0]
}

export default async function Home() {
  const handleSearch = async (searchParams: SearchParams) => {
    'use server'
    const formattedCheckIn = searchParams.checkIn ? formatDate(searchParams.checkIn) : ''
    const formattedCheckOut = searchParams.checkOut ? formatDate(searchParams.checkOut) : ''

    redirect(`/hotels/${searchParams.hotel}?checkIn=${formattedCheckIn}&checkOut=${formattedCheckOut}`)
  }

  try {
    const featuredHotels = await getFeaturedHotels()

    const mappedHotels = featuredHotels.map((hotel, index) => ({
      id: hotel.id.toString(),
      href: `/hotels/${hotel.id}`,
      imageUrl: hotel.images[0],
      imageAlt: hotel.name,
      locations: [hotel.city],
      title: hotel.name,
      description: hotel.description,
      pricePerNight: hotel.rooms[0]?.basePrice || 0,
      rating: hotel.reviews.reduce((acc, review) => acc + review.rating, 0) / hotel.reviews.length || 0,
      placeId: hotel.placeId,
      gridSpan: FEATURED_GRID_TEMPLATE[index]
    }))

    return (
      <>
        <Hero
          onSearch={handleSearch}
          backgroundImage="/room-bg.jpg"
          title="Experience Luxury Beyond Imagination"
          subtitle="From boutique hotels to exclusive resorts, find your perfect escape in Colombia's most stunning locations"
        />
        <FeaturedHotels hotels={mappedHotels} />
      </>
    )
  } catch (error) {
    console.error('Error fetching featured hotels:', error)
    return (
      <>
        <Hero
          onSearch={handleSearch}
          backgroundImage="/room-bg.jpg"
          title="Experience Luxury Beyond Imagination"
          subtitle="From boutique hotels to exclusive resorts, find your perfect escape in Colombia's most stunning locations"
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-lg bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading featured hotels</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error instanceof Error ? error.message : 'An unexpected error occurred. Please try again later.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}
