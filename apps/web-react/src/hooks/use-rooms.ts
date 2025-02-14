import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateRoomDto } from '../lib/api'
import { getApi } from '../lib/api-config'

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ hotelId, data }: { hotelId: number, data: CreateRoomDto }) => {
      const response = await getApi().hotels.createRoom(hotelId.toString(), data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-hotels'] })
    }
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      hotelId,
      roomId,
      data
    }: {
      hotelId: number
      roomId: number
      data: Partial<CreateRoomDto>
    }) => {
      const response = await getApi().hotels.updateRoom(
        hotelId.toString(),
        roomId.toString(),
        data
      )
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-hotels'] })
    }
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ hotelId, roomId }: { hotelId: number, roomId: number }) => {
      await getApi().hotels.deleteRoom(hotelId.toString(), roomId.toString())
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-hotels'] })
    }
  })
}

export function useToggleRoomAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ hotelId, roomId }: { hotelId: number, roomId: number }) => {
      const response = await getApi().hotels.toggleRoomAvailability(hotelId.toString(), roomId.toString())
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-hotels'] })
    }
  })
}
