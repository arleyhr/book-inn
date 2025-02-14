import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getServerSideAuth() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value
  const user = cookieStore.get('user')?.value

  return {
    isAuthenticated: Boolean(accessToken && refreshToken),
    user: user ? JSON.parse(user) : null,
    accessToken,
    refreshToken,
  }
}

export async function requireAuth() {
  const { isAuthenticated } = await getServerSideAuth()

  if (!isAuthenticated) {
    redirect('/')
  }
}

export async function redirectIfAuthenticated() {
  const { isAuthenticated } = await getServerSideAuth()

  if (isAuthenticated) {
    redirect('/manage-reservations')
  }
}
