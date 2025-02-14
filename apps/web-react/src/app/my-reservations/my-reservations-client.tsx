'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '../../components/common/card'
import { Button } from '../../components/common/button'
import { Skeleton } from '../../components/common/skeleton'
import { PageHeader } from '../../components/common/page-header'
import { useReservations } from '../../hooks/use-reservations'
import { ReservationCard } from '../../components/reservations/reservation-card'
import { CancelReservationModal } from '../../components/reservations/cancel-reservation-modal'

export function MyReservationsClient() {
  const router = useRouter()
  const { reservations, isLoading, loadReservations, cancelReservation } = useReservations()
  const [selectedReservation, setSelectedReservation] = useState<number | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    loadReservations()
  }, [router, loadReservations])

  const handleMessage = (id: number) => {
    router.push(`/messages?reservation=${id}`)
  }

  const handleCancelClick = async (id: number) => {
    setSelectedReservation(id)
  }

  const handleCancelConfirm = async (reason: string) => {
    if (!selectedReservation) return

    try {
      setIsCancelling(true)
      await cancelReservation(selectedReservation, reason)
    } finally {
      setIsCancelling(false)
      setSelectedReservation(null)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen pt-2 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  if (reservations.length === 0) {
    return (
      <main className="min-h-screen pt-2 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="py-16 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    No Reservations Found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You don&apos;t have any reservations yet. Book a hotel to get started.
                  </p>
                  <Button onClick={() => router.push('/')}>Book a Hotel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-2 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-6">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="My Reservations"
            description="View and manage your hotel reservations"
            className="mb-6"
          />
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={handleCancelClick}
                onMessage={handleMessage}
              />
            ))}
          </div>
        </div>
      </div>

      <CancelReservationModal
        isOpen={selectedReservation !== null}
        onClose={() => setSelectedReservation(null)}
        onConfirm={handleCancelConfirm}
        isLoading={isCancelling}
      />
    </main>
  )
}
