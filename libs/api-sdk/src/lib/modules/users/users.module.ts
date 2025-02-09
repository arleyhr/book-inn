import { HttpClient } from '../../client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export class UsersModule {
  constructor(private readonly http: HttpClient) {}

  async getUsers(): Promise<User[]> {
    const response = await this.http.get<User[]>('/users');
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.http.get<User>(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await this.http.patch<User>(`/users/${id}`, data);
    return response.data;
  }

  async updatePassword(data: UpdatePasswordDto): Promise<void> {
    await this.http.patch('/users/password', data);
  }

  async deleteUser(id: string): Promise<void> {
    await this.http.delete(`/users/${id}`);
  }
}
