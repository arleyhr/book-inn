import { XCircleIcon, UserGroupIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import type { Room } from '../../store/hotel-detail'

interface RoomCardProps {
  room: Room
  isAvailable: boolean
  isValidating: boolean
  onBookRoom: (roomId: number) => void
  showAvailabilityMessage?: boolean
  guestCapacity?: number
  requestedGuests?: number
}

export function RoomCard({
  room,
  isAvailable,
  isValidating,
  onBookRoom,
  showAvailabilityMessage = true,
  guestCapacity,
  requestedGuests
}: RoomCardProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg dark:bg-gray-900 ${
        !isAvailable ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : ''
      }`}
    >
      <div>
        <h3 className="font-semibold dark:text-gray-100">{room.type}</h3>
        <p className="text-gray-600 dark:text-gray-400">{room.location}</p>
        {guestCapacity && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 flex items-center gap-1">
            <UserGroupIcon className="h-4 w-4" />
            Max capacity: {guestCapacity} {guestCapacity === 1 ? 'guest' : 'guests'}
          </p>
        )}
        {!isAvailable && showAvailabilityMessage && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
            {guestCapacity && requestedGuests && guestCapacity < requestedGuests ? (
              <>
                <ExclamationCircleIcon className="h-4 w-4" />
                This room can only accommodate {guestCapacity} {guestCapacity === 1 ? 'person' : 'people'}
              </>
            ) : (
              <>
                <XCircleIcon className="h-4 w-4" />
                Not available for selected dates
              </>
            )}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="text-lg font-bold dark:text-gray-100">
          ${room.basePrice.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">per night + {room.taxes}% tax</p>
        <button
          onClick={() => onBookRoom(room.id)}
          className={`mt-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isAvailable
              ? 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
          }`}
          disabled={!isAvailable || isValidating}
        >
          {isValidating ? 'Checking availability...' : isAvailable ? 'Book Now' : 'Not Available'}
        </button>
      </div>
    </div>
  )
}
