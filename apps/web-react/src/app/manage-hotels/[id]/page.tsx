import { Metadata } from 'next'
import { HotelFormClient } from './hotel-form-client'
import { requireAuth } from '../../../lib/auth'
import { getServerApi } from '../../../lib/server-api'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Edit Hotel | Book Inn',
  description: 'Edit hotel details and manage rooms',
}

export default async function EditHotelPage({ params }: { params: { id: string } }) {
  await requireAuth()

  try {
    const api = await getServerApi()
    const hotel = await api.hotels.getHotel(params.id)
    return <HotelFormClient hotelId={params.id} initialHotel={hotel} />
  } catch (error) {
    notFound()
  }
}
