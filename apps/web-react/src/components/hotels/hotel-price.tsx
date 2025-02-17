import { FC } from 'react'
import type { Room } from '../../lib/api'

interface HotelPriceProps {
  rooms: Room[]
}

export const HotelPrice: FC<HotelPriceProps> = ({ rooms }) => {
  if (!rooms?.length) return null

  return (
    <div>
      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        ${Math.min(...rooms.map((r) => r.basePrice))}
      </span>
      <span className="text-sm text-gray-600 dark:text-gray-400"> / night</span>
    </div>
  )
}
