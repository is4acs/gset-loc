export const metadata = { title: 'Politique de confidentialité' };

export default function ConfidentialitePage() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl px-6 py-12 text-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Politique de confidentialité</h1>
      <p className="text-muted-foreground mt-1 text-xs">
        Version provisoire — à valider avec votre DPO / conseil RGPD.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Responsable de traitement</h2>
      <p>
        GSET Guyane est responsable du traitement de vos données personnelles dans le cadre de votre
        utilisation de la plateforme.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Données collectées</h2>
      <ul className="list-disc pl-6">
        <li>Identité et coordonnées (email, prénom, nom, téléphone)</li>
        <li>Pour les pros : raison sociale, SIRET, KBIS</li>
        <li>Données de vérification d’identité (via Stripe Identity)</li>
        <li>Historique de location et de paiement</li>
        <li>Données de navigation (cookies techniques uniquement)</li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Sous-traitants</h2>
      <ul className="list-disc pl-6">
        <li>Supabase (Frankfurt) — base de données et authentification</li>
        <li>Stripe (Irlande) — paiement et vérification d’identité</li>
        <li>Vercel (États-Unis) — hébergement web</li>
        <li>Resend (États-Unis) — emails transactionnels</li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement,
        d’opposition, de limitation et de portabilité. Pour exercer ces droits : privacy@gset.fr{' '}
        {/* TODO: confirmer */}.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Conservation</h2>
      <p>
        Les données de facturation sont conservées 10 ans (obligation légale comptable). Les autres
        données sont supprimées 3 ans après la dernière interaction.
      </p>
    </article>
  );
}
