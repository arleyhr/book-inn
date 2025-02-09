import { HotelsModule } from './hotels.module';
import { HttpClient, HttpResponse } from '../../client';

class MockHttpClient implements HttpClient {
  mockResponses: Record<string, unknown> = {};

  setMockResponse(method: string, url: string, response: unknown): void {
    this.mockResponses[`${method}:${url}`] = response;
  }

  async get<T>(url: string): Promise<HttpResponse<T>> {
    return this.createResponse(this.mockResponses[`get:${url}`] as T);
  }

  async post<T>(url: string, data?: unknown): Promise<HttpResponse<T>> {
    return this.createResponse(this.mockResponses[`post:${url}`] as T);
  }

  async put<T>(url: string, data?: unknown): Promise<HttpResponse<T>> {
    return this.createResponse(this.mockResponses[`put:${url}`] as T);
  }

  async patch<T>(url: string, data?: unknown): Promise<HttpResponse<T>> {
    return this.createResponse(this.mockResponses[`patch:${url}`] as T);
  }

  async delete<T>(url: string): Promise<HttpResponse<T>> {
    return this.createResponse(this.mockResponses[`delete:${url}`] as T);
  }

  headers: Record<string, string> = {};

  setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }

  removeHeader(name: string): void {
    delete this.headers[name];
  }

  private createResponse<T>(data: T): HttpResponse<T> {
    return {
      data,
      status: 200,
      headers: {}
    };
  }
}

describe('HotelsModule', () => {
  let module: HotelsModule;
  let httpClient: MockHttpClient;

  const mockHotel = {
    id: '1',
    name: 'Test Hotel',
    description: 'Test Description',
    address: 'Test Address',
    city: 'Test City',
    country: 'Test Country',
    rating: 4.5,
    images: ['image1.jpg'],
    rooms: [],
    reviews: []
  };

  const mockRoom = {
    id: '1',
    name: 'Test Room',
    description: 'Test Description',
    price: 100,
    capacity: 2,
    images: ['image1.jpg'],
    hotelId: '1'
  };

  const mockReview = {
    id: '1',
    rating: 5,
    comment: 'Great hotel!',
    hotelId: '1',
    userId: '1',
    createdAt: '2024-02-09T00:00:00.000Z'
  };

  beforeEach(() => {
    httpClient = new MockHttpClient();
    module = new HotelsModule(httpClient);
  });

  describe('hotels', () => {
    it('should get all hotels', async () => {
      httpClient.setMockResponse('get', '/hotels', [mockHotel]);

      const result = await module.getHotels();

      expect(result).toEqual([mockHotel]);
    });

    it('should get hotel by id', async () => {
      httpClient.setMockResponse('get', '/hotels/1', mockHotel);

      const result = await module.getHotel('1');

      expect(result).toEqual(mockHotel);
    });

    it('should create hotel', async () => {
      const createHotelDto = {
        name: 'New Hotel',
        description: 'New Description',
        address: 'New Address',
        city: 'New City',
        country: 'New Country',
        images: ['new-image.jpg']
      };

      httpClient.setMockResponse('post', '/hotels', { ...mockHotel, ...createHotelDto });

      const result = await module.createHotel(createHotelDto);

      expect(result).toEqual({ ...mockHotel, ...createHotelDto });
    });

    it('should update hotel', async () => {
      const updateHotelDto = {
        name: 'Updated Hotel'
      };

      httpClient.setMockResponse('patch', '/hotels/1', { ...mockHotel, ...updateHotelDto });

      const result = await module.updateHotel('1', updateHotelDto);

      expect(result).toEqual({ ...mockHotel, ...updateHotelDto });
    });

    it('should delete hotel', async () => {
      httpClient.setMockResponse('delete', '/hotels/1', undefined);

      await expect(module.deleteHotel('1')).resolves.not.toThrow();
    });
  });

  describe('rooms', () => {
    it('should create room', async () => {
      const createRoomDto = {
        name: 'New Room',
        description: 'New Description',
        price: 150,
        capacity: 3,
        images: ['new-image.jpg']
      };

      httpClient.setMockResponse('post', '/hotels/1/rooms', { ...mockRoom, ...createRoomDto });

      const result = await module.createRoom('1', createRoomDto);

      expect(result).toEqual({ ...mockRoom, ...createRoomDto });
    });

    it('should update room', async () => {
      const updateRoomDto = {
        name: 'Updated Room'
      };

      httpClient.setMockResponse('patch', '/hotels/1/rooms/1', { ...mockRoom, ...updateRoomDto });

      const result = await module.updateRoom('1', '1', updateRoomDto);

      expect(result).toEqual({ ...mockRoom, ...updateRoomDto });
    });

    it('should delete room', async () => {
      httpClient.setMockResponse('delete', '/hotels/1/rooms/1', undefined);

      await expect(module.deleteRoom('1', '1')).resolves.not.toThrow();
    });
  });

  describe('reviews', () => {
    it('should create review', async () => {
      const createReviewDto = {
        rating: 4,
        comment: 'Nice hotel!'
      };

      httpClient.setMockResponse('post', '/hotels/1/reviews', { ...mockReview, ...createReviewDto });

      const result = await module.createReview('1', createReviewDto);

      expect(result).toEqual({ ...mockReview, ...createReviewDto });
    });

    it('should delete review', async () => {
      httpClient.setMockResponse('delete', '/hotels/1/reviews/1', undefined);

      await expect(module.deleteReview('1', '1')).resolves.not.toThrow();
    });
  });
});
