import { NextResponse } from 'next/server';


export function proxy(req) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get('startupscout_session');

  // 1. CSRF Protection for state-changing mutations (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    const host = req.headers.get('host');

    // Parse host URL
    const requestHost = host || '';

    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== requestHost) {
          return new NextResponse(
            JSON.stringify({ error: 'CSRF violation: origin mismatch' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } catch (e) {
        return new NextResponse(
          JSON.stringify({ error: 'CSRF violation: invalid origin' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host !== requestHost) {
          return new NextResponse(
            JSON.stringify({ error: 'CSRF violation: referer mismatch' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } catch (e) {
        return new NextResponse(
          JSON.stringify({ error: 'CSRF violation: invalid referer' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // Define protected path prefixes
  const isProtectedPath =
  pathname.startsWith('/dashboard') ||
  pathname.startsWith('/api/projects') ||
  pathname.startsWith('/api/analyze');

  // Skip asset files, public pages, and auth APIs
  const isPublicAsset =
  pathname.startsWith('/_next') ||
  pathname.startsWith('/static') ||
  pathname === '/favicon.ico' ||
  pathname === '/logo.png';

  const isPublicPage =
  pathname === '/' ||
  pathname === '/login' ||
  pathname === '/signup' ||
  pathname.startsWith('/api/auth');

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // Redirect authenticated users trying to access login/signup
  if ((pathname === '/login' || pathname === '/signup') && sessionCookie?.value) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isPublicPage) {
    return NextResponse.next();
  }

  if (isProtectedPath) {
    if (!sessionCookie?.value) {
      // Redirect to login for pages, return 401 for API routes
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized. Active session cookie required.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

// Configure matcher to optimize execution
export const config = {
  matcher: [
  '/dashboard/:path*',
  '/api/projects/:path*',
  '/api/analyze/:path*',
  '/login',
  '/signup',
  '/((?!_next/static|_next/image|favicon.ico).*)']

};