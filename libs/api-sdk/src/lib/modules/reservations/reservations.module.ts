import { HttpClient } from '../../client';

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
  roomId: string;
}

export interface CreateMessageDto {
  content: string;
}

export interface ReservationStatistics {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

export class ReservationsModule {
  constructor(private readonly http: HttpClient) {}

  async getReservations(): Promise<Reservation[]> {
    const response = await this.http.get<Reservation[]>('/reservations');
    return response.data;
  }

  async getReservation(id: string): Promise<Reservation> {
    const response = await this.http.get<Reservation>(`/reservations/${id}`);
    return response.data;
  }

  async createReservation(data: CreateReservationDto): Promise<Reservation> {
    const response = await this.http.post<Reservation>('/reservations', data);
    return response.data;
  }

  async updateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation> {
    const response = await this.http.patch<Reservation>(`/reservations/${id}/status`, { status });
    return response.data;
  }

  async cancelReservation(id: string): Promise<Reservation> {
    const response = await this.http.post<Reservation>(`/reservations/${id}/cancel`);
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
}
