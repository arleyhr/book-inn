import { format } from 'date-fns'
import Link from 'next/link'
import { Card } from '../common/card'
import { Button } from '../common/button'
import { ReservationStatus } from '../messages/reservation-status'
import { ArrowRightIcon, ChatBubbleLeftIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline'
import { getHotelImageUrl } from '../../lib/images'
import type { Reservation } from '../../lib/api'

interface ReservationCardProps {
  reservation: Reservation
  onCancel: (id: number) => Promise<void>
  onMessage: (id: number) => void
}

export function ReservationCard({ reservation, onCancel, onMessage }: ReservationCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="grid md:grid-cols-[240px,1fr] h-full">
        <div className="relative h-48 md:h-full group overflow-hidden">
          <img
            src={getHotelImageUrl(reservation.room?.hotel?.placeId, reservation.room?.hotel?.images?.[0])}
            alt={reservation.room?.hotel?.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6">
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {reservation.room?.hotel?.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {reservation.room?.hotel?.city}, {reservation.room?.hotel?.country}
                  </p>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Room #{reservation.room?.number}
                  </p>
                </div>
              </div>
              <ReservationStatus status={reservation.status} />
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Check-in
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {format(new Date(reservation.checkInDate), 'PPP')}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Check-out
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {format(new Date(reservation.checkOutDate), 'PPP')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Link href={`/reservations/${reservation.id}`} className="flex-1">
                <Button
                  variant="default"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  View Details
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => onMessage(reservation.id)}
                className="flex items-center gap-2"
              >
                <ChatBubbleLeftIcon className="h-4 w-4" />
                Message Hotel
              </Button>
              {reservation.status === 'pending' && (
                <Button
                  onClick={() => onCancel(reservation.id)}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
