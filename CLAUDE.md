# GSET Location — Brief produit & règles métier

> Ce document est le contexte de référence pour Claude Code et toute personne contribuant au projet. Lu en premier dans chaque session.

---

## Mission

**GSET Location** est une plateforme web de location de matériel BTP courte durée (1h, 2h, demi-journée, journée) pour la Guyane française. Deux volets :

1. **Outillage en libre-location** (marteau piqueur, scie à sol, dameuse, etc.) — caution gérée par empreinte CB Stripe
2. **Engins avec opérateur** (mini-pelle, camion nacelle) — pas de caution, opérateur GSET inclus dans le tarif

Tu travailles en **autonomie**, par incréments testables, en commitant régulièrement. Tu poses des questions **uniquement** quand un choix structurant n’est pas tranché dans ce document.

---

## Stack technique imposée

| Couche                 | Choix                                              |
| ---------------------- | -------------------------------------------------- |
| Framework              | Next.js 16 (App Router) + TypeScript               |
| UI                     | Tailwind CSS v4 + shadcn/ui                        |
| ORM                    | Prisma 7                                           |
| DB + Auth + Storage    | Supabase (Postgres + Auth + Storage)               |
| Paiement + KYC         | Stripe (Payment Intents + Identity)                |
| Signature électronique | Yousign                                            |
| SMS (Phase 2)          | Twilio ou OVH SMS — TBD                            |
| Email transactionnel   | Resend                                             |
| Hébergement            | Vercel (web) + Supabase (backend)                  |
| Validation             | Zod                                                |
| Forms                  | react-hook-form + Zod                              |
| State                  | Zustand (client) + Server Actions                  |
| Tests                  | Vitest (unit) + Playwright (e2e)                   |
| CI                     | GitHub Actions (lint + typecheck + format + tests) |

**Langue de l’interface : français.** Code et commentaires en anglais. Variables et noms de fonctions en anglais.

---

## Structure projet

```
gset-loc/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Site vitrine + catalogue
│   ├── (auth)/                   # Connexion, inscription, KYC
│   ├── (client)/                 # Espace client connecté
│   ├── (admin)/                  # Back-office GSET
│   ├── api/                      # Routes API (webhooks, etc.)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn components
│   └── domain/                   # composants métier
├── lib/
│   ├── auth/                     # Helpers Supabase Auth
│   ├── stripe/                   # Wrappers Stripe (pre-auth, capture, refund)
│   ├── pricing/                  # Calcul tarifs, cautions, TVA
│   ├── booking/                  # Disponibilité, conflits
│   ├── kyc/                      # Stripe Identity
│   ├── notifications/            # Email + SMS
│   ├── pdf/                      # Génération facture PDF
│   ├── db.ts                     # Singleton Prisma
│   └── utils.ts                  # cn() + helpers
├── prisma/
│   └── schema.prisma
├── tests/
│   ├── unit/
│   └── e2e/
├── .github/workflows/ci.yml
├── .env.example
├── README.md
├── CHANGELOG.md
└── CLAUDE.md
```

---

## Règles métier critiques

### Tarification

- **TVA Guyane = 8,5 %** (taux dérogatoire DOM, à ne pas oublier dans tous les calculs)
- Tarifs stockés en **cents** (Int) pour éviter les erreurs flottantes
- Le tarif horaire est applicable de 1h à 3h59 (les slots disponibles V1 sont `HOUR_1` et `HOUR_2`). À partir de 4h on bascule sur demi-journée. À partir de 8h, sur journée. Logique dans `lib/pricing/computeRate.ts`, tests exhaustifs dans `lib/pricing/computeRate.test.ts`.
- La caution n’est **pas** soumise à TVA (empreinte non capturée par défaut).

### Caution adaptative — `lib/pricing/computeDeposit.ts`

```typescript
// Niveau de confiance selon profilage
const DEPOSIT_MULTIPLIER = {
  STANDARD: 1.0, // Première location
  CONFIRMED: 0.75, // 3+ locations sans incident
  PREMIUM: 0.5, // 10+ locations + KBIS pro vérifié
};

// Engin avec opérateur = caution toujours 0
if (equipment.requiresOperator) return 0;
// Sinon : baseDeposit * multiplier
```

Auto-promotion `STANDARD → CONFIRMED` après 3 bookings `COMPLETED` sans `Inspection.hasIssue=true`.

### Disponibilité — `lib/booking/checkAvailability.ts`

Une `EquipmentUnit` est disponible sur un créneau si :

- Statut = `AVAILABLE`
- Aucune `Booking` non annulée ne se chevauche avec ce créneau
- Tampon de **30 min** entre 2 locations consécutives (nettoyage, check-in/out)

### KYC obligatoire avant 1ère location

1. Inscription email/password (Supabase Auth)
2. À la 1ère tentative de réservation → redirection vers `/kyc` si `kycStatus !== VERIFIED`
3. Stripe Identity verification
4. Webhook Stripe met à jour `kycStatus`
5. Pro : étape supplémentaire upload KBIS + validation manuelle admin

### Empreinte CB (Stripe Pre-Authorization)

Ne **jamais** créer un Charge classique pour la caution. Utiliser `PaymentIntent` avec `capture_method: 'manual'`. Au retour OK : `paymentIntents.cancel()`. En cas de débit : `paymentIntents.capture(amount)` du montant exact des dommages.

```typescript
const intent = await stripe.paymentIntents.create({
  amount: depositAmount,
  currency: 'eur',
  customer: user.stripeCustomerId,
  payment_method: paymentMethodId,
  capture_method: 'manual',
  confirm: true,
  off_session: true,
  metadata: { bookingId, type: 'deposit' },
});
```

