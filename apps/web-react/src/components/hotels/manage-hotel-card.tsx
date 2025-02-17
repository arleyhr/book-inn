import { BuildingOfficeIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../common/card'
import type { Hotel } from '../../lib/api'
import { HotelRoomsList } from './hotel-rooms-list'
import { HotelStats } from './hotel-stats'
import { HotelCardActions } from './hotel-card-actions'

interface ManageHotelCardProps {
  hotel: Hotel
  isSelected: boolean
  onSelect: (hotel: Hotel) => void
  onToggleRoom: (hotelId: number, roomId: number) => void
  onEdit: (hotelId: number) => void
  onDelete: (hotelId: number) => void
  onViewReservations: (hotelId: number) => void
  occupancyStats?: {
    occupancyRate: number
    occupiedRooms: number
    totalRooms: number
  } | null
  revenueStats?: {
    totalRevenue: number
    totalBookings: number
  } | null
  isLoadingStats?: boolean
}

export function ManageHotelCard({
  hotel,
  isSelected,
  onSelect,
  onToggleRoom,
  onEdit,
  onDelete,
  onViewReservations,
  occupancyStats,
  revenueStats,
  isLoadingStats
}: ManageHotelCardProps) {
  return (
    <Card
      className={`hover:shadow-xl transition-all duration-200 h-full flex flex-col ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(hotel)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <BuildingOfficeIcon className="w-5 h-5 text-primary" />
          <span className="truncate">{hotel.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {hotel.city}, {hotel.country}
            </p>
          </div>

          <HotelRoomsList
            rooms={hotel.rooms}
            onToggleRoom={(roomId) => onToggleRoom(hotel.id, roomId)}
          />

          {isSelected && (
            <HotelStats
              occupancyStats={occupancyStats}
              revenueStats={revenueStats}
              isLoading={isLoadingStats}
            />
          )}
        </div>

        <HotelCardActions
          hotelId={hotel.id}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewReservations={onViewReservations}
        />
      </CardContent>
    </Card>
  )
}
