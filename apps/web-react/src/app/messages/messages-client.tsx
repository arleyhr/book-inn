'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/common/card'
import { Button } from '../../components/common/button'
import { Skeleton } from '../../components/common/skeleton'
import { useToast } from '../../components/common/use-toast'
import { useAuthStore } from '../../store/auth'
import { useMessagesStore } from '../../store/messages'
import { MessagesList } from '../../components/messages/messages-list'
import { ReservationsList } from '../../components/messages/reservations-list'
import { MessageInput } from '../../components/messages/message-input'
import { PageHeader } from '../../components/common/page-header'
import { useMessageForm } from '../../hooks/use-message-form'

export function MessagesClient() {
  const router = useRouter()
  const { accessToken, user } = useAuthStore()
  const {
    messages,
    reservations,
    selectedReservationId,
    isLoading,
    error,
    loadReservations,
    loadMessages,
    setSelectedReservationId
  } = useMessagesStore()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { form, onSubmit, isSending } = useMessageForm(selectedReservationId)

  useEffect(() => {
    if (!accessToken) {
      router.push('/')
      return
    }
    loadReservations()
  }, [accessToken, router, loadReservations])

  useEffect(() => {
    if (selectedReservationId) {
      loadMessages(selectedReservationId)
    }
  }, [selectedReservationId, loadMessages])

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
    }
  }, [error, toast])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      })
    }
  }, [messages])

  const isReservationActive = (reservation: any) => {
    return reservation.status !== 'cancelled' && reservation.status !== 'completed'
  }

  if (isLoading) {
    return (
      <main className="min-h-screen pt-2 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="container mx-auto py-6">
          <div className="h-full max-w-6xl mx-auto grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <Card className="h-full">
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-8">
              <Card className="h-full">
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
        </div>
      </main>
    )
  }

  if (reservations.length === 0) {
    return (
      <main className="min-h-screen pt-2 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="container mx-auto py-6">
          <div className="h-full max-w-6xl mx-auto">
            <Card>
              <CardContent className="py-16 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    No Reservations Found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You don&apos;t have any reservations yet. Book a hotel to start messaging.
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

  const selectedReservationData = reservations.find(r => String(r.id) === selectedReservationId)

  return (
    <div className="min-h-screen pt-2 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-6">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="Messages"
            description="Communicate with hotel staff about your reservations"
            className="mb-4"
          />
          <div className="h-[calc(100vh-180px)] grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4">
              <ReservationsList
                reservations={reservations}
                selectedReservation={selectedReservationId}
                onSelectReservation={setSelectedReservationId}
              />
            </div>

            <div className="col-span-12 md:col-span-8">
              <Card className="h-full">
                <CardHeader className="flex-none border-b">
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>
                    {selectedReservationData
                      ? `Viewing messages for Booking #${selectedReservationData.id}`
                      : 'Select a reservation to view messages'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-[calc(100vh-340px)]">
                  <MessagesList
                    messages={messages}
                    currentUser={user}
                    messagesEndRef={messagesEndRef}
                  />
                  {selectedReservationData && isReservationActive(selectedReservationData) && (
                    <MessageInput
                      form={form}
                      onSubmit={onSubmit}
                      isSending={isSending}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
