export const metadata = { title: 'Mentions légales' };

export default function MentionsLegalesPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl px-6 py-12 text-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Mentions légales</h1>

      <h2 className="mt-8 text-lg font-semibold">Éditeur</h2>
      <p>
        GSET Guyane{/* TODO: SARL/SAS, capital social */}
        <br />
        Adresse : {/* TODO: adresse postale */}
        <br />
        SIRET : {/* TODO: SIRET */}
        <br />
        TVA intracommunautaire : {/* TODO: TVA */}
        <br />
        Email : contact@gset.fr {/* TODO: confirmer */}
        <br />
        Téléphone : {/* TODO: téléphone */}
      </p>

      <h2 className="mt-8 text-lg font-semibold">Directeur de la publication</h2>
      <p>{/* TODO: nom + qualité */}</p>

      <h2 className="mt-8 text-lg font-semibold">Hébergeur</h2>
      <p>
        Vercel Inc.
        <br />
        440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
        <br />
        Site : <a href="https://vercel.com">vercel.com</a>
      </p>

      <h2 className="mt-8 text-lg font-semibold">Propriété intellectuelle</h2>
      <p>
        L’ensemble des contenus présents sur ce site (textes, images, marques) sont la propriété
        exclusive de GSET Guyane, sauf mention contraire. Toute reproduction sans autorisation est
        interdite.
      </p>

      <p className="text-muted-foreground mt-12 text-xs">
        Document à finaliser avec votre conseil juridique avant mise en production.
      </p>
    </article>
  );
}
