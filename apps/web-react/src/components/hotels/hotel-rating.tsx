import { FC } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'

interface HotelRatingProps {
  rating: number
  reviewCount: number
}

export const HotelRating: FC<HotelRatingProps> = ({ rating, reviewCount }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
        ({reviewCount} reviews)
      </span>
    </div>
  )
}
