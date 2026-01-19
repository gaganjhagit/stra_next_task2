import { NextResponse } from 'next/server';

/**
 * Middleware for authentication and role-based access control
 * Note: JWT verification happens in pages/API, not in middleware (Edge Runtime limitation)
 */
export async function middleware(request) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Skip middleware for public assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/public')) {
    return NextResponse.next();
  }

  // Public routes - allow access
  if (pathname === '/login' || pathname === '/') {
    // If user has a token, redirect away from login
    if (token) {
      // We can't verify JWT in Edge Runtime, so redirect to a dashboard
      // The dashboard will verify the token and redirect if needed
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Token exists, allow the request to proceed
  // The page component will verify the token and redirect if invalid
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
