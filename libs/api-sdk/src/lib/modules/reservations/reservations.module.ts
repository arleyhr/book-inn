import { HttpClient } from '../../client';
import { Hotel } from '../hotels/hotels.module';

export interface Room {
  id: number;
  type: string;
  basePrice: number;
  taxes: number;
  location: string;
  isAvailable: boolean;
}

export interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  userId: string;
  hotelId: string;
  roomId: string;
  messages: Message[];
  room: Room;
  hotel: Hotel;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  guestCount: number;
  cancellationReason: string;
  cancelledAt: string;
  cancelledBy: string;
  cancelledByUser: string;
  confirmedAt: string;
  confirmedBy: string;
  confirmedByUser: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  reservationId: string;
  createdAt: string;
}

export interface CreateReservationDto {
  checkIn: string;
  checkOut: string;
  guests: number;
  hotelId: string;
  roomId: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  guestCount: number;
}

export interface CreateMessageDto {
  content: string;
}

export interface OccupancyStats {
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  upcomingReservations: number;
}

export interface RevenueStats {
  totalRevenue: number;
  periodRevenue: number;
  averageRoomRate: number;
  reservationsCount: number;
}

export interface ReservationStatistics {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

export interface CreateBookingDto {
  hotelId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}

export interface Booking extends CreateBookingDto {
  id: number;
  userId: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface CancelReservationDto {
  reservationId: number;
  reason: string;
}

export interface ConfirmReservationDto {
  reservationId: number;
}

export interface ListReservationsDto {
  hotelId?: number;
  startDate?: string;
  endDate?: string;
}

export class ReservationsModule {
  constructor(private readonly http: HttpClient) {}

  async getReservations(role?: 'agent' | 'traveler'): Promise<Reservation[]> {
    const response = await this.http.get<Reservation[]>(`/reservations`, { params: { role } });
    return response.data;
  }

  async getReservationsByHotelId(hotelId: number): Promise<Reservation[]> {
    const response = await this.http.get<Reservation[]>(`/reservations/hotel/${hotelId}`);
    return response.data;
  }

  async getReservation(id: number): Promise<Reservation> {
    const response = await this.http.get<Reservation>(`/reservations/${id}`);
    return response.data;
  }

  async createReservation(data: CreateReservationDto): Promise<Reservation> {
    const response = await this.http.post<Reservation>('/reservations', {...data, roomId: +data.roomId });
    return response.data;
  }

  async updateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation> {
    const response = await this.http.patch<Reservation>(`/reservations/${id}/status`, { status });
    return response.data;
  }

  async cancelReservation(id: string): Promise<Reservation> {
    const response = await this.http.post<Reservation>(`/reservations/${id}/cancel`, {});
    return response.data;
  }

  async getMessages(reservationId: string): Promise<Message[]> {
    const response = await this.http.get<Message[]>(`/reservations/${reservationId}/messages`);
    return response.data;
  }

  async createMessage(reservationId: string, data: CreateMessageDto): Promise<Message> {
    const response = await this.http.post<Message>(`/reservations/${reservationId}/messages`, data);
    return response.data;
  }

  async getStatistics(): Promise<ReservationStatistics> {
    const response = await this.http.get<ReservationStatistics>('/reservations/statistics');
    return response.data;
  }

  async getOccupancyStats(hotelId: number, startDate: Date, endDate: Date): Promise<OccupancyStats> {
    const response = await this.http.get<OccupancyStats>('/statistics/occupancy', {
      params: {
        hotelId: hotelId.toString(),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
    })
    return response.data
  }

  async getRevenueStats(hotelId: number, startDate: Date, endDate: Date): Promise<RevenueStats> {
    const response = await this.http.get<RevenueStats>('/statistics/revenue', {
      params: {
        hotelId: hotelId.toString(),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
    })
    return response.data
  }

  async validateRoomAvailability(hotelId: number, checkIn: string, checkOut: string, guestCount: number): Promise<{ available: boolean; unavailableRooms: number[] }> {
    const response = await this.http.get<{ available: boolean; unavailableRooms: number[] }>(
      `/reservations/fetch/validate-availability`,
      {
        params: {
          hotelId: hotelId.toString(),
          checkIn,
          checkOut,
          guestCount: guestCount.toString(),
        },
      }
    )
    return response.data
  }

  async getReservationsWithMessages(): Promise<Reservation[]> {
    const response = await this.http.get<Reservation[]>('/reservations/fetch/with-messages');
    return response.data;
  }
}
