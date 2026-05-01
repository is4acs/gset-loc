import { redirect } from 'next/navigation';
import { requireUser } from './get-current-user';

/**
 * Server-side guard for /admin routes. Redirects to /connexion when
 * unauthenticated, and to / when authenticated but not an admin.
 */
export async function requireAdmin(returnTo?: string) {
  const session = await requireUser(returnTo);
  if (!session.dbUser || session.dbUser.role !== 'ADMIN') {
    redirect('/');
  }
  return session;
}
