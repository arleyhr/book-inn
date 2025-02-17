import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const cookieStorage = {
  getItem: () => {
    const theme = Cookies.get('theme-storage')
    return theme || null
  },
  setItem: (_: string, value: string) => {
    Cookies.set('theme-storage', value, { sameSite: 'strict' })
  },
  removeItem: () => {
    Cookies.remove('theme-storage')
  },
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const savedTheme = cookieStorage.getItem()
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme)
        if (parsed.state && parsed.state.theme) {
          return parsed.state.theme
        }
      } catch (e) {
        // Ignore
      }
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  }
  return 'light'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => cookieStorage),
    }
  )
)
