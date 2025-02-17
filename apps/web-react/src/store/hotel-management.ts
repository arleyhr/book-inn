import { create } from 'zustand'
import { getApi } from '../lib/api-config'
import type { Hotel, Room, OccupancyStats, RevenueStats } from '../lib/api'

interface HotelManagementState {
  hotels: Hotel[]
  selectedHotel: Hotel | null
  occupancyStats: OccupancyStats | null
  revenueStats: RevenueStats | null
  isLoadingStats: boolean
  isLoadingHotels: boolean
  error: string | null
  setSelectedHotel: (hotel: Hotel | null) => void
  loadHotels: () => Promise<void>
  loadStats: (hotelId: number) => Promise<void>
  toggleRoomAvailability: (hotelId: number, roomId: number) => Promise<void>
  deleteHotel: (hotelId: number) => Promise<void>
  initializeHotels: (hotels: Hotel[]) => void
}

export const useHotelManagementStore = create<HotelManagementState>((set, get) => ({
  hotels: [],
  selectedHotel: null,
  occupancyStats: null,
  revenueStats: null,
  isLoadingStats: false,
  isLoadingHotels: false,
  error: null,

  initializeHotels: (hotels) => {
    set({ hotels, isLoadingHotels: false })
  },

  setSelectedHotel: (hotel) => {
    set({ selectedHotel: hotel })
    if (hotel) {
      get().loadStats(hotel.id)
    } else {
      set({ occupancyStats: null, revenueStats: null })
    }
  },

  loadHotels: async () => {
    const { hotels: currentHotels } = get()
    if (currentHotels.length > 0) return

    set({ isLoadingHotels: true, error: null })
    try {
      const hotels = await getApi().hotels.getAgentHotels()
      set({ hotels })
    } catch (error) {
      set({ error: 'Failed to load hotels' })
      console.error('Error loading hotels:', error)
    } finally {
      set({ isLoadingHotels: false })
    }
  },

  loadStats: async (hotelId: number) => {
    if (!hotelId) return

    set({ isLoadingStats: true, error: null })
    try {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)

      const [occupancy, revenue] = await Promise.all([
        getApi().reservations.getOccupancyStats(hotelId, startDate, endDate),
        getApi().reservations.getRevenueStats(hotelId, startDate, endDate)
      ])

      set({ occupancyStats: occupancy, revenueStats: revenue })
    } catch (error) {
      set({ error: 'Failed to load statistics' })
      console.error('Error loading stats:', error)
    } finally {
      set({ isLoadingStats: false })
    }
  },

  toggleRoomAvailability: async (hotelId: number, roomId: number) => {
    try {
      await getApi().hotels.toggleRoomAvailability(hotelId.toString(), roomId.toString())
      get().loadHotels()
    } catch (error) {
      set({ error: 'Failed to toggle room availability' })
      console.error('Error toggling room:', error)
    }
  },

  deleteHotel: async (hotelId: number) => {
    try {
      await getApi().hotels.deleteHotel(hotelId.toString())
      get().loadHotels()
      set({ selectedHotel: null })
    } catch (error) {
      set({ error: 'Failed to delete hotel' })
      console.error('Error deleting hotel:', error)
    }
  }
}))
