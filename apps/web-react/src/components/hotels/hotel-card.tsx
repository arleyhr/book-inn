import Link from 'next/link'
import { MapPinIcon, StarIcon } from '@heroicons/react/24/outline'
import { getHotelImageUrl } from '../../lib/images'
import type { Hotel } from '../../lib/api'

interface HotelCardProps {
  hotel: Hotel
}

export function HotelCard({ hotel }: HotelCardProps) {
  const lowestPrice = Math.min(...hotel.rooms.map((room) => room.basePrice))

  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="relative h-48 md:h-auto md:w-72 group">
        <img
          src={getHotelImageUrl(hotel.placeId, hotel.images[0])}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex-1 p-6">
        <div className="flex flex-col h-full">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {hotel.name}
            </h3>

            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {hotel.city}, {hotel.country}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">{hotel.rating}</span>
              <span className="text-sm text-gray-500">({hotel.reviews.length} reviews)</span>
            </div>
          </div>

          <div className="mt-auto pt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${lowestPrice}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">/ night</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {hotel.rooms.length} room{hotel.rooms.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
