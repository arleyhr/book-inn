import { UsersModule } from './users.module';
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

describe('UsersModule', () => {
  let module: UsersModule;
  let httpClient: MockHttpClient;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user'
  };

  beforeEach(() => {
    httpClient = new MockHttpClient();
    module = new UsersModule(httpClient);
  });

  describe('users', () => {
    it('should get all users', async () => {
      httpClient.setMockResponse('get', '/users', [mockUser]);

      const result = await module.getUsers();

      expect(result).toEqual([mockUser]);
    });

    it('should get user by id', async () => {
      httpClient.setMockResponse('get', '/users/1', mockUser);

      const result = await module.getUser('1');

      expect(result).toEqual(mockUser);
    });

    it('should update user', async () => {
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      httpClient.setMockResponse('patch', '/users/1', updatedUser);

      const result = await module.updateUser('1', updateUserDto);

      expect(result).toEqual(updatedUser);
    });

    it('should update password', async () => {
      const updatePasswordDto = {
        currentPassword: 'old-password',
        newPassword: 'new-password'
      };

      httpClient.setMockResponse('post', '/users/password', undefined);

      await expect(module.updatePassword(updatePasswordDto)).resolves.not.toThrow();
    });

    it('should handle update password failure', async () => {
      const updatePasswordDto = {
        currentPassword: 'wrong-password',
        newPassword: 'new-password'
      };

      const error = new Error('Invalid current password');
      httpClient.setMockError('post', '/users/password', error);

      await expect(module.updatePassword(updatePasswordDto)).rejects.toThrow('Invalid current password');
    });
  });
});
