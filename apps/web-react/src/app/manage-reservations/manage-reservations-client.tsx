'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../store/auth'
import { getApi } from '../../lib/api-config'
import type { Reservation } from '../../lib/api'
import { useToast } from '../../components/common/use-toast'
import { ReservationCard } from '../../components/reservations/reservation-card'
import { PageHeader } from '../../components/common/page-header'
import { CancelReservationModal } from '../../components/reservations/cancel-reservation-modal'

export function ManageReservationsClient() {
  const router = useRouter()
  const { accessToken, user } = useAuthStore()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<number | null>(null)
  const [viewAs, setViewAs] = useState<'agent' | 'traveler'>(user?.role === 'agent' ? 'agent' : 'traveler')
  const { toast } = useToast()

  useEffect(() => {
    if (!accessToken) {
      router.push('/')
      return
    }

    loadReservations()
  }, [accessToken, router, viewAs])

  const loadReservations = async () => {
    try {
      const data = await getApi().reservations.getReservations(viewAs)
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

  const handleCancelClick = (id: number) => {
    setSelectedReservation(id)
  }

  const handleCancelConfirm = async (reason: string) => {
    if (!selectedReservation) return

    try {
      setIsCancelling(true)
      await getApi().reservations.cancelReservation({
        reservationId: selectedReservation,
        reason
      })
      toast({
        title: 'Success',
        description: 'Reservation cancelled successfully.',
      })
      loadReservations()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel reservation. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsCancelling(false)
      setSelectedReservation(null)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <PageHeader
            title="Manage Reservations"
            description="View and manage all hotel reservations"
            className="mb-6"
          />
          {user?.role === 'agent' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">View as:</span>
              <select
                value={viewAs}
                onChange={(e) => setViewAs(e.target.value as 'agent' | 'traveler')}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1 text-sm"
              >
                <option value="agent">Agent</option>
                <option value="traveler">Traveler</option>
              </select>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-8">No reservations found</div>
          ) : (
            reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={handleCancelClick}
                onMessage={(id) => router.push(`/messages/${id}`)}
              />
            ))
          )}
        </div>
      </div>

      <CancelReservationModal
        isOpen={selectedReservation !== null}
        onClose={() => setSelectedReservation(null)}
        onConfirm={handleCancelConfirm}
        isLoading={isCancelling}
      />
    </div>
  )
}
