import Link from 'next/link';
import { listCategories } from '@/lib/catalog/queries';

export const metadata = {
  title: 'GSET Location — Location de matériel BTP en Guyane',
  description:
    'Marteau piqueur, scie à sol, mini-pelle… Réservez en 2 minutes du matériel BTP à l’heure ou à la journée en Guyane. Caution gérée par empreinte CB Stripe.',
};

export default async function HomePage() {
  const categories = await listCategories();

  return (
    <>
      {/* HERO */}
      <section className="from-primary via-primary to-primary/85 relative overflow-hidden bg-gradient-to-br">
        <div className="bg-accent/10 absolute inset-y-0 right-0 w-1/2 [mask-image:linear-gradient(to_left,black,transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="max-w-2xl">
            <p className="text-primary-foreground/80 text-sm font-medium tracking-wide uppercase">
              Guyane française
            </p>
            <h1 className="text-primary-foreground mt-4 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
              Le matériel BTP qu’il vous faut.
              <br />À l’heure ou à la journée.
            </h1>
            <p className="text-primary-foreground/80 mt-6 max-w-lg text-base sm:text-lg">
              Outillage en libre-location, engins avec opérateur GSET. Caution gérée par empreinte
              CB. Réservé en 2 minutes.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/catalogue"
                className="bg-accent text-accent-foreground hover:bg-accent/90 inline-flex h-11 items-center rounded-md px-6 text-sm font-medium"
              >
                Voir le catalogue
              </Link>
              <Link
                href="/inscription"
                className="text-primary-foreground hover:bg-primary-foreground/10 inline-flex h-11 items-center rounded-md border border-white/30 px-6 text-sm font-medium"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Catégories</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {categories.length} familles d’équipement.
            </p>
          </div>
          <Link href="/catalogue" className="text-primary text-sm font-medium hover:underline">
            Voir tout →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogue?categorie=${cat.slug}`}
              className="group bg-background rounded-lg border p-5 transition-shadow hover:shadow-md"
            >
              <h3 className="group-hover:text-primary text-base font-semibold transition-colors">
                {cat.name}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">{cat.description}</p>
              <p className="text-muted-foreground/80 mt-4 text-xs">
                {cat._count.equipments} équipement{cat._count.equipments > 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-muted/30 border-y">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Comment ça marche</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <div>
              <div className="bg-primary text-primary-foreground inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                1
              </div>
              <h3 className="mt-4 text-base font-semibold">Inscrivez-vous</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Compte particulier ou pro avec KBIS. Vérification d’identité Stripe en 2 minutes.
              </p>
            </div>
            <div>
              <div className="bg-primary text-primary-foreground inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                2
              </div>
              <h3 className="mt-4 text-base font-semibold">Réservez votre matériel</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Choisissez le créneau (1h, 2h, demi-journée, journée). La caution se fait par
                empreinte CB — aucun débit tant que tout va bien.
              </p>
            </div>
            <div>
              <div className="bg-primary text-primary-foreground inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                3
              </div>
              <h3 className="mt-4 text-base font-semibold">Récupérez ou recevez</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Outillage à retirer en agence. Engins livrés avec un opérateur GSET sur votre
                chantier.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
