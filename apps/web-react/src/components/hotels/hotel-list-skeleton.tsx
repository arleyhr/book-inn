import { FC } from 'react'
import { Skeleton } from '../common/skeleton'

export const HotelListSkeleton: FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/30 p-4">
          <div className="flex gap-4">
            <Skeleton className="h-48 w-72 rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
