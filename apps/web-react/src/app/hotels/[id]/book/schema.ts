import { z } from 'zod'

const phoneRegex = /^\+?[1-9]\d{1,14}$/

export const guestFormSchema = z.object({
  guestName: z
    .string()
    .min(1, 'Guest name is required')
    .min(3, 'Guest name must be at least 3 characters')
    .max(100, 'Guest name must be at most 100 characters'),
  guestEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(100, 'Email must be at most 100 characters'),
  guestPhone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Please enter a valid phone number (e.g., +1234567890)')
    .max(20, 'Phone number must be at most 20 characters'),
  emergencyContactName: z
    .string()
    .min(1, 'Emergency contact name is required')
    .min(3, 'Emergency contact name must be at least 3 characters')
    .max(100, 'Emergency contact name must be at most 100 characters'),
  emergencyContactPhone: z
    .string()
    .min(1, 'Emergency contact phone is required')
    .regex(phoneRegex, 'Please enter a valid phone number (e.g., +1234567890)')
    .max(20, 'Emergency contact phone must be at most 20 characters'),
  specialRequests: z
    .string()
    .max(500, 'Special requests must be at most 500 characters')
    .optional()
})

export type GuestFormData = z.infer<typeof guestFormSchema>
