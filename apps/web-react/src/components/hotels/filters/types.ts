import { z } from 'zod'

export const filterSchema = z.object({
  priceRange: z.tuple([z.number(), z.number()]),
  rating: z.number().optional(),
  amenities: z.array(z.string()),
})

export type FilterFormData = z.infer<typeof filterSchema>
