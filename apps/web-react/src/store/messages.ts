import { create } from 'zustand'
import type { Message, Reservation } from '../lib/api'
import { getApi } from '../lib/api-config'
import { useAuthStore } from './auth'

interface MessagesState {
  messages: Message[]
  reservations: Reservation[]
  selectedReservationId: string | null
  isLoading: boolean
  isSending: boolean
  error: string | null
  setSelectedReservationId: (id: string | null) => void
  loadReservations: () => Promise<void>
  loadMessages: (reservationId: string) => Promise<void>
  sendMessage: (reservationId: string, message: string) => Promise<void>
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [],
  reservations: [],
  selectedReservationId: null,
  isLoading: true,
  isSending: false,
  error: null,
  setSelectedReservationId: (id) => set({ selectedReservationId: id }),
  loadReservations: async () => {
    try {
      set({ isLoading: true, error: null })
      const role = useAuthStore.getState().user?.role;
      const isAgent = role === 'agent';
      const data = isAgent ? await getApi().reservations.getReservationsWithMessages() : await getApi().reservations.getReservations();

      set({
        reservations: data as any,
        selectedReservationId: data.length > 0 ? String(data[0].id) : null,
        isLoading: false
      })
    } catch (error) {
      set({ error: 'Failed to load reservations', isLoading: false })
    }
  },
  loadMessages: async (reservationId: string) => {
    try {
      const data = await getApi().messages.getReservationMessages(reservationId)
      set({ messages: data as any, error: null })
    } catch (error) {
      set({ error: 'Failed to load messages' })
    }
  },
  sendMessage: async (reservationId: string, message: string) => {
    try {
      set({ isSending: true, error: null })
      await getApi().messages.sendMessage({
        reservationId: Number(reservationId),
        message: message.trim()
      })
      await get().loadMessages(reservationId)
      set({ isSending: false })
      return Promise.resolve()
    } catch (error) {
      set({ error: 'Failed to send message', isSending: false })
      return Promise.reject(error)
    }
  }
}))
