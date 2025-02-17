import { ApiSdk } from '@book-inn/api-sdk'
import { cookies } from 'next/headers'
import { API_URL } from './api-config'

export async function getServerApi() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value

  return new ApiSdk({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    accessToken: accessToken || undefined,
    refreshToken: refreshToken || undefined,
  })
}
