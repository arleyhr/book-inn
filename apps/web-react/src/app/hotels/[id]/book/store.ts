import { create } from 'zustand'
import { fetchHotelById, createReservation } from '../../../../lib/api'
import { getHotelImageUrl } from '../../../../lib/images'
import type { Hotel } from '../../../../store/hotel-detail'
import type { GuestFormData } from './schema'
import { getApi } from '../../../../lib/api-config'

interface BookingDetails {
  checkIn: string
  checkOut: string
  roomId: number
  guestCount: number
  totalNights: number
  pricePerNight: number
  taxes: number
  totalPrice: number
  isAvailable: boolean
  maxGuests: number
}

interface BookingStore {
  hotel: Hotel | null
  bookingDetails: BookingDetails | null
  loading: boolean
  isSubmitting: boolean
  error: string | null
  bookingSuccess: boolean
  unavailableRoom: boolean
  initializeBooking: (hotelId: string, searchParams: { [key: string]: string | string[] | undefined }) => Promise<void>
  submitBooking: (guestData: GuestFormData) => Promise<void>
  validateAndUpdateDates: (checkIn: string, checkOut: string) => Promise<void>
  reset: () => void
}

const initialState = {
  hotel: null,
  bookingDetails: null,
  loading: true,
  isSubmitting: false,
  error: null,
  bookingSuccess: false,
  unavailableRoom: false
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  ...initialState,

  initializeBooking: async (hotelId, searchParams) => {
    try {
      const checkIn = decodeURIComponent(searchParams.checkIn as string)
      const checkOut = decodeURIComponent(searchParams.checkOut as string)
      const roomId = searchParams.roomId as string
      const guestCount = Number(searchParams.guests) || 1

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
        set({ unavailableRoom: true, error: 'Selected room is not available', loading: false })
        return
      }

      const hotel = {
        ...hotelData,
        images: hotelData.images.map((image) => getHotelImageUrl(hotelData.placeId, image))
      }

      const pricePerNight = Number(room.basePrice)
      const taxPercentage = Number(room.taxes)
      const taxAmount = pricePerNight * (taxPercentage / 100)
      const totalPrice = (pricePerNight + taxAmount) * nights

      set({
        hotel,
        bookingDetails: {
          checkIn,
          checkOut,
          guestCount,
          totalPrice,
          pricePerNight,
          maxGuests: Number(room.guestCapacity),
          roomId: Number(roomId),
          totalNights: nights,
          taxes: taxAmount * nights,
          isAvailable: room.isAvailable
        }
      })

      const availability = await getApi().reservations.validateRoomAvailability(
        Number(hotelId),
        checkIn,
        checkOut,
        guestCount
      )

      if (!availability.available && availability.unavailableRooms.includes(Number(roomId))) {
        set({ unavailableRoom: true, error: 'Room is not available for selected dates', loading: false })
        return
      }

      set({
        loading: false,
        error: null,
        unavailableRoom: false
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      set({ error: errorMessage, loading: false })
    }
  },

  validateAndUpdateDates: async (checkIn, checkOut) => {
    const { hotel, bookingDetails } = get()
    if (!hotel || !bookingDetails) {
      set({ error: 'Missing booking information' })
      return
    }

    try {
      set({ loading: true, error: null })

      const startDate = new Date(checkIn)
      const endDate = new Date(checkOut)

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid dates provided')
      }

      const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      if (nights <= 0) {
        throw new Error('Check-out date must be after check-in date')
      }

      const availability = await getApi().reservations.validateRoomAvailability(
        Number(hotel.id),
        checkIn,
        checkOut,
        bookingDetails.guestCount
      )

      if (!availability.available && availability.unavailableRooms.includes(Number(bookingDetails.roomId))) {
        set({ unavailableRoom: true, error: 'Room is not available for selected dates', loading: false })
        return
      }

      const room = hotel.rooms.find((r) => r.id.toString() === bookingDetails.roomId)
      if (!room) {
        throw new Error('Selected room not found')
      }

      const pricePerNight = Number(room.basePrice)
      const taxPercentage = Number(room.taxes)
      const taxAmount = pricePerNight * (taxPercentage / 100)
      const totalPrice = (pricePerNight + taxAmount) * nights

      set({
        bookingDetails: {
          ...bookingDetails,
          checkIn,
          checkOut,
          totalNights: nights,
          taxes: taxAmount * nights,
          totalPrice,
          isAvailable: true
        },
        loading: false,
        error: null,
        unavailableRoom: false
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
        roomId: bookingDetails.roomId,
        checkInDate: new Date(bookingDetails.checkIn).toISOString(),
        checkOutDate: new Date(bookingDetails.checkOut).toISOString(),
        guestName: guestData.guestName,
        guestEmail: guestData.guestEmail,
        guestPhone: guestData.guestPhone,
        emergencyContactName: guestData.emergencyContactName,
        emergencyContactPhone: guestData.emergencyContactPhone,
        guestCount: bookingDetails.guestCount
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
