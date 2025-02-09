import { ApiSdk } from './api-sdk';
import { MockHttpClient } from './test-utils/mock-http-client';

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
      expect(httpClient.headers['Authorization']).toBe(`Bearer ${mockAccessToken}`);
      expect(sdk.auth).toBeDefined();
      expect(sdk.hotels).toBeDefined();
      expect(sdk.reservations).toBeDefined();
      expect(sdk.users).toBeDefined();
    });

    it('should create instance without tokens', () => {
      sdk = new ApiSdk({ baseURL }, httpClient);

      expect(sdk).toBeDefined();
      expect(httpClient.headers['Authorization']).toBeUndefined();
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

      expect(httpClient.headers['Authorization']).toBe(`Bearer ${mockNewAccessToken}`);
      expect(onTokensChange).toHaveBeenCalledWith(mockNewAccessToken, mockNewRefreshToken);
    });

    it('should clear tokens and notify changes', () => {
      sdk.clearTokens();

      expect(httpClient.headers['Authorization']).toBeUndefined();
      expect(onTokensChange).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('automatic token refresh', () => {
    const unauthorizedError = { status: 401, message: 'Unauthorized' };
    const mockResponse = { success: true };

    beforeEach(() => {
      sdk = new ApiSdk({
        baseURL,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken
      }, httpClient);

      httpClient.setMockResponse('post', '/auth/refresh', {
        accessToken: mockNewAccessToken,
        refreshToken: mockNewRefreshToken
      });
    });

    it('should refresh token on 401 error and retry request', async () => {
      let isFirstCall = true;
      httpClient.get = jest.fn().mockImplementation(async () => {
        if (isFirstCall) {
          isFirstCall = false;
          throw unauthorizedError;
        }
        return { data: mockResponse, status: 200, headers: {} };
      });

      const result = await sdk.hotels.getHotels();
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle multiple concurrent requests during token refresh', async () => {
      let isRefreshing = true;
      let requestCount = 0;

      jest.spyOn(httpClient, 'get').mockImplementation(async () => {
        requestCount++;
        if (requestCount === 1 || (isRefreshing && requestCount < 4)) {
          throw unauthorizedError;
        }
        return { data: mockResponse, status: 200, headers: {} };
      });

      jest.spyOn(httpClient, 'post').mockImplementation(async (url) => {
        if (url === '/auth/refresh') {
          await new Promise(resolve => setTimeout(resolve, 100));
          isRefreshing = false;
          return {
            data: { accessToken: mockNewAccessToken, refreshToken: mockNewRefreshToken },
            status: 200,
            headers: {}
          };
        }
        return { data: {}, status: 200, headers: {} };
      });

      const requests = [
        sdk.hotels.getHotels(),
        sdk.hotels.getHotels(),
        sdk.hotels.getHotels()
      ];

      const results = await Promise.all(requests);
      results.forEach(result => {
        expect(result.data).toEqual(mockResponse);
      });
    });

    it('should clear tokens when refresh token fails', async () => {
      jest.spyOn(httpClient, 'get').mockRejectedValueOnce(unauthorizedError);
      jest.spyOn(httpClient, 'post').mockRejectedValueOnce(unauthorizedError);

      await expect(sdk.hotels.getHotels()).rejects.toMatchObject({ status: 401 });
      expect(httpClient.headers['Authorization']).toBeUndefined();
    });

    it('should not attempt refresh without refresh token', async () => {
      sdk = new ApiSdk({
        baseURL,
        accessToken: mockAccessToken
      }, httpClient);

      jest.spyOn(httpClient, 'get').mockRejectedValueOnce(unauthorizedError);
      jest.spyOn(httpClient, 'post');

      await expect(sdk.hotels.getHotels()).rejects.toMatchObject(unauthorizedError);
      expect(httpClient.post).not.toHaveBeenCalled();
    });
  });
});
