'use client'

import { ReactNode, useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '../../store/auth'
import { initializeApi, getApi, clearApiTokens } from '../../lib/api-config'
import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'

const PUBLIC_PATHS = ['/', '/hotels', '/hotels/:id']

export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessToken, refreshToken, logout, login, user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isHydrated, setIsHydrated] = useState(false)
  const [isApiInitialized, setIsApiInitialized] = useState(false)

  const isPublicPath = useCallback(() => {
    return PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))
  }, [pathname])

  const handleTokenChange = useCallback((newAccessToken?: string, newRefreshToken?: string) => {
    if (!newAccessToken || !newRefreshToken) {
      logout()
      return
    }

    if (user) {
      login(newAccessToken, newRefreshToken, user)
    }
  }, [login, logout, user])

  const handleUnauthorized = useCallback(() => {
    const cookieOptions = {
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
    }

    Cookies.remove('user', cookieOptions)
    Cookies.remove('accessToken', cookieOptions)
    Cookies.remove('refreshToken', cookieOptions)

    clearApiTokens()

    logout()

    if (!isPublicPath()) {
      router.push('/')
    }
  }, [logout, router, isPublicPath])

  const fetchAndUpdateUserData = useCallback(async () => {
    try {
      const response = await getApi().auth.me()
      if (response && accessToken && refreshToken) {
        login(accessToken, refreshToken, {
          ...response,
          id: response.id
        })
      }
    } catch (error) {
      if (!isPublicPath()) {
        console.error('Error fetching user data:', error)
      }
    }
  }, [accessToken, refreshToken, login, isPublicPath])

  useEffect(() => {
    if (isApiInitialized) return

    try {
      initializeApi({
        accessToken: accessToken || undefined,
        refreshToken: refreshToken || undefined,
        onTokensChange: handleTokenChange,
        onUnauthorized: handleUnauthorized,
      })
      setIsApiInitialized(true)
    } catch (error) {
      setIsApiInitialized(false)
    }
  }, [isApiInitialized, handleTokenChange, handleUnauthorized, accessToken, refreshToken])

  useEffect(() => {
    if (!isApiInitialized) return

    const initializeSession = async () => {
      const serverAccessToken = Cookies.get('accessToken')
      const serverRefreshToken = Cookies.get('refreshToken')
      const serverUser = Cookies.get('user')

      if (serverAccessToken && serverRefreshToken && serverUser) {
        try {
          const user = JSON.parse(serverUser)
          login(serverAccessToken, serverRefreshToken, user)
          await fetchAndUpdateUserData()
        } catch (error) {
          if (!isPublicPath()) {
            handleUnauthorized()
          }
        }
      }
      setIsHydrated(true)
    }

    initializeSession()
  }, [isApiInitialized, login, logout, fetchAndUpdateUserData, isPublicPath, handleUnauthorized])

  if (!isHydrated || !isApiInitialized) {
    if (isPublicPath()) {
      return <>{children}</>
    }
    return null
  }

  return <>{children}</>
}
