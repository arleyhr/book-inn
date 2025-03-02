import { create } from 'zustand'
import { getApi } from '../lib/api-config'
import type { Hotel as APIHotel, Room as APIRoom } from '../lib/api'

export type Room = APIRoom
export type Hotel = APIHotel

interface DateRange {
  startDate: string | undefined
  endDate: string | undefined
}

interface GuestInfo {
  count: number
}

interface HotelDetailStore {
  hotel: Hotel | null
  selectedDates: DateRange
  guestInfo: GuestInfo
  unavailableRooms: number[]
  isValidating: boolean
  setHotel: (hotel: Hotel) => void
  setSelectedDates: (dates: DateRange) => void
  setGuestInfo: (guestInfo: GuestInfo) => void
  validateRoomAvailability: () => Promise<void>
  reset: () => void
}

const initialState = {
  hotel: null,
  selectedDates: {
    startDate: undefined,
    endDate: undefined
  },
  guestInfo: {
    count: 1
  },
  unavailableRooms: [],
  isValidating: false
}

export const useHotelDetailStore = create<HotelDetailStore>((set, get) => ({
  ...initialState,
  setHotel: (hotel) => set({ hotel }),
  setSelectedDates: (dates) => {
    set({ selectedDates: dates })
    set({ unavailableRooms: [] })
  },
  setGuestInfo: (guestInfo) => {
    set({ guestInfo })
    set({ unavailableRooms: [] })
  },
  validateRoomAvailability: async () => {
    const { hotel, selectedDates, guestInfo } = get()
    if (!hotel || !selectedDates.startDate || !selectedDates.endDate) return

    set({ isValidating: true })
    set({ unavailableRooms: [] })

    try {
      const response = await getApi().reservations.validateRoomAvailability(
        hotel.id,
        selectedDates.startDate,
        selectedDates.endDate,
        guestInfo.count
      )
      set({ unavailableRooms: response.unavailableRooms })
    } catch (error) {
      console.error('Failed to validate room availability:', error)
    } finally {
      set({ isValidating: false })
    }
  },
  reset: () => set(initialState)
}))
