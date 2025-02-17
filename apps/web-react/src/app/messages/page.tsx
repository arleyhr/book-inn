import { Metadata } from 'next'
import { requireAuth } from '../../lib/auth'
import { MessagesClient } from './messages-client'

export const metadata: Metadata = {
  title: 'Messages | Book Inn',
  description: 'View and manage your reservation messages',
}

export default async function MessagesPage() {
  await requireAuth()

  return <MessagesClient />
}
