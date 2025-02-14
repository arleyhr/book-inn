import { CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { Button } from '../common/button'
import type { Room } from '../../lib/api'

interface HotelRoomsListProps {
  rooms: Room[]
  onToggleRoom: (roomId: number) => void
}

export function HotelRoomsList({ rooms, onToggleRoom }: HotelRoomsListProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
        <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
        Available Rooms ({rooms.length})
      </h4>
      <div className="space-y-2 max-h-[160px] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
          >
            <div>
              <p className="text-sm font-medium capitalize">{room.type}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{room.location}</p>
            </div>
            <Button
              size="sm"
              variant={room.isAvailable ? 'outline' : 'default'}
              onClick={(e) => {
                e.stopPropagation()
                onToggleRoom(room.id)
              }}
            >
              {room.isAvailable ? 'Available' : 'Unavailable'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
