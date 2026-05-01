import Link from 'next/link';
import Image from 'next/image';
import { listCategories, listEquipments } from '@/lib/catalog/queries';
import { formatEurosFromCents } from '@/lib/format';

export const metadata = {
  title: 'Catalogue',
  description: 'Catalogue complet du matériel BTP disponible à la location en Guyane.',
};

type SearchParams = Promise<{ categorie?: string; operator?: string }>;

export default async function CataloguePage({ searchParams }: { searchParams: SearchParams }) {
  const { categorie, operator } = await searchParams;
  const requiresOperator = operator === 'true' ? true : operator === 'false' ? false : undefined;

  const [categories, equipments] = await Promise.all([
    listCategories(),
    listEquipments({ categorySlug: categorie, requiresOperator }),
  ]);

  const activeCat = categories.find((c) => c.slug === categorie);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          {activeCat ? activeCat.name : 'Catalogue'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {equipments.length} équipement{equipments.length > 1 ? 's' : ''} disponible
          {equipments.length > 1 ? 's' : ''}.
        </p>
      </header>

      {/* Filters */}
      <nav aria-label="Filtres" className="mb-8 flex flex-wrap gap-2">
        <FilterChip label="Tous" href="/catalogue" active={!categorie && !operator} />
        {categories.map((cat) => (
          <FilterChip
            key={cat.id}
            label={cat.name}
            href={`/catalogue?categorie=${cat.slug}`}
            active={categorie === cat.slug}
          />
        ))}
        <span className="bg-border mx-1 w-px self-stretch" />
        <FilterChip
          label="Avec opérateur"
          href={`/catalogue?operator=true${categorie ? `&categorie=${categorie}` : ''}`}
          active={operator === 'true'}
        />
        <FilterChip
          label="Libre-service"
          href={`/catalogue?operator=false${categorie ? `&categorie=${categorie}` : ''}`}
          active={operator === 'false'}
        />
      </nav>

      {/* Grid */}
      {equipments.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center">
          Aucun équipement ne correspond à ces filtres.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {equipments.map((eq) => (
            <Link
              key={eq.id}
              href={`/outil/${eq.slug}`}
              className="group bg-background overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
            >
              <div className="bg-muted relative aspect-[4/3]">
                {eq.images[0] && (
                  <Image
                    src={eq.images[0]}
                    alt={eq.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
                {eq.requiresOperator && (
                  <span className="bg-accent text-accent-foreground absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium">
                    Avec opérateur
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-muted-foreground text-xs uppercase">{eq.category.name}</p>
                <h2 className="group-hover:text-primary mt-1 text-base font-semibold transition-colors">
                  {eq.name}
                </h2>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{eq.shortDesc}</p>
                <p className="mt-3 text-sm">
                  <span className="text-muted-foreground">À partir de </span>
                  <span className="font-semibold">
                    {formatEurosFromCents(eq.hourlyRate, { hideCentsWhenZero: true })}
                  </span>
                  <span className="text-muted-foreground"> / h</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'hover:border-foreground/30 hover:bg-muted'
      }`}
    >
      {label}
    </Link>
  );
}
