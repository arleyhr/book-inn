'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '../../../../store/auth'
import { useAuthModalStore } from '../../../../store/auth-modal'
import { useBookingStore } from './store'
import { GuestForm } from './guest-form'
import { useToast } from '../../../../components/common/use-toast'
import type { GuestFormData } from './schema'

interface BookingConfirmationClientProps {
  hotelId: string
  searchParams: { [key: string]: string | string[] | undefined }
}

export function BookingConfirmationClient({ hotelId, searchParams }: BookingConfirmationClientProps) {
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
    reset
  } = useBookingStore()

  useEffect(() => {
    initializeBooking(hotelId, searchParams)
    return () => reset()
  }, [hotelId, searchParams, initializeBooking, reset])

  const handleGuestSubmit = async (guestData: GuestFormData) => {
    if (!isAuthenticated) {
      openModal('login')
      return
    }

    if (!hotel || !bookingDetails) {
      toast({
        title: 'Error',
        description: 'Missing booking information',
        variant: 'destructive'
      })
      return
    }

    await submitBooking(guestData)
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

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Redirecting back to hotel page in 5 seconds...
            </p>
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
                href="/my-reservations"
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
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Check-in</span>
                  <span className="dark:text-white">
                    {new Date(bookingDetails.checkIn).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Check-out</span>
                  <span className="dark:text-white">
                    {new Date(bookingDetails.checkOut).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Nights</span>
                  <span className="dark:text-white">{bookingDetails.totalNights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Price per night</span>
                  <span className="dark:text-white">${bookingDetails.pricePerNight.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Taxes</span>
                  <span className="dark:text-white">${bookingDetails.taxes.toFixed(2)}</span>
                </div>
                <div className="border-t dark:border-gray-700 pt-3 flex justify-between font-semibold">
                  <span className="dark:text-white">Total</span>
                  <span className="dark:text-white">${bookingDetails.totalPrice.toFixed(2)}</span>
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
