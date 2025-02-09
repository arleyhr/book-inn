import { HttpClient, HttpResponse, HttpRequestConfig } from '../client';

export class MockHttpClient implements HttpClient {
  headers: Record<string, string> = {};
  mockResponses: Record<string, any> = {};
  requestHistory: { method: string; url: string; data?: any; config?: HttpRequestConfig }[] = [];

  setMockResponse(method: string, url: string, response: any) {
    this.mockResponses[`${method}:${url}`] = response;
  }

  async get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    this.requestHistory.push({ method: 'get', url, config });
    return this.createResponse(this.mockResponses[`get:${url}`]);
  }

  async post<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    this.requestHistory.push({ method: 'post', url, data, config });
    return this.createResponse(this.mockResponses[`post:${url}`]);
  }

  async put<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    this.requestHistory.push({ method: 'put', url, data, config });
    return this.createResponse(this.mockResponses[`put:${url}`]);
  }

  async patch<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    this.requestHistory.push({ method: 'patch', url, data, config });
    return this.createResponse(this.mockResponses[`patch:${url}`]);
  }

  async delete<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    this.requestHistory.push({ method: 'delete', url, config });
    return this.createResponse(this.mockResponses[`delete:${url}`]);
  }

  setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }

  removeHeader(name: string): void {
    delete this.headers[name];
  }

  clearHistory(): void {
    this.requestHistory = [];
  }

  private createResponse<T>(data: T): HttpResponse<T> {
    return {
      data,
      status: 200,
      headers: {}
    };
  }
}
