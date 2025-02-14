import { Metadata } from 'next'
import { HotelFormClient } from '../[id]/hotel-form-client'
import { requireAuth } from '../../../lib/auth'

export const metadata: Metadata = {
  title: 'New Hotel | Book Inn',
  description: 'Create a new hotel and add rooms',
}

export default async function NewHotelPage() {
  await requireAuth()
  return <HotelFormClient />
}
