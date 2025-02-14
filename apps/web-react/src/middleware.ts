import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authTokens = {
    accessToken: request.cookies.get('accessToken')?.value,
    refreshToken: request.cookies.get('refreshToken')?.value,
  }

  const response = NextResponse.next()

  const currentCookies = request.cookies.getAll()
  currentCookies.forEach(cookie => {
    const cookieOptions = {
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      expires: cookie.name.includes('token')
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : undefined
    }
    response.cookies.set(cookie.name, cookie.value, cookieOptions)
  })


  if (request.nextUrl.pathname.startsWith('/api')) {
    if (authTokens.accessToken) {
      response.headers.set('Authorization', `Bearer ${authTokens.accessToken}`)
    }
  }


  const protectedRoutes = ['/manage-reservations', '/messages']
  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!authTokens.accessToken || !authTokens.refreshToken) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}


export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
