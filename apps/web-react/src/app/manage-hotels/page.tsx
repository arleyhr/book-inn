import { Metadata } from 'next'
import { requireAuth } from '../../lib/auth'
import { getServerApi } from '../../lib/server-api'
import { ManageHotelsClient } from './manage-hotels-client'

export const metadata: Metadata = {
  title: 'Manage Hotels | Book Inn',
  description: 'Manage and oversee all hotels in the system',
}

export default async function ManageHotelsPage() {
  await requireAuth()

  const api = await getServerApi()
  const initialHotels = await api.hotels.getAgentHotels()

  return <ManageHotelsClient initialHotels={initialHotels} />
}
