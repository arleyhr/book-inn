export * from './lib/api-sdk';
export * from './lib/modules/auth/auth.module';
export * from './lib/modules/hotels/hotels.module';
export * from './lib/modules/reservations/reservations.module';
export * from './lib/modules/messages/messages.module';

export type {
  Hotel,
  SearchHotelsParams,
  CreateHotelDto,
  CreateRoomDto,
  CreateReviewDto,
} from './lib/modules/hotels/hotels.module';

export type {
  Reservation,
  Message,
  CreateReservationDto,
  CreateMessageDto,
  ReservationStatistics,
  CreateBookingDto,
  Booking,
} from './lib/modules/reservations/reservations.module';

export type {
  LoginDto,
  AuthResponse,
  RefreshTokenResponse,
} from './lib/modules/auth/auth.module';
