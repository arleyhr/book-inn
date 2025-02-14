'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../../store/auth'
import { useMessagesStore } from '../../../store/messages'
import { useToast } from '../../../components/common/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/card'
import { ScrollArea } from '../../../components/common/scroll-area'
import { MessagesList } from '../../../components/messages/messages-list'
import { MessageInput } from '../../../components/messages/message-input'
import { PageHeader } from '../../../components/common/page-header'
import { useMessageForm } from '../../../hooks/use-message-form'
import type { Reservation } from '../../../lib/api'
import { getApi } from '../../../lib/api-config'

interface MessageDetailClientProps {
  reservationId: string
}

export function MessageDetailClient({ reservationId }: MessageDetailClientProps) {
  const { user } = useAuthStore()
  const {
    messages,
    loadMessages,
    error,
    isSending
  } = useMessagesStore()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { form, onSubmit } = useMessageForm(reservationId)

  useEffect(() => {
    loadData()
  }, [reservationId])

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
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [, reservationData] = await Promise.all([
        loadMessages(reservationId),
        getApi().reservations.getReservation(Number(reservationId))
      ])
      setReservation(reservationData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load messages. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isReservationActive = (reservation: Reservation | null) => {
    if (!reservation) return false
    return reservation.status !== 'cancelled' && reservation.status !== 'completed'
  }

  return (
    <main className="min-h-screen pt-2 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Conversation"
            description="View and manage your conversation"
            className="mb-6"
          />
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              {reservation?.status === 'cancelled' && (
                <div className="mt-2 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    This reservation has been cancelled.
                    {reservation.cancellationReason && (
                      <>
                        <br />
                        <span className="font-medium">Reason:</span> {reservation.cancellationReason}
                      </>
                    )}
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col h-[calc(100vh-300px)]">
                <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
                  {isLoading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">No messages yet</div>
                  ) : (
                    <MessagesList
                      messages={messages}
                      currentUser={user}
                      messagesEndRef={null}
                    />
                  )}
                </ScrollArea>
                {isReservationActive(reservation) ? (
                  <MessageInput
                    form={form}
                    onSubmit={onSubmit}
                    isSending={isSending}
                  />
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      This conversation is closed as the reservation is no longer active.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
