import { FC } from 'react'

interface Amenity {
  id: number
  name: string
}

interface HotelAmenitiesProps {
  amenities?: Amenity[]
}

export const HotelAmenities: FC<HotelAmenitiesProps> = ({ amenities }) => {
  if (!amenities?.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {amenities.map((amenity) => (
        <span
          key={amenity.id}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
        >
          {amenity.name}
        </span>
      ))}
    </div>
  )
}
