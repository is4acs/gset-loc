export const metadata = { title: 'Conditions générales de vente' };

export default function CgvPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl px-6 py-12 text-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Conditions générales de location</h1>
      <p className="text-muted-foreground mt-1 text-xs">
        Version provisoire — à valider avec votre conseil juridique.
      </p>

      <h2 className="mt-8 text-lg font-semibold">1. Objet</h2>
      <p>
        Les présentes conditions régissent les locations de matériel BTP courte durée (1h, 2h,
        demi-journée, journée, multi-jours) entre GSET Guyane et le client, particulier ou
        professionnel.
      </p>

      <h2 className="mt-8 text-lg font-semibold">2. Tarifs et paiement</h2>
      <p>
        Les tarifs affichés sont en euros HT. La TVA dérogatoire DOM (8,5 %) est appliquée à la
        facturation conformément à l’article 296 du Code général des impôts. Le paiement est
        effectué intégralement en ligne via Stripe lors de la réservation.
      </p>

      <h2 className="mt-8 text-lg font-semibold">3. Caution (empreinte CB)</h2>
      <p>
        Pour les locations en libre-service, une empreinte CB (pré-autorisation) est effectuée à
        hauteur du montant de caution affiché. Elle n’est convertie en débit qu’en cas de dégât,
        perte ou retard imputable au client. À défaut, l’empreinte est libérée automatiquement sous
        7 jours après le retour du matériel.
      </p>
      <p>Aucune caution n’est demandée pour les locations d’engins avec opérateur GSET.</p>

      <h2 className="mt-8 text-lg font-semibold">4. Vérification d’identité</h2>
      <p>
        Avant toute première location, le client doit vérifier son identité via Stripe Identity
        (norme eIDAS). Pour les comptes professionnels, un extrait KBIS est demandé.
      </p>

      <h2 className="mt-8 text-lg font-semibold">5. Annulation et remboursement</h2>
      <p>
        {/* TODO: détailler les conditions d'annulation */}
        Toute annulation au moins 24 heures avant le début de la location donne lieu à un
        remboursement intégral. En deçà, les frais sont retenus à 50 %.
      </p>

      <h2 className="mt-8 text-lg font-semibold">6. Responsabilité</h2>
      <p>
        Le client est responsable du matériel pendant toute la durée de la location. Toute
        détérioration constatée à l’état des lieux de retour donne lieu à débit de l’empreinte CB à
        hauteur des dommages.
      </p>

      <h2 className="mt-8 text-lg font-semibold">7. Litiges</h2>
      <p>
        En cas de litige, les parties s’efforceront de trouver une solution amiable. À défaut, les
        tribunaux de Cayenne seront seuls compétents.
      </p>
    </article>
  );
}
