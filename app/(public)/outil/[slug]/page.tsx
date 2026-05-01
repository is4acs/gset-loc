import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAllEquipmentSlugs, getEquipmentBySlug } from '@/lib/catalog/queries';
import { formatEurosFromCents } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getAllEquipmentSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const eq = await getEquipmentBySlug(slug);
  if (!eq) return {};
  return {
    title: eq.name,
    description: eq.shortDesc,
  };
}

export default async function EquipmentPage({ params }: { params: Params }) {
  const { slug } = await params;
  const eq = await getEquipmentBySlug(slug);
  if (!eq || !eq.isActive) notFound();

  const specs = (eq.specs ?? {}) as Record<string, string>;
  const specEntries = Object.entries(specs);

  return (
    <article className="mx-auto max-w-5xl px-6 py-10">
      <nav className="text-muted-foreground mb-6 text-xs">
        <Link href="/catalogue" className="hover:text-primary">
          Catalogue
        </Link>
        <span className="mx-1">/</span>
        <Link href={`/catalogue?categorie=${eq.category.slug}`} className="hover:text-primary">
          {eq.category.name}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-lg">
          {eq.images[0] && (
            <Image
              src={eq.images[0]}
              alt={eq.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          )}
          {eq.requiresOperator && (
            <span className="bg-accent text-accent-foreground absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-medium">
              Avec opérateur
            </span>
          )}
        </div>

        {/* Header + CTA */}
        <div>
          <p className="text-muted-foreground text-xs uppercase">{eq.category.name}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{eq.name}</h1>
          <p className="text-muted-foreground mt-3 text-base">{eq.shortDesc}</p>

          {eq.requiresOperator ? (
            <div className="bg-accent/10 mt-6 rounded-md p-4 text-sm">
              <p className="text-accent-foreground font-medium">Engin avec opérateur GSET</p>
              <p className="text-muted-foreground mt-1">
                {eq.requiresCaces && (
                  <>
                    Conducteur certifié <span className="font-medium">{eq.requiresCaces}</span>{' '}
                    inclus dans le tarif. Aucune caution.
                  </>
                )}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground mt-6 text-sm">
              Caution sur empreinte CB :{' '}
              <span className="text-foreground font-semibold">
                {formatEurosFromCents(eq.baseDeposit, { hideCentsWhenZero: true })}
              </span>
              . Aucun débit tant que le matériel revient OK.
            </p>
          )}

          <Link
            href={`/reservation/nouvelle?equipment=${eq.slug}`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex h-11 items-center rounded-md px-6 text-sm font-medium"
          >
            Réserver
          </Link>
          <p className="text-muted-foreground mt-2 text-xs">
            Vous serez invité à vous connecter ou créer un compte.
          </p>
        </div>
      </div>

      {/* Body grid */}
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">{eq.description}</p>
            </CardContent>
          </Card>

          {specEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Caractéristiques</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-border grid divide-y text-sm sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0">
                  {specEntries.map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 sm:border-b sm:py-3">
                      <dt className="text-muted-foreground">{key}</dt>
                      <dd className="text-foreground font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tarifs</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <RateLine label="1 heure" cents={eq.hourlyRate} />
              <RateLine label="2 heures" cents={eq.hourlyRate * 2} />
              <RateLine label="Demi-journée (4h)" cents={eq.halfDayRate} />
              <RateLine label="Journée (8h)" cents={eq.dayRate} />
            </dl>
            <p className="text-muted-foreground mt-4 text-xs">
              Tarifs HT (TVA 8,5 % Guyane appliquée à la facturation).
            </p>
          </CardContent>
        </Card>
      </div>
    </article>
  );
}

function RateLine({ label, cents }: { label: string; cents: number }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground font-semibold">
        {formatEurosFromCents(cents, { hideCentsWhenZero: true })}
      </dd>
    </div>
  );
}
