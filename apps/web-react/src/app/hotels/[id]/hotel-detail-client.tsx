'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DateRangePicker } from '../../../components/common/date-range-picker'
import { useToast } from '../../../components/common/use-toast'
import { MapLocationPicker } from '../../../components/common/map-location-picker'
import { RoomCard } from '../../../components/hotels/room-card'
import { useHotelDetailStore, type Hotel } from '../../../store/hotel-detail'

interface HotelDetailClientProps {
  hotel: Hotel
  initialCheckIn?: string
  initialCheckOut?: string
}

export function HotelDetailClient({ hotel, initialCheckIn, initialCheckOut }: HotelDetailClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const {
    setHotel,
    selectedDates,
    setSelectedDates,
    unavailableRooms,
    isValidating,
    validateRoomAvailability,
    reset
  } = useHotelDetailStore()

  useEffect(() => {
    setHotel(hotel)
    setSelectedDates({
      startDate: initialCheckIn,
      endDate: initialCheckOut
    })

    return () => reset()
  }, [hotel, initialCheckIn, initialCheckOut, setHotel, setSelectedDates, reset])

  useEffect(() => {
    if (selectedDates.startDate && selectedDates.endDate) {
      validateRoomAvailability()
    }
  }, [selectedDates.startDate, selectedDates.endDate, validateRoomAvailability])

  const handleBookRoom = (roomId: number) => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      toast({
        title: 'Error',
        description: 'Please select check-in and check-out dates',
        variant: 'destructive'
      })
      return
    }

    const checkInDate = new Date(selectedDates.startDate)
    const checkOutDate = new Date(selectedDates.endDate)

    checkInDate.setHours(0, 0, 0, 0)
    checkOutDate.setHours(0, 0, 0, 0)

    const searchParams = new URLSearchParams({
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      roomId: roomId.toString()
    })

    router.push(`/hotels/${hotel.id}/book?${searchParams.toString()}`)
  }

  return (
    <main className="container mx-auto px-4 py-8 pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            {hotel.images[0] ? (
              <img
                src={hotel.images[0]}
                alt={hotel.name}
                className="object-cover h-full w-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          {hotel.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {hotel.images.slice(1, 4).map((image, index) => (
                <div key={index} className="relative h-24 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${hotel.name} view ${index + 2}`}
                    className="object-cover h-full w-full"
                  />
                </div>
              ))}
            </div>
          )}

          {hotel.latitude && hotel.longitude && (
            <div className="pt-4">
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <div className="rounded-lg overflow-hidden">
                <MapLocationPicker
                  initialLocation={{
                    lat: Number(hotel.latitude),
                    lng: Number(hotel.longitude)
                  }}
                  readonly
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{hotel.name}</h1>
            <div className="flex items-center mt-2 space-x-2">
              <span className="flex items-center">
                {Array.from({ length: Math.floor(hotel.rating || 0) }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </span>
              <span className="text-gray-600">
                {Number(hotel.rating || 0).toFixed(1)} ({hotel.reviews.length} reviews)
              </span>
            </div>
            {hotel.address && (
              <p className="text-gray-600 mt-2">
                {hotel.address}
                {hotel.city && `, ${hotel.city}`}
                {hotel.country && `, ${hotel.country}`}
              </p>
            )}
          </div>

          {hotel.description && (
            <div>
              <h2 className="text-xl font-semibold mb-2">About this hotel</h2>
              <p className="text-gray-700">{hotel.description}</p>
            </div>
          )}

          {hotel.amenities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Amenities</h2>
              <div className="grid grid-cols-2 gap-2">
                {hotel.amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Book your stay</h2>
            <DateRangePicker
              startName="checkIn"
              endName="checkOut"
              startDate={selectedDates.startDate}
              endDate={selectedDates.endDate}
              onDateChange={({ startDate, endDate }) => {
                setSelectedDates({
                  startDate: startDate?.toISOString(),
                  endDate: endDate?.toISOString()
                })
              }}
            />
            {hotel.rooms.length > 0 ? (
              <div className="mt-4 space-y-4">
                {hotel.rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isAvailable={!unavailableRooms.includes(room.id)}
                    isValidating={isValidating}
                    onBookRoom={handleBookRoom}
                    showAvailabilityMessage={Boolean(selectedDates.startDate && selectedDates.endDate)}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-gray-600 dark:text-gray-400">No rooms available at the moment</p>
            )}
          </div>
        </div>
      </div>

      {hotel.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">Guest Reviews</h2>
          <div className="grid gap-6">
            {hotel.reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:shadow-gray-800">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="flex items-center">
                    {Array.from({ length: review.rating || 0 }).map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
