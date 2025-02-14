"use client"
import { FC } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { searchHotels } from '../../lib/api'
import { HotelCard } from './hotel-card'
import { HotelListSkeleton } from './hotel-list-skeleton'
import { EmptyHotelList } from './empty-hotel-list'
import type { Hotel } from '../../lib/api'

interface HotelListProps {
  initialHotels: Hotel[]
}

export const HotelList: FC<HotelListProps> = ({ initialHotels }) => {
  const searchParams = useSearchParams()
  const { data: hotels, isLoading } = useQuery({
    queryKey: ['searchHotels', searchParams.toString()],
    queryFn: () => searchHotels(searchParams.toString()),
    initialData: initialHotels,
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading && !hotels) {
    return <HotelListSkeleton />
  }

  if (!hotels?.length) {
    return <EmptyHotelList />
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {hotels?.map((hotel: Hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  )
}
