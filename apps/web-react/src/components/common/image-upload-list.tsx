'use client'

import { useState } from 'react'
import { Button } from './button'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { getHotelImageUrl } from '../../lib/images'

interface ImageUploadListProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number,
  placeId?: string
}

export function ImageUploadList({ images = [], onChange, maxImages = 10, placeId }: ImageUploadListProps) {
  const [newImageUrl, setNewImageUrl] = useState('')

  const handleAddImage = () => {
    if (newImageUrl && images.length < maxImages) {
      onChange([...images, newImageUrl])
      setNewImageUrl('')
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddImage()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="url"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter image URL"
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <Button
          type="button"
          onClick={handleAddImage}
          disabled={!newImageUrl || images.length >= maxImages}
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={getHotelImageUrl(placeId, url)}
                alt={`Image ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No images added yet</p>
          <p className="text-sm text-gray-400">Add images using the URL input above</p>
        </div>
      )}

      {images.length >= maxImages && (
        <p className="text-sm text-yellow-600">
          Maximum number of images ({maxImages}) reached
        </p>
      )}
    </div>
  )
}
