import { HttpClient } from '../../client';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export class AuthModule {
  constructor(private readonly http: HttpClient) {}

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await this.http.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await this.http.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async me(): Promise<AuthResponse['user']> {
    const response = await this.http.get<AuthResponse['user']>('/auth/me');
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await this.http.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.http.post('/auth/logout');
  }
}
