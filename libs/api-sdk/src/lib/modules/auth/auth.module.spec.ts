import { AuthModule } from './auth.module';
import { HttpClient, HttpResponse } from '../../client';

class MockHttpClient implements HttpClient {
  mockResponses: Record<string, unknown> = {};
  mockErrors: Record<string, Error> = {};

  setMockResponse(method: string, url: string, response: unknown): void {
    this.mockResponses[`${method}:${url}`] = response;
  }

  setMockError(method: string, url: string, error: Error): void {
    this.mockErrors[`${method}:${url}`] = error;
  }

  async get<T>(url: string): Promise<HttpResponse<T>> {
    const error = this.mockErrors[`get:${url}`];
    if (error) throw error;
    return this.createResponse(this.mockResponses[`get:${url}`] as T);
  }

  async post<T>(url: string, data?: unknown): Promise<HttpResponse<T>> {
    const error = this.mockErrors[`post:${url}`];
    if (error) throw error;
    return this.createResponse(this.mockResponses[`post:${url}`] as T);
  }

  async put<T>(url: string, data?: unknown): Promise<HttpResponse<T>> {
    const error = this.mockErrors[`put:${url}`];
    if (error) throw error;
    return this.createResponse(this.mockResponses[`put:${url}`] as T);
  }

  async patch<T>(url: string, data?: unknown): Promise<HttpResponse<T>> {
    const error = this.mockErrors[`patch:${url}`];
    if (error) throw error;
    return this.createResponse(this.mockResponses[`patch:${url}`] as T);
  }

  async delete<T>(url: string): Promise<HttpResponse<T>> {
    const error = this.mockErrors[`delete:${url}`];
    if (error) throw error;
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
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    user: mockUser
  };

  beforeEach(() => {
    httpClient = new MockHttpClient();
    module = new AuthModule(httpClient);
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password'
    };

    it('should login successfully', async () => {
      httpClient.setMockResponse('post', '/auth/login', mockAuthResponse);
      const response = await module.login(loginData);
      expect(response).toEqual(mockAuthResponse);
    });

    it('should handle login failure', async () => {
      const error = new Error('Invalid credentials');
      httpClient.setMockError('post', '/auth/login', error);
      await expect(module.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should register successfully', async () => {
      httpClient.setMockResponse('post', '/auth/register', mockAuthResponse);
      const response = await module.register(registerData);
      expect(response).toEqual(mockAuthResponse);
    });

    it('should handle registration failure', async () => {
      const error = new Error('Email already exists');
      httpClient.setMockError('post', '/auth/register', error);
      await expect(module.register(registerData)).rejects.toThrow('Email already exists');
    });
  });

  describe('me', () => {
    it('should get current user profile', async () => {
      httpClient.setMockResponse('get', '/auth/me', mockUser);
      const response = await module.me();
      expect(response).toEqual(mockUser);
    });

    it('should handle unauthorized access', async () => {
      const error = new Error('Unauthorized');
      httpClient.setMockError('get', '/auth/me', error);
      await expect(module.me()).rejects.toThrow('Unauthorized');
    });
  });

  describe('refreshToken', () => {
    const mockRefreshResponse = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token'
    };

    it('should refresh token successfully', async () => {
      httpClient.setMockResponse('post', '/auth/refresh', mockRefreshResponse);
      const response = await module.refreshToken('old-refresh-token');
      expect(response).toEqual(mockRefreshResponse);
    });

    it('should handle refresh token failure', async () => {
      const error = new Error('Invalid refresh token');
      httpClient.setMockError('post', '/auth/refresh', error);
      await expect(module.refreshToken('invalid-token')).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      httpClient.setMockResponse('post', '/auth/logout', undefined);
      await expect(module.logout()).resolves.not.toThrow();
    });

    it('should handle logout failure', async () => {
      const error = new Error('Failed to logout');
      httpClient.setMockError('post', '/auth/logout', error);
      await expect(module.logout()).rejects.toThrow('Failed to logout');
    });
  });
});
