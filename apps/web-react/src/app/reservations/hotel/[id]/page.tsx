import { Metadata } from 'next'
import { requireAuth } from '../../../../lib/auth'
import { HotelReservationsClient } from './hotel-reservations-client'

export const metadata: Metadata = {
  title: 'Hotel Reservations | Book Inn',
  description: 'View and manage hotel reservations',
}

interface HotelReservationsPageProps {
  params: {
    id: string
  }
}

export default async function HotelReservationsPage({ params }: HotelReservationsPageProps) {
  await requireAuth()
  const { id } = await params
  return <HotelReservationsClient hotelId={id} />
}
