import { Metadata } from 'next'
import { requireAuth } from '../../lib/auth'
import { ManageReservationsClient } from './manage-reservations-client'

export const metadata: Metadata = {
  title: 'Manage Reservations | Book Inn',
  description: 'Manage and oversee all hotel reservations',
}

export default async function ManageReservationsPage() {
  await requireAuth()

  return <ManageReservationsClient />
}
