import { ApiSdk } from './api-sdk';
import { HttpClient, HttpResponse } from './client';

class MockHttpClient implements HttpClient {
  headers: Record<string, string> = {};
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
    this.headers[name] = value;
  }

  removeHeader(name: string): void {
    delete this.headers[name];
  }

  getHeader(name: string): string | undefined {
    return this.headers[name];
  }

  private createResponse<T>(data: T): HttpResponse<T> {
    return {
      data,
      status: 200,
      headers: {}
    };
  }
}

describe('ApiSdk', () => {
  let sdk: ApiSdk;
  let httpClient: MockHttpClient;
  const baseURL = 'http://localhost:3000';
  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';
  const mockNewAccessToken = 'mock-new-access-token';
  const mockNewRefreshToken = 'mock-new-refresh-token';
  const mockResponse = { success: true };

  beforeEach(() => {
    httpClient = new MockHttpClient();
  });

  describe('initialization', () => {
    it('should create instance with tokens', () => {
      sdk = new ApiSdk({
        baseURL,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken
      }, httpClient);

      expect(sdk).toBeDefined();
      expect(httpClient.getHeader('Authorization')).toBe(`Bearer ${mockAccessToken}`);
      expect(sdk.auth).toBeDefined();
      expect(sdk.hotels).toBeDefined();
      expect(sdk.reservations).toBeDefined();
      expect(sdk.users).toBeDefined();
    });

    it('should create instance without tokens', () => {
      sdk = new ApiSdk({ baseURL }, httpClient);

      expect(sdk).toBeDefined();
      expect(httpClient.getHeader('Authorization')).toBeUndefined();
    });
  });

  describe('token management', () => {
    let onTokensChange: jest.Mock;

    beforeEach(() => {
      onTokensChange = jest.fn();
      sdk = new ApiSdk({
        baseURL,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        onTokensChange
      }, httpClient);
    });

    it('should set tokens and notify changes', () => {
      sdk.setTokens(mockNewAccessToken, mockNewRefreshToken);

      expect(httpClient.getHeader('Authorization')).toBe(`Bearer ${mockNewAccessToken}`);
      expect(onTokensChange).toHaveBeenCalledWith(mockNewAccessToken, mockNewRefreshToken);
    });

    it('should clear tokens and notify changes', () => {
      sdk.clearTokens();

      expect(httpClient.getHeader('Authorization')).toBeUndefined();
      expect(onTokensChange).toHaveBeenCalledWith(undefined, undefined);
    });
  });
});
