import { HttpClient } from '../../client';

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  images: string[];
  rooms: Room[];
  reviews: Review[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  images: string[];
  hotelId: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  hotelId: string;
  userId: string;
  createdAt: string;
}

export interface CreateHotelDto {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  images: string[];
}

export interface CreateRoomDto {
  name: string;
  description: string;
  price: number;
  capacity: number;
  images: string[];
}

export interface CreateReviewDto {
  rating: number;
  comment: string;
}

export class HotelsModule {
  constructor(private readonly http: HttpClient) {}

  async getHotels(): Promise<Hotel[]> {
    const response = await this.http.get<Hotel[]>('/hotels');
    return response.data;
  }

  async getHotel(id: string): Promise<Hotel> {
    const response = await this.http.get<Hotel>(`/hotels/${id}`);
    return response.data;
  }

  async createHotel(data: CreateHotelDto): Promise<Hotel> {
    const response = await this.http.post<Hotel>('/hotels', data);
    return response.data;
  }

  async updateHotel(id: string, data: Partial<CreateHotelDto>): Promise<Hotel> {
    const response = await this.http.patch<Hotel>(`/hotels/${id}`, data);
    return response.data;
  }

  async deleteHotel(id: string): Promise<void> {
    await this.http.delete(`/hotels/${id}`);
  }

  async createRoom(hotelId: string, data: CreateRoomDto): Promise<Room> {
    const response = await this.http.post<Room>(`/hotels/${hotelId}/rooms`, data);
    return response.data;
  }

  async updateRoom(hotelId: string, roomId: string, data: Partial<CreateRoomDto>): Promise<Room> {
    const response = await this.http.patch<Room>(`/hotels/${hotelId}/rooms/${roomId}`, data);
    return response.data;
  }

  async deleteRoom(hotelId: string, roomId: string): Promise<void> {
    await this.http.delete(`/hotels/${hotelId}/rooms/${roomId}`);
  }

  async createReview(hotelId: string, data: CreateReviewDto): Promise<Review> {
    const response = await this.http.post<Review>(`/hotels/${hotelId}/reviews`, data);
    return response.data;
  }

  async deleteReview(hotelId: string, reviewId: string): Promise<void> {
    await this.http.delete(`/hotels/${hotelId}/reviews/${reviewId}`);
  }
}
