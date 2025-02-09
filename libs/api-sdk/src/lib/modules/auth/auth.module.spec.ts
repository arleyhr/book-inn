import { AuthModule } from './auth.module';
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

  setHeader(name: string, value: string): void {
    return;
  }

  removeHeader(name: string): void {
    return;
  }

  private createResponse<T>(data: T): HttpResponse<T> {
    return {
      data,
      status: 200,
      headers: {}
    };
  }
}

describe('AuthModule', () => {
  let module: AuthModule;
  let httpClient: MockHttpClient;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user'
  };

  const mockAuthResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: mockUser
  };

  beforeEach(() => {
    httpClient = new MockHttpClient();
    module = new AuthModule(httpClient);
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password'
      };

      httpClient.setMockResponse('post', '/auth/login', mockAuthResponse);

      const response = await module.login(loginData);

      expect(response).toEqual(mockAuthResponse);
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User'
      };

      httpClient.setMockResponse('post', '/auth/register', mockAuthResponse);

      const response = await module.register(registerData);

      expect(response).toEqual(mockAuthResponse);
    });
  });

  describe('me', () => {
    it('should get current user profile', async () => {
      httpClient.setMockResponse('get', '/auth/me', mockUser);

      const response = await module.me();

      expect(response).toEqual(mockUser);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockRefreshResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      httpClient.setMockResponse('post', '/auth/refresh', mockRefreshResponse);

      const response = await module.refreshToken('old-refresh-token');

      expect(response).toEqual(mockRefreshResponse);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      httpClient.setMockResponse('post', '/auth/logout', undefined);

      await expect(module.logout()).resolves.not.toThrow();
    });
  });
});
