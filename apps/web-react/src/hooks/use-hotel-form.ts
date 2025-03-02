import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateHotel, useUpdateHotel } from './use-hotels'
import { hotelFormSchema, type HotelFormData } from '../app/manage-hotels/[id]/schemas'
import type { Hotel } from '../lib/api'

interface UseHotelFormProps {
  hotelId?: string
  initialHotel?: Hotel
}

export function useHotelForm({ hotelId, initialHotel }: UseHotelFormProps) {
  const router = useRouter()
  const createHotel = useCreateHotel()
  const updateHotel = useUpdateHotel()

  const form = useForm<HotelFormData>({
    resolver: zodResolver(hotelFormSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      country: 'Colombia',
      images: [],
      rooms: [],
      latitude: undefined,
      longitude: undefined,
      isActive: true
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rooms'
  })

  useEffect(() => {
    if (initialHotel) {
      form.reset({
        name: initialHotel.name,
        address: initialHotel.address,
        city: initialHotel.city,
        country: initialHotel.country,
        images: initialHotel.images,
        latitude: initialHotel.latitude ? Number(initialHotel.latitude) : undefined,
        longitude: initialHotel.longitude ? Number(initialHotel.longitude) : undefined,
        isActive: initialHotel.isActive,
        rooms: initialHotel.rooms.map(room => ({
          location: room.location || '',
          type: room.type,
          basePrice: room.basePrice,
          taxes: room.taxes,
          isAvailable: room.isAvailable,
          guestCapacity: room.guestCapacity || 1,
          id: Number(room.id)
        }))
      })
    }
  }, [initialHotel, form.reset])

  const onSubmit = async (data: HotelFormData) => {
    try {
      if (hotelId) {
        await updateHotel.mutateAsync({
          id: hotelId,
          data: {
            ...data,
            rooms: data.rooms?.map(room => ({
              ...room,
              basePrice: Number(room.basePrice),
              taxes: Number(room.taxes),
              isAvailable: room.isAvailable ?? true,
              guestCapacity: Number(room.guestCapacity) || 1
            })) || []
          }
        })
      } else {
        await createHotel.mutateAsync({
          ...data,
          rooms: data.rooms?.map(room => ({
            ...room,
            ...(room.id ? { id: Number(room.id) } : {}),
            basePrice: Number(room.basePrice),
            taxes: Number(room.taxes),
            isAvailable: room.isAvailable ?? true,
            guestCapacity: Number(room.guestCapacity) || 1
          })) || []
        })
      }
      router.push('/manage-hotels')
    } catch (error) {
      console.error('Error submitting hotel:', error)
    }
  }

  const addNewRoom = () => {
    append({
      type: '',
      basePrice: 0,
      taxes: 0,
      location: '',
      isAvailable: true,
      guestCapacity: 1
    })
  }

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    form.setValue('latitude', Number(location.lat), { shouldValidate: true })
    form.setValue('longitude', Number(location.lng), { shouldValidate: true })
    form.setValue('address', location.address)
  }

  return {
    form,
    fields,
    isLoadingHotel: false,
    onSubmit: form.handleSubmit(onSubmit),
    addNewRoom,
    removeRoom: remove,
    handleLocationSelect,
    watch: form.watch
  }
}
