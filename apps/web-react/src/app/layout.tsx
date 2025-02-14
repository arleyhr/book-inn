import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { cookies } from 'next/headers'
import { Providers } from './providers'
import { AuthModal } from '../components/auth/auth-modal'
import { Header } from '../components/layout/header'
import { Footer } from '../components/layout/footer'
import '../styles/globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  title: 'Book Inn - Find your perfect stay',
  description: 'Book hotels and accommodations worldwide',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const themeStorage = cookieStore.get('theme-storage')
  const theme = themeStorage ? JSON.parse(themeStorage.value).state.theme : 'light'

  return (
    <html lang="en" className={`${theme} ${plusJakarta.variable}`}>
      <body className={`${plusJakarta.className} min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:bg-gray-900 dark:text-white`}>
        <Providers>
          <Header />
          <main className="pt-16">
            {children}
          </main>
          <Footer />
          <AuthModal />
        </Providers>
      </body>
    </html>
  )
}
