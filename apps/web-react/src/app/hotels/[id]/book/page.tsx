import { Metadata } from 'next'
import { BookingConfirmationClient } from './booking-confirmation-client'

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export const metadata: Metadata = {
  title: 'Confirm Booking',
  description: 'Confirm your hotel booking'
}

export default async function BookingConfirmationPage(props: PageProps) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams])

  return <BookingConfirmationClient hotelId={params.id} searchParams={searchParams} />
}
