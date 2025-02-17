import { Metadata } from 'next'
import { requireAuth } from '../../lib/auth'
import { MyReservationsClient } from './my-reservations-client'

export const metadata: Metadata = {
  title: 'My Reservations | Book Inn',
  description: 'View and manage your hotel reservations',
}

export default async function MyReservationsPage() {
  await requireAuth()

  return <MyReservationsClient />
}
