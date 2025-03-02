'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../../../store/auth'
import { useAuthModalStore } from '../../../../store/auth-modal'
import { useBookingStore } from './store'
import { GuestForm } from './guest-form'
import { useToast } from '../../../../components/common/use-toast'
import { DateRangePicker } from '../../../../components/common/date-range-picker'
import { Button } from '../../../../components/common/button'
import { ArrowLeftIcon, CalendarIcon } from '@heroicons/react/24/outline'
import type { GuestFormData } from './schema'

interface BookingConfirmationClientProps {
  hotelId: string
  searchParams: { [key: string]: string | string[] | undefined }
}

export function BookingConfirmationClient({ hotelId, searchParams }: BookingConfirmationClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated } = useAuthStore()
  const { openModal } = useAuthModalStore()
  const {
    hotel,
    bookingDetails,
    loading,
    isSubmitting,
    error,
    bookingSuccess,
    initializeBooking,
    submitBooking,
    validateAndUpdateDates,
    reset
  } = useBookingStore()

  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null
  })

  useEffect(() => {
    initializeBooking(hotelId, searchParams)
    return () => reset()
  }, [hotelId, searchParams, initializeBooking, reset])

  useEffect(() => {
    if (bookingDetails) {
      setDateRange({
        startDate: new Date(bookingDetails.checkIn),
        endDate: new Date(bookingDetails.checkOut)
      })
    }
  }, [bookingDetails])

  const handleGuestSubmit = async (guestData: GuestFormData) => {
    if (!isAuthenticated) {
      openModal('login')
      toast({
        title: 'Authentication Required',
        description: 'Please log in to complete your booking',
        variant: 'default'
      })
      return
    }

    if (!hotel || !bookingDetails) {
      toast({
        title: 'Booking Error',
        description: 'Missing booking information. Please try again.',
        variant: 'destructive'
      })
      return
    }

    await submitBooking(guestData)
  }

  const handleDateChange = async ({ startDate, endDate }: { startDate: Date | null; endDate: Date | null }) => {
    setDateRange({ startDate, endDate })

    if (startDate && endDate) {
      await validateAndUpdateDates(startDate.toISOString(), endDate.toISOString())
    }
  }

  const goBack = () => {
    router.push(`/hotels/${hotelId}`)
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </main>
    )
  }

  if (bookingDetails?.guestCount && bookingDetails?.guestCount > bookingDetails?.maxGuests) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
              Guest Capacity Exceeded
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-6">The number of guests exceeds the room capacity of {hotel?.rooms?.[0]?.guestCapacity} guests.</p>
            <Button
              onClick={goBack}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Return to Hotel
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
              Unable to complete booking
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>

            {bookingDetails?.isAvailable && hotel && (
              <div className="mb-6 space-y-4">
                <h3 className="text-lg font-medium dark:text-gray-200">Try different dates</h3>
                <DateRangePicker
                  startName="checkIn"
                  endName="checkOut"
                  startDate={dateRange.startDate?.toISOString()}
                  endDate={dateRange.endDate?.toISOString()}
                  onDateChange={handleDateChange}
                />
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>Select new dates to check availability</span>
                </div>
              </div>
            )}

            <Button
              onClick={goBack}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Return to Hotel
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (!hotel || !bookingDetails) return null

  if (bookingSuccess) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">
              Booking Submitted!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Thank you for choosing {hotel.name}.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Your booking is pending confirmation. We&apos;ll notify you once it&apos;s confirmed.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/messages"
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Message Agent
              </Link>
              <Link
                href="/manage-reservations"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                View My Reservations
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Confirm your booking</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-48">
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 dark:text-white">{hotel.name}</h2>
                <p className="text-gray-600 dark:text-gray-300">{hotel.address}</p>
                <p className="text-gray-600 dark:text-gray-300">{hotel.city}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Booking Summary</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Check-in</span>
                    <span className="text-lg font-medium dark:text-white">
                      {new Date(bookingDetails.checkIn).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Check-out</span>
                    <span className="text-lg font-medium dark:text-white">
                      {new Date(bookingDetails.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Nights</span>
                    <span className="text-lg font-medium dark:text-white">{bookingDetails.totalNights}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Guests</span>
                    <span className="text-lg font-medium dark:text-white">{bookingDetails.guestCount}</span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Price per night</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ${bookingDetails.pricePerNight.toFixed(2)} x {bookingDetails.totalNights} nights
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ${(bookingDetails.pricePerNight * bookingDetails.totalNights).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Taxes ({(bookingDetails.taxes / (bookingDetails.pricePerNight * bookingDetails.totalNights) * 100).toFixed(1)}%)
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">${bookingDetails.taxes.toFixed(2)}</span>
                  </div>
                  <div className="border-t dark:border-gray-600 pt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold dark:text-white">Total</span>
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      ${bookingDetails.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Guest Information</h3>
            <GuestForm onSubmit={handleGuestSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </div>
    </main>
  )
}
