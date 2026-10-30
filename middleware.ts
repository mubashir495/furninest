import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function getSessionStatus(request: NextRequest): {
  isAuthenticated: boolean;
  role?: string;
} {
  const accessToken = request.cookies.get('furninest_token')?.value;
  const refreshToken = request.cookies.get('furninest_refresh_token')?.value;
  const cookieRole = request.cookies.get('furninest_role')?.value;
  const adminAuthed = request.cookies.get('admin_authed')?.value === '1';

  // 1. Check accessToken
  if (accessToken) {
    const payload = parseJwt(accessToken);
    if (payload) {
      const isExpired = payload.exp ? Date.now() >= payload.exp * 1000 : false;
      if (!isExpired) {
        return {
          isAuthenticated: true,
          role: payload.role || cookieRole || (adminAuthed ? 'ADMIN' : undefined),
        };
      }
    }
  }

  // 2. If accessToken is missing or expired, check if refreshToken is still valid
  // (allows client-side axios interceptor to seamlessly refresh without breaking navigation)
  if (refreshToken) {
    const refreshPayload = parseJwt(refreshToken);
    if (refreshPayload) {
      const isRefreshExpired = refreshPayload.exp ? Date.now() >= refreshPayload.exp * 1000 : false;
      if (!isRefreshExpired) {
        return {
          isAuthenticated: true,
          role: refreshPayload.role || cookieRole || (adminAuthed ? 'ADMIN' : undefined),
        };
      }
    }
  }

  return { isAuthenticated: false };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Forward legacy /admin/login to /auth/login
  if (pathname === '/admin/login') {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    return NextResponse.redirect(loginUrl);
  }

  const { isAuthenticated, role } = getSessionStatus(request);

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');
  const isAccountRoute = pathname.startsWith('/account');
  const isAuthRoute = pathname === '/auth/login' || pathname === '/auth/signup';

  // 1. Admin Routes (/admin/*, /dashboard/*)
  if (isAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== 'ADMIN') {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = '/';
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  }

  // 2. Account Routes (/account/*)
  if (isAccountRoute) {
    if (!isAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. Guest Auth Routes (/auth/login, /auth/signup)
  if (isAuthRoute && isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = role === 'ADMIN' ? '/dashboard' : '/';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/account/:path*',
    '/auth/login',
    '/auth/signup',
  ],
};
