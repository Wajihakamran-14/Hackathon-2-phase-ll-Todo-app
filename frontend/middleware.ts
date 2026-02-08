import { NextRequest, NextResponse } from 'next/server';

// This middleware protects routes that start with /tasks
export function middleware(request: NextRequest) {
  // In a real app, this would check for the presence of an auth token
  // For now, we'll allow all requests to pass through
  const token = request.cookies.get('auth_token')?.value;

  // Define protected routes
  const protectedPaths = ['/tasks'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !token) {
    // Redirect to root if accessing protected route without token
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Apply middleware to specific paths
export const config = {
  matcher: ['/tasks/:path*', '/profile/:path*'],
};