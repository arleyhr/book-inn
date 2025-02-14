import { getServerApi } from './server-api'

export async function getFeaturedHotels() {
  try {
    const api = await getServerApi()
    return api.hotels.getFeatured(5)
  } catch (error) {
    console.error('Error in getFeaturedHotels:', error)
    throw error
  }
}

export async function getHotelById(id: string) {
  try {
    const api = await getServerApi()
    return api.hotels.getById(id)
  } catch (error) {
    console.error('Error in getHotelById:', error)
    throw error
  }
}

export async function getReservations() {
  try {
    const api = await getServerApi()
    return api.reservations.getReservations()
  } catch (error) {
    console.error('Error in getReservations:', error)
    throw error
  }
}

export async function getMessages(reservationId: string) {
  try {
    const api = await getServerApi()
    return api.reservations.getMessages(reservationId)
  } catch (error) {
    console.error('Error in getMessages:', error)
    throw error
  }
}
