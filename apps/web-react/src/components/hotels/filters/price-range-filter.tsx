import { FC } from 'react'
import { Control, Controller } from 'react-hook-form'
import { Slider } from '../../common/slider'
import type { FilterFormData } from './types'

interface PriceRangeFilterProps {
  control: Control<FilterFormData>
  onPriceChange: (value: [number, number]) => void
  watch: (name: 'priceRange') => [number, number]
}

export const PriceRangeFilter: FC<PriceRangeFilterProps> = ({ control, onPriceChange, watch }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Price Range</h3>
      <Controller
        name="priceRange"
        control={control}
        render={({ field }) => (
          <Slider
            value={field.value}
            min={0}
            max={1000}
            step={50}
            onValueChange={field.onChange}
            onValueChangeEnd={onPriceChange}
          />
        )}
      />
      <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
        <span>${watch('priceRange')[0]}</span>
        <span>${watch('priceRange')[1]}+</span>
      </div>
    </div>
  )
}
