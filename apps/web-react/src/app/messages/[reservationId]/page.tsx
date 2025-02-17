import { Metadata } from 'next'
import { requireAuth } from '../../../lib/auth'
import { MessageDetailClient } from './message-detail-client'

export const metadata: Metadata = {
  title: 'Message Detail | Book Inn',
  description: 'View and manage your conversation',
}

interface MessageDetailPageProps {
  params: {
    reservationId: string
  }
}

export default async function MessageDetailPage({ params }: MessageDetailPageProps) {
  await requireAuth()
  const { reservationId } = await params
  return <MessageDetailClient reservationId={reservationId} />
}
