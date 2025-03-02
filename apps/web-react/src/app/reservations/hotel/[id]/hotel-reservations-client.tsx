'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getApi } from '../../../../lib/api-config'
import { useToast } from '../../../../components/common/use-toast'
import { Button } from '../../../../components/common/button'
import { PageHeader } from '../../../../components/common/page-header'
import { ReservationCard } from '../../../../components/reservations/reservation-card'
import { CancelReservationModal } from '../../../../components/reservations/cancel-reservation-modal'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import type { Reservation } from '../../../../lib/api'

interface HotelReservationsClientProps {
  hotelId: string
}

export function HotelReservationsClient({ hotelId }: HotelReservationsClientProps) {
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState<number | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadReservations()
  }, [hotelId])

  const loadReservations = async () => {
    try {
      const data = await getApi().reservations.getReservationsByHotelId(+hotelId)
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

  const handleCancelClick = async (id: number) => {
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

  const handleMessage = (id: number) => {
    router.push(`/messages/${id}`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>

        <PageHeader
          title="Hotel Reservations"
          description="View and manage reservations for this hotel"
          className="mb-6"
        />

        <div className="space-y-4">
          {reservations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No reservations found</p>
            </div>
          ) : (
            reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={handleCancelClick}
                onMessage={handleMessage}
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
