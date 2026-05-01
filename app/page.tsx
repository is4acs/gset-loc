export default function HomePage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <span className="bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-medium">
        En préparation
      </span>
      <h1 className="text-primary max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Le matériel BTP qu’il vous faut.
        <br />
        À l’heure ou à la journée.
        <br />
        <span className="text-accent">Réservé en 2 minutes.</span>
      </h1>
      <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
        GSET Location — la plateforme de location de matériel BTP courte durée pour la Guyane
        française. Catalogue, réservation et paiement en ligne disponibles bientôt.
      </p>
    </main>
  );
}
