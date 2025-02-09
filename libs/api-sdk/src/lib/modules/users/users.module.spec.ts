import { UsersModule } from './users.module';
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

  setHeader(name: string, value: string): void {}
  removeHeader(name: string): void {}

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
    role: 'user',
    createdAt: '2024-02-09T00:00:00.000Z',
    updatedAt: '2024-02-09T00:00:00.000Z'
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

      httpClient.setMockResponse('patch', '/users/password', undefined);

      await expect(module.updatePassword(updatePasswordDto)).resolves.not.toThrow();
    });

    it('should delete user', async () => {
      httpClient.setMockResponse('delete', '/users/1', undefined);

      await expect(module.deleteUser('1')).resolves.not.toThrow();
    });
  });
});
