import { z } from 'zod';

export interface Hotel {
  value: string;
  label: string;
  description: string;
  image: string;
}

export interface SearchBarProps {
  onSearch: (searchParams: SearchParams) => void;
  className?: string;
}

export interface SearchParams {
  hotel: string;
  checkIn: string;
  checkOut: string;
}

export const searchFormSchema = z.object({
  hotel: z.string().min(1, 'Please select a hotel'),
  checkIn: z.string().min(1, 'Please select a check-in date'),
  checkOut: z.string().min(1, 'Please select a check-out date')
}).refine((data) => {
  if (!data.checkIn || !data.checkOut) return true;
  return new Date(data.checkOut) > new Date(data.checkIn);
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"]
});

export type SearchFormData = z.infer<typeof searchFormSchema>;
