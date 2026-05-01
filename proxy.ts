import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/auth/supabase-middleware';

// Next 16 renamed the `middleware` convention to `proxy`. The exported
// function name and file name must both be `proxy` to opt out of the
// deprecation warning.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - asset files (svg/png/jpg/jpeg/gif/webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
