import { getApi } from './api-config'
import type {
  CreateBookingDto as SDKCreateBookingDto,
  Booking as SDKBooking,
  CreateReservationDto as SDKCreateReservationDto,
  Reservation as SDKReservation,
  Hotel,
  AuthResponse,
  SearchHotelsParams,
} from '@book-inn/api-sdk'

export type {
  AuthResponse,
  Hotel,
  Message,
  CreateMessageDto,
  ReservationStatistics,
  CreateHotelDto,
  CreateRoomDto,
  CreateReviewDto,
} from '@book-inn/api-sdk'

export type Room = Hotel['rooms'][0]
export type Review = Hotel['reviews'][0]
export type Amenity = Hotel['amenities'][0]

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto extends LoginDto {
  firstName: string
  lastName: string
  role: string
}


export type CreateBookingDto = SDKCreateBookingDto
export type Booking = SDKBooking

export interface CreateReservationDto extends Omit<SDKCreateReservationDto, 'checkIn' | 'checkOut'> {
  checkInDate: string
  checkOutDate: string
  guestCount?: number
}

export interface Reservation extends Omit<SDKReservation, 'checkIn' | 'checkOut'> {
  checkInDate: string
  checkOutDate: string
}

export const searchHotels = async (searchParamsString: string) => {
  try {
    if (searchParamsString.startsWith('name=')) {
      const nameValue = searchParamsString.substring(5).trim()
      return await getApi().hotels.search({ name: nameValue })
    }

    const searchParams = new URLSearchParams(searchParamsString)
    const params: SearchHotelsParams = {}

    if (searchParams.has('city')) params.city = searchParams.get('city') || undefined
    if (searchParams.has('country')) params.country = searchParams.get('country') || undefined
    if (searchParams.has('checkIn')) params.checkIn = searchParams.get('checkIn') || undefined
    if (searchParams.has('checkOut')) params.checkOut = searchParams.get('checkOut') || undefined
    if (searchParams.has('name')) params.name = searchParams.get('name') || undefined
    if (searchParams.has('minPrice')) params.minPrice = Number(searchParams.get('minPrice'))
    if (searchParams.has('maxPrice')) params.maxPrice = Number(searchParams.get('maxPrice'))
    if (searchParams.has('rating')) params.rating = Number(searchParams.get('rating'))
    if (searchParams.has('amenities')) params.amenities = searchParams.get('amenities') || undefined
    if (searchParams.has('guests')) params.guests = Number(searchParams.get('guests'))

    return await getApi().hotels.search(params)
  } catch (error) {
    console.error('Search hotels error:', error)
    throw getApi().handleError(error)
  }
}

export const fetchHotels = async (searchParams: SearchHotelsParams): Promise<Hotel[]> => {
  try {
    return await getApi().hotels.getHotels(searchParams)
  } catch (error) {
    throw getApi().handleError(error)
  }
}

export const fetchHotelById = async (id: string): Promise<Hotel> => {
  try {
    return await getApi().hotels.getHotel(id)
  } catch (error) {
    throw getApi().handleError(error)
  }
}

export const fetchFeaturedHotels = async (limit = 4): Promise<Hotel[]> => {
  try {
    return await getApi().hotels.getFeatured(limit)
  } catch (error) {
    throw getApi().handleError(error)
  }
}

export const login = async (data: LoginDto) => {
  try {
    const response = await getApi().auth.login(data)
    const apiResponse = response as unknown as AuthResponse
    return {
      accessToken: apiResponse.access_token,
      refreshToken: apiResponse.refresh_token,
      user: {
        ...apiResponse.user,
        firstName: apiResponse.user.firstName || '',
        lastName: apiResponse.user.lastName || '',
      }
    }
  } catch (error) {
    throw getApi().handleError(error)
  }
}

export const register = async (data: RegisterDto) => {
  try {
    const response = await getApi().auth.register(data)
    const apiResponse = response as unknown as AuthResponse
    return {
      accessToken: apiResponse.access_token,
      refreshToken: apiResponse.refresh_token,
      user: {
        ...apiResponse.user,
        firstName: apiResponse.user.firstName || '',
        lastName: apiResponse.user.lastName || '',
      }
    }
  } catch (error) {
    throw getApi().handleError(error)
  }
}

export const createReservation = async (data: CreateReservationDto) => {
  try {
    return await getApi().reservations.createReservation(data)
  } catch (error) {
    throw getApi().handleError(error)
  }
}
