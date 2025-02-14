import { Metadata } from 'next'
import { requireAuth } from '../../../lib/auth'
import { ReservationDetailClient } from './reservation-detail-client'

export const metadata: Metadata = {
  title: 'Reservation Detail | Book Inn',
  description: 'View and manage your reservation details',
}

interface ReservationDetailPageProps {
  params: {
    id: string
  }
}

export default async function ReservationDetailPage({ params }: ReservationDetailPageProps) {
  await requireAuth()
  const { id } = await params
  return <ReservationDetailClient reservationId={id} />
}
