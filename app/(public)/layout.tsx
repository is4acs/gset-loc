import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background sticky top-0 z-30 border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-primary text-base font-semibold">
            GSET Location
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/catalogue" className="hover:text-primary">
              Catalogue
            </Link>
            <Link href="/connexion" className="hover:text-primary">
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center rounded-md px-4 font-medium"
            >
              S’inscrire
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-muted/30 mt-16 border-t">
        <div className="text-muted-foreground mx-auto grid max-w-6xl gap-8 px-6 py-12 text-sm sm:grid-cols-3">
          <div>
            <p className="text-foreground font-semibold">GSET Location</p>
            <p className="mt-2">Location de matériel BTP en Guyane française.</p>
          </div>
          <div>
            <p className="text-foreground font-semibold">Locations</p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link href="/catalogue?categorie=engins" className="hover:text-primary">
                  Engins avec opérateur
                </Link>
              </li>
              <li>
                <Link href="/catalogue?categorie=demolition" className="hover:text-primary">
                  Démolition
                </Link>
              </li>
              <li>
                <Link href="/catalogue?categorie=energie" className="hover:text-primary">
                  Énergie
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-foreground font-semibold">Compte</p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link href="/connexion" className="hover:text-primary">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="hover:text-primary">
                  Inscription
                </Link>
              </li>
              <li>
                <Link href="/profil" className="hover:text-primary">
                  Mon profil
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-muted-foreground border-t py-4 text-center text-xs">
          © {new Date().getFullYear()} GSET Guyane. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
