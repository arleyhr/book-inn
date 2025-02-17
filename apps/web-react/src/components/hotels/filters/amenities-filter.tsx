import { FC } from 'react'
import { Control, Controller } from 'react-hook-form'
import { Checkbox } from '../../common/checkbox'
import type { FilterFormData } from './types'

interface AmenitiesFilterProps {
  control: Control<FilterFormData>
  onAmenitiesChange: (amenities: string[]) => void
}

const amenities = [
  { id: 'wifi', label: 'Free WiFi' },
  { id: 'parking', label: 'Parking' },
  { id: 'pool', label: 'Swimming Pool' },
  { id: 'spa', label: 'Spa' },
  { id: 'gym', label: 'Fitness Center' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'bar', label: 'Bar' },
  { id: 'room-service', label: 'Room Service' },
]

export const AmenitiesFilter: FC<AmenitiesFilterProps> = ({ control, onAmenitiesChange }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Amenities</h3>
      <div className="space-y-3">
        {amenities.map((amenity) => (
          <Controller
            key={amenity.id}
            name="amenities"
            control={control}
            render={({ field }) => (
              <div className="flex items-center">
                <Checkbox
                  id={amenity.id}
                  checked={field.value.includes(amenity.id)}
                  onCheckedChange={(checked) => {
                    const newValue = checked
                      ? [...field.value, amenity.id]
                      : field.value.filter((id: string) => id !== amenity.id)
                    field.onChange(newValue)
                    onAmenitiesChange(newValue)
                  }}
                />
                <label
                  htmlFor={amenity.id}
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {amenity.label}
                </label>
              </div>
            )}
          />
        ))}
      </div>
    </div>
  )
}
