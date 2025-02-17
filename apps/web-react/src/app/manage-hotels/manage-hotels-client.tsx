'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { PageHeader } from '../../components/common/page-header'
import { Button } from '../../components/common/button'
import { PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { useHotelManagementStore } from '../../store/hotel-management'
import { ManageHotelCard } from '../../components/hotels/manage-hotel-card'
import type { Hotel } from '../../lib/api'

interface ManageHotelsClientProps {
  initialHotels: Hotel[]
}

export function ManageHotelsClient({ initialHotels }: ManageHotelsClientProps) {
  const router = useRouter()
  const {
    hotels,
    selectedHotel,
    occupancyStats,
    revenueStats,
    isLoadingStats,
    isLoadingHotels,
    error,
    setSelectedHotel,
    toggleRoomAvailability,
    deleteHotel,
    initializeHotels
  } = useHotelManagementStore()

  useEffect(() => {
    initializeHotels(initialHotels)
  }, [initializeHotels, initialHotels])

  const handleDeleteHotel = async (id: number) => {
    if (confirm('Are you sure you want to delete this hotel?')) {
      await deleteHotel(id)
    }
  }

  if (isLoadingHotels) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <PageHeader
          title="Manage Hotels"
          description="View and manage your hotel portfolio"
        />
        <Button onClick={() => router.push('/manage-hotels/new')} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Add Hotel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {hotels?.map((hotel) => (
          <ManageHotelCard
            key={hotel.id}
            hotel={hotel}
            isSelected={selectedHotel?.id === hotel.id}
            onSelect={setSelectedHotel}
            onToggleRoom={toggleRoomAvailability}
            onEdit={(id) => router.push(`/manage-hotels/${id}`)}
            onDelete={handleDeleteHotel}
            onViewReservations={(id) => router.push(`/reservations/hotel/${id}`)}
            occupancyStats={selectedHotel?.id === hotel.id ? occupancyStats : null}
            revenueStats={selectedHotel?.id === hotel.id ? revenueStats : null}
            isLoadingStats={selectedHotel?.id === hotel.id ? isLoadingStats : false}
          />
        ))}

        {hotels?.length === 0 && (
          <div className="col-span-full">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <BuildingOfficeIcon className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hotels</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new hotel.</p>
              <div className="mt-6">
                <Button onClick={() => router.push('/manage-hotels/new')}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Hotel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
