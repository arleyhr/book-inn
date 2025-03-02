import { useState } from 'react'
import { useToast } from '../components/common/use-toast'
import { getApi } from '../lib/api-config'
import type { Reservation, OccupancyStats, RevenueStats } from '../lib/api'
import { useAuthStore } from '../store/auth'

interface UseReservationsReturn {
  reservations: Reservation[]
  isLoading: boolean
  loadReservations: () => Promise<void>
  cancelReservation: (id: number, reason: string) => Promise<void>
  getOccupancyStats: (hotelId: number, startDate: Date, endDate: Date) => Promise<OccupancyStats>
  getRevenueStats: (hotelId: number, startDate: Date, endDate: Date) => Promise<RevenueStats>
}

export function useReservations(): UseReservationsReturn {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadReservations = async () => {
    try {
      const data = await getApi().reservations.getReservations(user?.role)
      setReservations(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reservations. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const cancelReservation = async (id: number, reason: string) => {
    try {
      await getApi().reservations.cancelReservation({
        reservationId: id,
        reason
      })
      toast({
        title: 'Success',
        description: 'Reservation cancelled successfully.',
      })
      await loadReservations()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel reservation. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const getOccupancyStats = async (hotelId: number, startDate: Date, endDate: Date) => {
    try {
      return await getApi().reservations.getOccupancyStats(hotelId, startDate, endDate)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load occupancy statistics. Please try again.',
        variant: 'destructive',
      })
      throw error
    }
  }

  const getRevenueStats = async (hotelId: number, startDate: Date, endDate: Date) => {
    try {
      return await getApi().reservations.getRevenueStats(hotelId, startDate, endDate)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load revenue statistics. Please try again.',
        variant: 'destructive',
      })
      throw error
    }
  }

  return {
    reservations,
    isLoading,
    loadReservations,
    cancelReservation,
    getOccupancyStats,
    getRevenueStats,
  }
}
