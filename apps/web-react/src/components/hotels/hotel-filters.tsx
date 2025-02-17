"use client"
import { FC } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '../common/button'
import { useDebounce } from '../../hooks/use-debounce'
import { PriceRangeFilter } from './filters/price-range-filter'
import { RatingFilter } from './filters/rating-filter'
import { AmenitiesFilter } from './filters/amenities-filter'
import { useHotelFilters } from '../../hooks/use-hotel-filters'

export const HotelFilters: FC = () => {
  const { control, watch, updateUrl, handleClearFilters, hasActiveFilters } = useHotelFilters()

  const debouncedPriceChange = useDebounce((value: [number, number]) => {
    updateUrl({ priceRange: value })
  }, 500)

  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2"
          >
            <XMarkIcon className="h-4 w-4" />
            Clear all
          </Button>
        </div>
      )}

      <PriceRangeFilter
        control={control}
        onPriceChange={debouncedPriceChange}
        watch={watch}
      />

      <RatingFilter
        control={control}
        onRatingChange={(rating) => updateUrl({ rating })}
      />

      <AmenitiesFilter
        control={control}
        onAmenitiesChange={(amenities) => updateUrl({ amenities })}
      />
    </div>
  )
}
