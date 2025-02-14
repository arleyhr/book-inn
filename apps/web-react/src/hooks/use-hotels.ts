import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateHotelDto } from '../lib/api'
import { getApi } from '../lib/api-config'


export function useHotels() {
  return useQuery({
    queryKey: ['agent-hotels'],
    queryFn: async () => {
      const response = await getApi().hotels.getAgentHotels()
      return response
    },
  })
}

export function useHotel(id: string | number) {
  const hotelId = typeof id === 'string' ? parseInt(id, 10) : id

  return useQuery({
    queryKey: ['hotels', hotelId],
    queryFn: async () => {
      const response = await getApi().hotels.getById(hotelId.toString())
      return response
    },
    enabled: !isNaN(hotelId),
  })
}

export function useCreateHotel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateHotelDto) => {
      const response = await getApi().hotels.createHotel(data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-hotels'] })
    },
  })
}

export function useUpdateHotel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number
      data: Partial<CreateHotelDto>
    }) => {
      const hotelId = typeof id === 'string' ? parseInt(id, 10) : id
      const response = await getApi().hotels.updateHotel(hotelId.toString(), data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-hotels'] })
      queryClient.invalidateQueries({ queryKey: ['hotels'] })
    },
  })
}

export function useDeleteHotel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string | number) => {
      const hotelId = typeof id === 'string' ? parseInt(id, 10) : id
      await getApi().hotels.deleteHotel(hotelId.toString())
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-hotels'] })
    },
  })
}
