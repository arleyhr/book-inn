import { ApiSdk } from '@book-inn/api-sdk'
import { cookies } from 'next/headers'

export async function getServerApi() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value

  return new ApiSdk({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    accessToken: accessToken || undefined,
    refreshToken: refreshToken || undefined,
  })
}
