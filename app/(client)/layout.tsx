import Link from 'next/link';
import { logoutAction } from '@/lib/auth/actions/logout';
import { Button } from '@/components/ui/button';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-primary text-base font-semibold">
            GSET Location
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/catalogue" className="hover:text-primary">
              Catalogue
            </Link>
            <Link href="/mes-locations" className="hover:text-primary">
              Mes locations
            </Link>
            <Link href="/factures" className="hover:text-primary">
              Factures
            </Link>
            <Link href="/profil" className="hover:text-primary">
              Profil
            </Link>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Déconnexion
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
