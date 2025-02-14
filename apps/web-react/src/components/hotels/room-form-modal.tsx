'use client'

import { useState } from 'react'
import { Button } from '../common/button'
import { Modal } from '../common/modal'
import { useForm, Controller } from 'react-hook-form'
import { CreateRoomDto } from '../../lib/api'
import { ImageUploadList } from '../common/image-upload-list'

interface RoomFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateRoomDto) => Promise<void>
  initialData?: Partial<CreateRoomDto>
  title: string
}

export function RoomFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title
}: RoomFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors }, control } = useForm<CreateRoomDto>({
    defaultValues: {
      ...initialData,
      images: initialData?.images || []
    }
  })

  const onSubmitForm = async (data: CreateRoomDto) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      onClose()
    } catch (error) {
      console.error('Error submitting room:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter room name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price per Night</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  className="w-full rounded-md border border-gray-300 p-2 pl-7 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Capacity</label>
              <div className="relative">
                <input
                  type="number"
                  {...register('capacity', {
                    required: 'Capacity is required',
                    min: { value: 1, message: 'Capacity must be at least 1' }
                  })}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter room capacity"
                />
                <span className="absolute right-3 top-2 text-gray-500">guests</span>
              </div>
              {errors.capacity && (
                <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter room description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Room Images</label>
            <Controller
              name="images"
              control={control}
              rules={{ required: 'At least one image is required' }}
              render={({ field: { value, onChange } }) => (
                <ImageUploadList
                  images={value}
                  onChange={onChange}
                  maxImages={5}
                />
              )}
            />
            {errors.images && (
              <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Room'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
