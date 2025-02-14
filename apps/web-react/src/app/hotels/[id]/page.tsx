import { notFound } from 'next/navigation'
import { fetchHotelById } from '../../../lib/api'
import { getHotelImageUrl } from '../../../lib/images'
import { HotelDetailClient } from './hotel-detail-client'

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function HotelPage(props: Promise<PageProps>) {
  const { params, searchParams } = await props
  const hotel = await fetchHotelById(params.id)

  if (!hotel || !hotel.name) {
    notFound()
  }

  const defaultHotelData = {
    ...hotel,
    images: (hotel.images || []).map(image => getHotelImageUrl(hotel.placeId, image)),
    rating: Number(hotel.rating || 0),
    reviews: hotel.reviews || [],
    amenities: hotel.amenities || [],
    rooms: (hotel.rooms || []).map(room => ({
      ...room,
      basePrice: Number(room.basePrice || 0),
      taxes: Number(room.taxes || 0),
      isAvailable: Boolean(room.isAvailable)
    }))
  }

  return (
    <HotelDetailClient
      hotel={defaultHotelData}
      initialCheckIn={searchParams.checkIn as string | undefined}
      initialCheckOut={searchParams.checkOut as string | undefined}
    />
  )
}
