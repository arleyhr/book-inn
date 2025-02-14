import { FC } from 'react'
import { Control, Controller } from 'react-hook-form'
import { StarIcon } from '@heroicons/react/24/solid'
import type { FilterFormData } from './types'

interface RatingFilterProps {
  control: Control<FilterFormData>
  onRatingChange: (rating: number | undefined) => void
}

export const RatingFilter: FC<RatingFilterProps> = ({ control, onRatingChange }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Rating</h3>
      <div className="flex flex-wrap gap-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <Controller
            key={rating}
            name="rating"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                onClick={() => {
                  const newValue = field.value === rating ? undefined : rating
                  field.onChange(newValue)
                  onRatingChange(newValue)
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  field.value === rating
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {rating}
                <StarIcon className="h-4 w-4" />
              </button>
            )}
          />
        ))}
      </div>
    </div>
  )
}
