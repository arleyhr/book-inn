import { create } from 'zustand'
import { fetchHotelById, createReservation } from '../../../../lib/api'
import { getHotelImageUrl } from '../../../../lib/images'
import type { Hotel } from '../../../../store/hotel-detail'
import type { GuestFormData } from './schema'

interface BookingDetails {
  checkIn: string
  checkOut: string
  roomId: string
  totalNights: number
  pricePerNight: number
  taxes: number
  totalPrice: number
}

interface BookingStore {
  hotel: Hotel | null
  bookingDetails: BookingDetails | null
  loading: boolean
  isSubmitting: boolean
  error: string | null
  bookingSuccess: boolean
  initializeBooking: (hotelId: string, searchParams: { [key: string]: string | string[] | undefined }) => Promise<void>
  submitBooking: (guestData: GuestFormData) => Promise<void>
  reset: () => void
}

const initialState = {
  hotel: null,
  bookingDetails: null,
  loading: true,
  isSubmitting: false,
  error: null,
  bookingSuccess: false
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  ...initialState,

  initializeBooking: async (hotelId, searchParams) => {
    try {
      const checkIn = decodeURIComponent(searchParams.checkIn as string)
      const checkOut = decodeURIComponent(searchParams.checkOut as string)
      const roomId = searchParams.roomId as string

      if (!checkIn || !checkOut || !roomId) {
        throw new Error('Missing required booking parameters')
      }

      const startDate = new Date(checkIn)
      const endDate = new Date(checkOut)

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid dates provided')
      }

      const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      if (nights <= 0) {
        throw new Error('Check-out date must be after check-in date')
      }

      const hotelData = await fetchHotelById(hotelId)

      if (!hotelData?.name) {
        throw new Error('Hotel not found')
      }

      const room = hotelData.rooms.find((r) => r.id.toString() === roomId)
      if (!room) {
        throw new Error('Selected room not found')
      }

      if (!room.isAvailable) {
        throw new Error('Selected room is not available')
      }

      const hotel = {
        ...hotelData,
        images: hotelData.images.map((image) => getHotelImageUrl(hotelData.placeId, image))
      }

      const pricePerNight = Number(room.basePrice)
      const taxes = Number(room.taxes)
      const totalPrice = (pricePerNight + taxes) * nights

      set({
        hotel,
        bookingDetails: {
          checkIn,
          checkOut,
          roomId,
          totalNights: nights,
          pricePerNight,
          taxes,
          totalPrice
        },
        loading: false,
        error: null
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      set({ error: errorMessage, loading: false })
    }
  },

  submitBooking: async (guestData) => {
    const { hotel, bookingDetails } = get()

    if (!hotel || !bookingDetails) {
      set({ error: 'Missing booking information' })
      return
    }

    try {
      set({ isSubmitting: true, error: null })

      const booking = await createReservation({
        roomId: Number(bookingDetails.roomId),
        checkInDate: new Date(bookingDetails.checkIn).toISOString(),
        checkOutDate: new Date(bookingDetails.checkOut).toISOString(),
        guestName: guestData.guestName,
        guestEmail: guestData.guestEmail,
        guestPhone: guestData.guestPhone,
        emergencyContactName: guestData.emergencyContactName,
        emergencyContactPhone: guestData.emergencyContactPhone,
      })

      if (booking) {
        set({ bookingSuccess: true })
      } else {
        throw new Error('Failed to create booking')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking'
      set({ error: errorMessage })
    } finally {
      set({ isSubmitting: false })
    }
  },

  reset: () => set(initialState)
}))
