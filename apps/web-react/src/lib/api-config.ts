import { ApiSdk } from '@book-inn/api-sdk'

let api: ApiSdk | null = null

const DEFAULT_CONFIG = {
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
}

export function initializeApi(config: {
  accessToken?: string
  refreshToken?: string
  onTokensChange?: (accessToken: string | undefined, refreshToken: string | undefined) => void
  onUnauthorized?: () => void
}) {
  if (api) {
    if (config.accessToken && config.refreshToken) {
      api.setTokens(config.accessToken, config.refreshToken)
    }
    return api
  }

  try {
    api = new ApiSdk({
      ...DEFAULT_CONFIG,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      onTokensChange: (accessToken, refreshToken) => {
        config.onTokensChange?.(accessToken, refreshToken)
      },
    })

    if (api.http && api.http.interceptors) {
      api.http.interceptors.request.use(
        (config) => {
          const token = api?.getAccessToken()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
          return config
        },
        (error) => {
          return Promise.reject(error)
        }
      )

      api.http.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config

          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
              const refreshToken = api?.getRefreshToken()
              if (!refreshToken) {
                throw new Error('No refresh token available')
              }

              const response = await api.auth.refreshToken(refreshToken)
              const { accessToken, refreshToken: newRefreshToken } = response

              api.setTokens(accessToken, newRefreshToken)
              config.onTokensChange?.(accessToken, newRefreshToken)

              originalRequest.headers.Authorization = `Bearer ${accessToken}`
              return api.http(originalRequest)
            } catch (refreshError) {
              config.onUnauthorized?.()
              return Promise.reject(refreshError)
            }
          }

          return Promise.reject(error)
        }
      )
    }

    return api
  } catch (error) {
    throw error
  }
}

export function getApi() {
  if (!api) {
    api = initializeApi({})
  }
  return api
}

export function updateApiTokens(accessToken?: string, refreshToken?: string) {
  try {
    const apiInstance = getApi()
    if (accessToken && refreshToken) {
      apiInstance.setTokens(accessToken, refreshToken)
    } else {
      apiInstance.clearTokens()
    }
  } catch (error) {}
}

export function clearApiTokens() {
  try {
    const apiInstance = getApi()
    apiInstance.clearTokens()
  } catch (error) {}
}

export function isAuthenticated() {
  try {
    const apiInstance = getApi()
    const accessToken = apiInstance.getAccessToken()
    return !!accessToken
  } catch (error) {
    return false
  }
}
