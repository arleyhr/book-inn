import { z } from 'zod'

export const roomSchema = z.object({
  type: z.string().min(1, 'Room type is required'),
  basePrice: z.number().min(0, 'Price must be positive'),
  taxes: z.number().min(0, 'Taxes must be positive'),
  location: z.string().min(1, 'Room location is required'),
  isAvailable: z.boolean().default(true),
  guestCapacity: z.number().min(1, 'Guest capacity must be at least 1').default(1),
  id: z.number().optional()
})

export const hotelFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  rooms: z.array(roomSchema).optional().default([]),
  latitude: z.number().min(-90).max(90).transform(val => Number(val.toFixed(6))).optional(),
  longitude: z.number().min(-180).max(180).transform(val => Number(val.toFixed(6))).optional(),
  isActive: z.boolean().default(true)
})

export type HotelFormData = z.infer<typeof hotelFormSchema>
export type RoomFormData = z.infer<typeof roomSchema>
