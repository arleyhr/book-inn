import { HttpClient, AxiosHttpClient, HttpRequestConfig } from './client'
import { AuthModule } from './modules/auth/auth.module'
import { HotelsModule } from './modules/hotels/hotels.module'
import { ReservationsModule } from './modules/reservations/reservations.module'
import { MessagesModule } from './modules/messages/messages.module'
import { UsersModule } from './modules/users/users.module'

export interface ApiSdkConfig extends HttpRequestConfig {
  onTokensChange?: (accessToken: string | undefined, refreshToken: string | undefined) => void
  refreshToken?: string
  accessToken?: string
}

interface ApiError {
  status: number
  message: string
}

export class ApiSdk {
  private readonly http: HttpClient
  private readonly config: ApiSdkConfig
  private refreshToken?: string
  private isRefreshing = false
  private refreshSubscribers: ((result: { accessToken: string | null; error?: ApiError }) => void)[] = []

  readonly auth: AuthModule
  readonly hotels: HotelsModule
  readonly reservations: ReservationsModule
  readonly messages: MessagesModule
  readonly users: UsersModule

  constructor(config: ApiSdkConfig, httpClient?: HttpClient) {
    this.config = config
    this.http = httpClient || new AxiosHttpClient(config)
    this.refreshToken = config.refreshToken

    if (config.accessToken) {
      this.http.setHeader('Authorization', `Bearer ${config.accessToken}`)
    }

    this.auth = new AuthModule(this.http)
    this.hotels = new HotelsModule(this.http)
    this.reservations = new ReservationsModule(this.http)
    this.messages = new MessagesModule(this.http)
    this.users = new UsersModule(this.http)

    this.setupTokenRefresh()
  }

  handleError(error: unknown): never {
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
      throw new Error(String(error.response.data.message))
    }

    if (error instanceof Error) {
      if ('status' in error) {
        const apiError = error as ApiError
        throw new Error(apiError.message || 'An error occurred while making the request')
      }
      throw error
    }
    throw new Error('An unknown error occurred')
  }

  private setupTokenRefresh() {
    const originalGet = this.http.get.bind(this.http)
    const originalPost = this.http.post.bind(this.http)
    const originalPut = this.http.put.bind(this.http)
    const originalPatch = this.http.patch.bind(this.http)
    const originalDelete = this.http.delete.bind(this.http)

    const handleRequest = async <T>(request: () => Promise<T>): Promise<T> => {
      try {
        return await request()
      } catch (error) {
        const apiError = error as ApiError
        if (apiError?.status === 401 && this.refreshToken) {
          if (!this.isRefreshing) {
            this.isRefreshing = true

            try {
              const response = await originalPost('/auth/refresh', { refreshToken: this.refreshToken })
              const tokens = response.data as { access_token: string; refresh_token: string }
              this.setTokens(tokens.access_token, tokens.refresh_token)
              this.refreshSubscribers.forEach((callback) => callback({ accessToken: tokens.access_token }))
              this.refreshSubscribers = []
              return request()
            } catch (refreshError) {
              this.clearTokens()
              const tokenError: ApiError = { status: 401, message: 'Token refresh failed' }
              this.refreshSubscribers.forEach((callback) => callback({ accessToken: null, error: tokenError }))
              this.refreshSubscribers = []
              throw tokenError
            } finally {
              this.isRefreshing = false
            }
          }

          return new Promise<T>((resolve, reject) => {
            this.refreshSubscribers.push((result) => {
              if (result.error) {
                reject(result.error)
                return
              }
              this.http.setHeader('Authorization', `Bearer ${result.accessToken!}`);
              resolve(request())
            })
          })
        }
        throw error
      }
    }

    this.http.get = async (url: string, config?: HttpRequestConfig) => {
      return handleRequest(() => originalGet(url, config))
    }

    this.http.post = async (url: string, data?: any, config?: HttpRequestConfig) => {
      return handleRequest(() => originalPost(url, data, config))
    }

    this.http.put = async (url: string, data?: any, config?: HttpRequestConfig) => {
      return handleRequest(() => originalPut(url, data, config))
    }

    this.http.patch = async (url: string, data?: any, config?: HttpRequestConfig) => {
      return handleRequest(() => originalPatch(url, data, config))
    }

    this.http.delete = async (url: string, config?: HttpRequestConfig) => {
      return handleRequest(() => originalDelete(url, config))
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.http.setHeader('Authorization', `Bearer ${accessToken}`)
    this.refreshToken = refreshToken
    this.config.onTokensChange?.(accessToken, refreshToken)
  }

  clearTokens() {
    this.http.removeHeader('Authorization')
    this.refreshToken = undefined
    this.config.onTokensChange?.(undefined, undefined)
  }

  getAccessToken(): string | undefined {
    const authHeader = this.http.getHeader('Authorization')
    return authHeader ? authHeader.replace('Bearer ', '') : undefined
  }

  getRefreshToken(): string | undefined {
    return this.refreshToken
  }
}
