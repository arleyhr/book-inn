export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface HttpRequestConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export interface HttpClient {
  get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  post<T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  put<T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  patch<T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  setHeader(name: string, value: string): void;
  removeHeader(name: string): void;
  getHeader(name: string): string | undefined;
}

export class AxiosHttpClient implements HttpClient {
  private instance: import('axios').AxiosInstance;
  private headers: Record<string, string> = {};

  constructor(config: HttpRequestConfig) {
    this.instance = require('axios').default.create(config);
    this.headers = config.headers || {};
  }

  async get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.instance.get(url, config);
    return this.normalizeResponse(response);
  }

  async post<T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.instance.post(url, data, config);
    return this.normalizeResponse(response);
  }

  async put<T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.instance.put(url, data, config);
    return this.normalizeResponse(response);
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.instance.patch(url, data, config);
    return this.normalizeResponse(response);
  }

  async delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.instance.delete(url, config);
    return this.normalizeResponse(response);
  }

  setHeader(name: string, value: string): void {
    this.headers[name] = value;
    this.instance.defaults.headers.common[name] = value;
  }

  removeHeader(name: string): void {
    delete this.headers[name];
    delete this.instance.defaults.headers.common[name];
  }

  getHeader(name: string): string | undefined {
    return this.headers[name];
  }

  private normalizeResponse<T>(response: import('axios').AxiosResponse<T>): HttpResponse<T> {
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>
    };
  }
}

export class AngularHttpClient implements HttpClient {
  constructor(private http: any, private config: HttpRequestConfig) {}

  async get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.http.get(this.getFullUrl(url), this.getOptions(config)).toPromise();
    return this.normalizeResponse(response) as HttpResponse<T>;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.http.post(this.getFullUrl(url), data, this.getOptions(config)).toPromise();
    return this.normalizeResponse(response) as HttpResponse<T>;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.http.put(this.getFullUrl(url), data, this.getOptions(config)).toPromise();
    return this.normalizeResponse(response) as HttpResponse<T>;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.http.patch(this.getFullUrl(url), data, this.getOptions(config)).toPromise();
    return this.normalizeResponse(response) as HttpResponse<T>;
  }

  async delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.http.delete(this.getFullUrl(url), this.getOptions(config)).toPromise();
    return this.normalizeResponse(response) as HttpResponse<T>;
  }

  setHeader(name: string, value: string): void {
    if (!this.config.headers) {
      this.config.headers = {};
    }
    this.config.headers[name] = value;
  }

  removeHeader(name: string): void {
    if (this.config.headers) {
      delete this.config.headers[name];
    }
  }

  getHeader(name: string): string | undefined {
    return this.config.headers?.[name];
  }

  private getFullUrl(path: string): string {
    return `${this.config.baseURL || ''}${path}`;
  }

  private getOptions(config?: HttpRequestConfig) {
    return {
      headers: { ...this.config.headers, ...(config?.headers || {}) },
      params: config?.params
    };
  }

  private normalizeResponse(response: any): HttpResponse {
    return {
      data: response.body,
      status: response.status,
      headers: response.headers
    };
  }
}
