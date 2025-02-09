import { ReservationsModule } from './reservations.module';
import { HttpClient, HttpResponse } from '../../client';

class MockHttpClient implements HttpClient {
  mockResponses: Record<string, any> = {};

  setMockResponse(method: string, url: string, response: any) {
    this.mockResponses[`${method}:${url}`] = response;
  }

  async get<T>(url: string): Promise<HttpResponse<T>> {
    return this.createResponse(this.mockResponses[`get:${url}`]);
  }

  async post<T>(url: string, data?: any): Promise<HttpResponse<T>> {
    return this.createResponse(this.mockResponses[`post:${url}`]);
  }

  async put<T>(url: string, data?: any): Promise<HttpResponse<T>> {
    return this.createResponse(this.mockResponses[`put:${url}`]);
  }

  async patch<T>(url: string, data?: any): Promise<HttpResponse<T>> {
    return this.createResponse(this.mockResponses[`patch:${url}`]);
  }

  async delete<T>(url: string): Promise<HttpResponse<T>> {
    return this.createResponse(this.mockResponses[`delete:${url}`]);
  }

  setHeader(): void {}
  removeHeader(): void {}

  private createResponse<T>(data: T): HttpResponse<T> {
    return {
      data,
      status: 200,
      headers: {}
    };
  }
}

describe('ReservationsModule', () => {
  let module: ReservationsModule;
  let httpClient: MockHttpClient;

  const mockReservation = {
    id: '1',
    checkIn: '2024-03-01',
    checkOut: '2024-03-05',
    guests: 2,
    totalPrice: 400,
    status: 'pending' as const,
    userId: '1',
    hotelId: '1',
    roomId: '1',
    messages: [],
    createdAt: '2024-02-09T00:00:00.000Z',
    updatedAt: '2024-02-09T00:00:00.000Z'
  };

  const mockMessage = {
    id: '1',
    content: 'Hello!',
    userId: '1',
    reservationId: '1',
    createdAt: '2024-02-09T00:00:00.000Z'
  };

  const mockStatistics = {
    total: 10,
    pending: 3,
    confirmed: 4,
    cancelled: 2,
    completed: 1
  };

  beforeEach(() => {
    httpClient = new MockHttpClient();
    module = new ReservationsModule(httpClient);
  });

  describe('reservations', () => {
    it('should get all reservations', async () => {
      httpClient.setMockResponse('get', '/reservations', [mockReservation]);

      const result = await module.getReservations();

      expect(result).toEqual([mockReservation]);
    });

    it('should get reservation by id', async () => {
      httpClient.setMockResponse('get', '/reservations/1', mockReservation);

      const result = await module.getReservation('1');

      expect(result).toEqual(mockReservation);
    });

    it('should create reservation', async () => {
      const createReservationDto = {
        checkIn: '2024-03-01',
        checkOut: '2024-03-05',
        guests: 2,
        hotelId: '1',
        roomId: '1'
      };

      httpClient.setMockResponse('post', '/reservations', mockReservation);

      const result = await module.createReservation(createReservationDto);

      expect(result).toEqual(mockReservation);
    });

    it('should update reservation status', async () => {
      const updatedReservation = { ...mockReservation, status: 'confirmed' as const };
      httpClient.setMockResponse('patch', '/reservations/1/status', updatedReservation);

      const result = await module.updateReservationStatus('1', 'confirmed');

      expect(result).toEqual(updatedReservation);
    });

    it('should cancel reservation', async () => {
      const cancelledReservation = { ...mockReservation, status: 'cancelled' as const };
      httpClient.setMockResponse('post', '/reservations/1/cancel', cancelledReservation);

      const result = await module.cancelReservation('1');

      expect(result).toEqual(cancelledReservation);
    });
  });

  describe('messages', () => {
    it('should get reservation messages', async () => {
      httpClient.setMockResponse('get', '/reservations/1/messages', [mockMessage]);

      const result = await module.getMessages('1');

      expect(result).toEqual([mockMessage]);
    });

    it('should create message', async () => {
      const createMessageDto = {
        content: 'Hello!'
      };

      httpClient.setMockResponse('post', '/reservations/1/messages', mockMessage);

      const result = await module.createMessage('1', createMessageDto);

      expect(result).toEqual(mockMessage);
    });
  });

  describe('statistics', () => {
    it('should get reservation statistics', async () => {
      httpClient.setMockResponse('get', '/reservations/statistics', mockStatistics);

      const result = await module.getStatistics();

      expect(result).toEqual(mockStatistics);
    });
  });
});
