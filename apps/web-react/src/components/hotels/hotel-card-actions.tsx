import { PencilIcon, TrashIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { Button } from '../common/button'

interface HotelCardActionsProps {
  hotelId: number
  onEdit: (hotelId: number) => void
  onDelete: (hotelId: number) => void
  onViewReservations: (hotelId: number) => void
}

export function HotelCardActions({
  hotelId,
  onEdit,
  onDelete,
  onViewReservations
}: HotelCardActionsProps) {
  return (
    <div className="flex justify-between pt-4 mt-4 border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onEdit(hotelId)
        }}
        className="flex items-center gap-1"
      >
        <PencilIcon className="w-4 h-4" />
        Edit
      </Button>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onViewReservations(hotelId)
          }}
          className="flex items-center gap-1"
        >
          <ClipboardDocumentListIcon className="w-4 h-4" />
          Reservations
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(hotelId)
          }}
          className="flex items-center gap-1 text-red-500 hover:text-red-700"
        >
          <TrashIcon className="w-4 h-4" />
          Delete
        </Button>
      </div>
    </div>
  )
}
