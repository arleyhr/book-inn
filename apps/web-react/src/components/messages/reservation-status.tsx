interface ReservationStatusProps {
  status: string
}

export function ReservationStatus({ status }: ReservationStatusProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  return (
    <span className={`text-xs mt-1 px-2 py-1 rounded-full ${getStatusStyles()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
