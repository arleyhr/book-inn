'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useEffect, useLayoutEffect } from 'react'
import { useThemeStore } from '../store/theme'
import { AuthProvider } from '../components/auth/auth-provider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function Providers({ children }: { children: ReactNode }) {
  const { theme } = useThemeStore()

  useIsomorphicLayoutEffect(() => {
    document.documentElement.classList.remove('dark')

    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    const initialTheme = theme

    if (initialTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
