import { FC } from 'react'

export const EmptyHotelList: FC = () => {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold text-gray-900">No hotels found</h3>
      <p className="mt-2 text-gray-600">Try adjusting your search criteria</p>
    </div>
  )
}
