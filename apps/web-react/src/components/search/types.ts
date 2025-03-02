import { z } from 'zod';
import type { Hotel } from '../../lib/api';

export interface SearchHotel {
  value: string;
  label: string;
  description: string;
  image: string;
  details?: Hotel;
}

export interface SearchParams {
  hotel?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export interface SearchBarProps {
  onSearch: (searchParams: SearchParams) => void;
  className?: string;
}

export const searchFormSchema = z.object({
  hotel: z.string().min(1, 'Please select a hotel'),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.number().min(1).optional(),
});

export type SearchFormData = z.infer<typeof searchFormSchema>;
