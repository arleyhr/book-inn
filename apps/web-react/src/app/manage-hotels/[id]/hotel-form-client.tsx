'use client'

import { useRouter } from 'next/navigation'
import { useHotelForm } from '../../../hooks/use-hotel-form'
import { Button } from '../../../components/common/button'
import { ImageUploadList } from '../../../components/common/image-upload-list'
import { PlusIcon, TrashIcon, ArrowLeftIcon, MapPinIcon, ClipboardDocumentListIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { PageHeader } from '../../../components/common/page-header'
import { MapLocationPicker } from '../../../components/common/map-location-picker'
import type { Hotel } from '../../../lib/api'

interface HotelFormClientProps {
  hotelId?: string
  initialHotel?: Hotel
}

const ROOM_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'suite', label: 'Suite' },
  { value: 'family', label: 'Family' }
] as const

export function HotelFormClient({ hotelId, initialHotel }: HotelFormClientProps) {
  const router = useRouter()
  const {
    form: {
      register,
      formState: { errors, isSubmitting },
      setValue
    },
    fields,
    isLoadingHotel,
    onSubmit,
    addNewRoom,
    removeRoom,
    handleLocationSelect,
    watch
  } = useHotelForm({ hotelId, initialHotel })

  if (hotelId && isLoadingHotel) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  const currentLocation = watch(['latitude', 'longitude'])
  const hasLocation = currentLocation[0] !== undefined && currentLocation[1] !== undefined

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => router.push('/manage-hotels')}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Hotels
        </Button>

        <PageHeader
          title={hotelId ? 'Edit Hotel' : 'Create New Hotel'}
          description={hotelId ? 'Update hotel details and manage rooms' : 'Add a new hotel to your portfolio'}
        />

        <form onSubmit={onSubmit} className="space-y-8 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
                <h3 className="text-lg font-medium">Hotel Details</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      {...register('name')}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Enter hotel name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register('isActive')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">Hotel Active</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      {watch('isActive') ? 'This hotel is visible and available for bookings' : 'This hotel is hidden and unavailable for bookings'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input
                      {...register('address')}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Enter hotel address"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <input
                        {...register('city')}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter city"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Country</label>
                      <input
                        {...register('country')}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter country"
                      />
                      {errors.country && (
                        <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
                <h3 className="text-lg font-medium">Images</h3>
                <ImageUploadList
                  images={watch('images') || []}
                  onChange={(images) => setValue('images', images)}
                  maxImages={5}
                  placeId={initialHotel?.placeId}
                />
                {errors.images && (
                  <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Location</h3>
                {hasLocation && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span>Location selected</span>
                  </div>
                )}
              </div>
              <MapLocationPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={hasLocation ? {
                  lat: Number(currentLocation[0]),
                  lng: Number(currentLocation[1])
                } : undefined}
              />
              <p className="text-sm text-gray-500">
                Select the hotel location from the map (optional)
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Rooms</h3>
              <Button
                type="button"
                onClick={addNewRoom}
                className="flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Room
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-medium">Room {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeRoom(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        {...register(`rooms.${index}.location`)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter room location"
                      />
                      {errors.rooms?.[index]?.location && (
                        <p className="text-red-500 text-sm mt-1">{errors.rooms[index]?.location?.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        {...register(`rooms.${index}.type`)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select room type</option>
                        {ROOM_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.rooms?.[index]?.type && (
                        <p className="text-red-500 text-sm mt-1">{errors.rooms[index]?.type?.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Base Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`rooms.${index}.basePrice`, {
                            valueAsNumber: true
                          })}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 pl-7 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="0.00"
                        />
                      </div>
                      {errors.rooms?.[index]?.basePrice && (
                        <p className="text-red-500 text-sm mt-1">{errors.rooms[index]?.basePrice?.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Taxes (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`rooms.${index}.taxes`, {
                          valueAsNumber: true
                        })}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter tax percentage (0-15%)"
                      />
                      {errors.rooms?.[index]?.taxes && (
                        <p className="text-red-500 text-sm mt-1">{errors.rooms[index]?.taxes?.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Tax is calculated as a percentage of the base price
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <span className="flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          Guest Capacity
                        </span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        {...register(`rooms.${index}.guestCapacity`, {
                          valueAsNumber: true
                        })}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter guest capacity"
                      />
                      {errors.rooms?.[index]?.guestCapacity && (
                        <p className="text-red-500 text-sm mt-1">{errors.rooms[index]?.guestCapacity?.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...register(`rooms.${index}.isAvailable`)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">Room Available</span>
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        {watch(`rooms.${index}.isAvailable`) ? 'This room is available for booking' : 'This room is currently unavailable'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {fields.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No rooms added yet</p>
                  <p className="text-sm text-gray-400">Add rooms using the button above</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            {hotelId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/reservations/hotel/${hotelId}`)}
                className="mr-auto flex items-center gap-2"
              >
                <ClipboardDocumentListIcon className="h-4 w-4" />
                View Reservations
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/manage-hotels')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : hotelId ? 'Update Hotel' : 'Create Hotel'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
