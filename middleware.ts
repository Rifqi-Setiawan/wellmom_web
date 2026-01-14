import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for route protection and role-based access control
 * 
 * NOTE: Auth state is stored in localStorage by Zustand, not in cookies.
 * Therefore, we cannot reliably check auth state server-side.
 * Auth protection is handled client-side in each protected page component.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all routes to pass through
  // Auth protection is handled client-side in page components
  // This prevents issues with localStorage vs Cookie sync
  
  console.log('🛡️ Middleware: Allowing access to', pathname);
  
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
