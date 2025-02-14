import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { filterSchema, type FilterFormData } from '../components/hotels/filters/types'
import { useCallback } from 'react'

export const useHotelFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { control, reset, watch } = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      priceRange: [
        Number(searchParams.get('minPrice')) || 0,
        Number(searchParams.get('maxPrice')) || 1000
      ],
      rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
      amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
    },
  })

  const updateUrl = useCallback((updates: Partial<FilterFormData>) => {
    const params = new URLSearchParams(searchParams.toString())

    if ('priceRange' in updates) {
      params.set('minPrice', updates.priceRange![0].toString())
      params.set('maxPrice', updates.priceRange![1].toString())
    }

    if ('rating' in updates) {
      if (updates.rating) {
        params.set('rating', updates.rating.toString())
      } else {
        params.delete('rating')
      }
    }

    if ('amenities' in updates) {
      if (updates.amenities!.length > 0) {
        params.set('amenities', updates.amenities!.join(','))
      } else {
        params.delete('amenities')
      }
    }

    router.push(`/hotels?${params.toString()}`)
  }, [router, searchParams])

  const handleClearFilters = useCallback(() => {
    reset({
      priceRange: [0, 1000],
      rating: undefined,
      amenities: [],
    })
    const params = new URLSearchParams(searchParams.toString())
    params.delete('minPrice')
    params.delete('maxPrice')
    params.delete('rating')
    params.delete('amenities')
    router.push(`/hotels?${params.toString()}`)
  }, [reset, router, searchParams])

  const hasActiveFilters = searchParams.has('minPrice') ||
    searchParams.has('maxPrice') ||
    searchParams.has('rating') ||
    searchParams.has('amenities')

  return {
    control,
    watch,
    updateUrl,
    handleClearFilters,
    hasActiveFilters
  }
}