### CACES & engins avec opérateur

Si `equipment.requiresOperator === true` :

- Le client ne peut pas le retirer en agence : il fournit une adresse d’intervention
- L’admin assigne un `operatorUserId` (utilisateur `role: OPERATOR`, CACES correspondant en BDD)
- Le tarif inclut l’opérateur (pas de surcoût visible côté client)
- La caution = 0

### Numérotation séquentielle

- Réservations : `GSET-{YYYY}-{NNNNN}` (00001 à 99999, reset annuel)
- Factures : `F-{YYYY}-{NNNNN}`

---

## Phasage

Travail **par phases**, commit Git à chaque palier. **Ne pas commencer la phase N+1 sans avoir testé la phase N.**

- **Phase 0 — Bootstrap** : `chore: init` (en cours)
- **Phase 1 — Auth + KYC** : Supabase Auth, Stripe Identity, profils
- **Phase 2 — Catalogue public** : landing, fiches produit, seed des 13 équipements
- **Phase 3 — Réservation + Paiement** : Stripe PaymentIntents, empreinte CB, emails
- **Phase 4 — État des lieux + Retour** : tablette terrain, capture signature, génération PDF
- **Phase 5 — Back-office admin** : planning, flotte, utilisateurs, litiges
- **Phase 6 — Polish + déploiement** : Lighthouse, mentions légales, Sentry, Vercel prod

**Hors scope V1** : app native, dashboard tracking GPS, comptes pro multi-utilisateurs, programme fidélité, livraison avec suivi temps réel, paiement à 30j, intégration ERP.

---

## UI/UX

- Mobile-first, breakpoints Tailwind standard
- Hero : photo de chantier guyanais, slogan « Le matériel BTP qu’il vous faut. À l’heure ou à la journée. Réservé en 2 minutes. »
- Couleurs : primary `#1F4E79` (bleu institutionnel), accent `#D9822B` (orange chantier)
- Police : Inter (Google Fonts)
- Tonalité : vouvoiement chaleureux mais direct, pas de superlatifs marketing
- Aucune animation tape-à-l’œil, pas de Framer Motion sauf besoin réel
- Composants shadcn de base : Button, Input, Card, Sheet, Dialog, Calendar, Form, Toast

---

## Sécurité

- Toute action mutante = Server Action ou route API avec auth check
- RLS Supabase active sur toutes les tables (un user ne voit que ses propres bookings, factures, etc.)
- Validation Zod côté serveur sur **toutes** les entrées
- Rate limiting sur les routes sensibles
- Pas de secret en client. `NEXT_PUBLIC_*` réservé au strict nécessaire
- Webhooks Stripe : vérification de signature obligatoire
- CSRF géré par Next.js Server Actions natifs
- Logs sans PII dans Sentry

---

## Definition of Done

Une feature est _done_ quand :

- `pnpm lint` et `pnpm typecheck` sans warning
- Tests unitaires écrits pour la logique métier (pricing, availability, deposit)
- Test e2e Playwright pour le happy path utilisateur
- Migration Prisma générée et appliquée
- Variables d’env documentées dans `.env.example`
- Commit Conventional Commits (`feat:`, `fix:`, `chore:`...)
- Branche poussée et CI verte avant merge

---

## Annexe — Grille tarifaire à seeder (Phase 2)

| Slug                    | Nom                            | Catégorie  | Op. | Horaire | 1/2 J | Journée | Caution |
| ----------------------- | ------------------------------ | ---------- | --- | ------- | ----- | ------- | ------- |
| mini-pelle-1-8t         | Mini-pelle 1.8T                | Engins     | ✓   | 110 €   | 400 € | 650 €   | 0       |
| mini-pelle-3-5t         | Mini-pelle 3.5T                | Engins     | ✓   | 130 €   | 470 € | 780 €   | 0       |
| camion-nacelle          | Camion nacelle                 | Engins     | ✓   | 130 €   | 450 € | 750 €   | 0       |
| compresseur-tracte-op   | Compresseur tracté + opérateur | Engins     | ✓   | 85 €    | 300 € | 500 €   | 0       |
| marteau-piqueur-elec    | Marteau piqueur électrique     | Démolition | ✗   | 12 €    | 35 €  | 60 €    | 300 €   |
| marteau-piqueur-therm   | Marteau piqueur thermique      | Démolition | ✗   | 18 €    | 50 €  | 85 €    | 500 €   |
| scie-a-sol              | Scie à sol thermique           | Découpe    | ✗   | 25 €    | 70 €  | 120 €   | 800 €   |
| plaque-vibrante         | Plaque vibrante                | Compactage | ✗   | 15 €    | 45 €  | 75 €    | 400 €   |
| dameuse                 | Dameuse à percussion           | Compactage | ✗   | 20 €    | 55 €  | 95 €    | 600 €   |
| meuleuse-230            | Meuleuse 230 mm                | Découpe    | ✗   | 8 €     | 22 €  | 38 €    | 150 €   |
| perforateur-sds-max     | Perforateur SDS-Max            | Perçage    | ✗   | 10 €    | 28 €  | 48 €    | 250 €   |
| groupe-electrogene-5kva | Groupe électrogène 5 kVA       | Énergie    | ✗   | 12 €    | 35 €  | 60 €    | 500 €   |
| compresseur-tracte      | Compresseur tracté             | Énergie    | ✗   | 20 €    | 55 €  | 95 €    | 1 200 € |
