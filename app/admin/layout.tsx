import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/require-admin';
import { logoutAction } from '@/lib/auth/actions/logout';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Admin GSET' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin('/admin');

  return (
    <div className="bg-muted/20 flex min-h-screen flex-col">
      <header className="border-primary/30 bg-primary text-primary-foreground border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-sm font-semibold tracking-wide">
              GSET · Admin
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/admin" className="hover:text-accent">
                Dashboard
              </Link>
              <Link href="/admin/reservations" className="hover:text-accent">
                Réservations
              </Link>
              <Link href="/admin/flotte" className="hover:text-accent">
                Flotte
              </Link>
            </nav>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm" className="text-primary-foreground">
              Déconnexion
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
