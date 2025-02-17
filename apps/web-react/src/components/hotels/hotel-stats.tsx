import { ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

interface HotelStatsProps {
  occupancyStats?: {
    occupancyRate: number
    occupiedRooms: number
    totalRooms: number
  } | null
  revenueStats?: {
    totalRevenue: number
    totalBookings: number
  } | null
  isLoading?: boolean
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const calculateOccupancyRate = (occupiedRooms: number, totalRooms: number) => {
  if (totalRooms === 0) return 0
  return (occupiedRooms / totalRooms) * 100
}

export function HotelStats({ occupancyStats, revenueStats, isLoading }: HotelStatsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {occupancyStats && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <ChartBarIcon className="w-4 h-4 text-blue-500" />
            Occupancy Rate
          </h4>
          <p className="text-2xl font-bold">
            {calculateOccupancyRate(occupancyStats.occupiedRooms, occupancyStats.totalRooms).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">
            {occupancyStats.occupiedRooms} of {occupancyStats.totalRooms} rooms occupied
          </p>
        </div>
      )}

      {revenueStats && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
            Revenue (30 days)
          </h4>
          <p className="text-2xl font-bold">
            {formatCurrency(revenueStats.totalRevenue)}
          </p>
          <p className="text-sm text-gray-500">
            {revenueStats.totalBookings} bookings
          </p>
        </div>
      )}
    </div>
  )
}
