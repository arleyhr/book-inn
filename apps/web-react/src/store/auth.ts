import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AuthResponse } from '../lib/api'
import { updateApiTokens } from '../lib/api-config'
import Cookies from 'js-cookie'

interface AuthState {
  isAuthenticated: boolean
  user: AuthResponse['user'] | null
  accessToken: string | null
  refreshToken: string | null
  login: (accessToken: string, refreshToken: string, user: AuthResponse['user']) => void
  logout: () => void
}

const COOKIE_OPTIONS = {
  expires: 7,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
}

const cookieStorage = {
  getItem: () => {
    const user = Cookies.get('user')
    const accessToken = Cookies.get('accessToken')
    const refreshToken = Cookies.get('refreshToken')

    if (!user || !accessToken || !refreshToken) return null

    try {
      const parsedUser = JSON.parse(user)
      return JSON.stringify({
        state: {
          isAuthenticated: true,
          user: parsedUser,
          accessToken,
          refreshToken,
        },
      })
    } catch (error) {
      return null
    }
  },
  setItem: (_: string, value: string) => {
    try {
      const { state } = JSON.parse(value)

      if (state.user && state.accessToken && state.refreshToken) {
        Cookies.set('user', JSON.stringify(state.user), COOKIE_OPTIONS)
        Cookies.set('accessToken', state.accessToken, COOKIE_OPTIONS)
        Cookies.set('refreshToken', state.refreshToken, COOKIE_OPTIONS)
      }
    } catch (error) {}
  },
  removeItem: () => {
    Cookies.remove('user', COOKIE_OPTIONS)
    Cookies.remove('accessToken', COOKIE_OPTIONS)
    Cookies.remove('refreshToken', COOKIE_OPTIONS)
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      login: (accessToken, refreshToken, user) => {
        if (!accessToken || !refreshToken || !user) return

        const currentState = get()

        if (
          currentState.accessToken === accessToken &&
          currentState.refreshToken === refreshToken &&
          currentState.user?.id === user.id &&
          currentState.user?.email === user.email &&
          currentState.user?.firstName === user.firstName &&
          currentState.user?.lastName === user.lastName &&
          currentState.user?.role === user.role
        ) {
          return
        }

        set({ isAuthenticated: true, user, accessToken, refreshToken })
        updateApiTokens(accessToken, refreshToken)
      },
      logout: () => {
        const currentState = get()
        if (!currentState.isAuthenticated) return

        Cookies.remove('user', COOKIE_OPTIONS)
        Cookies.remove('accessToken', COOKIE_OPTIONS)
        Cookies.remove('refreshToken', COOKIE_OPTIONS)

        set({ isAuthenticated: false, user: null, accessToken: null, refreshToken: null })
        updateApiTokens(undefined, undefined)
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => cookieStorage),
      skipHydration: true,
    }
  )
)
