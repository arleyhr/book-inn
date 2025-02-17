import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../common/card'
import { Button } from '../common/button'
import { ScrollArea } from '../common/scroll-area'
import { Reservation } from '../../lib/api'
import { ReservationStatus } from './reservation-status'

interface ReservationsListProps {
  reservations: Reservation[]
  selectedReservation: string | null
  onSelectReservation: (id: string) => void
}

export function ReservationsList({
  reservations,
  selectedReservation,
  onSelectReservation
}: ReservationsListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-none">
        <CardTitle>Your Reservations</CardTitle>
        <CardDescription>Select a reservation to view messages</CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100vh-340px)]">
        <ScrollArea className="h-full">
          <div className="space-y-4 pt-2 px-3 pb-4">
            {reservations.map((reservation) => (
              <Button
                key={reservation.id}
                variant={String(selectedReservation) === String(reservation.id) ? 'default' : 'outline'}
                className="w-full h-24 justify-start shadow-sm hover:shadow transition-all"
                onClick={() => onSelectReservation(String(reservation.id))}
              >
                <div className="text-left flex flex-col">
                  <p className="font-medium">Booking #{reservation.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(reservation.createdAt), 'PPP')}
                  </p>
                  <ReservationStatus status={reservation.status} />
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
