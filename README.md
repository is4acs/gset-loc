# GSET Location

Plateforme web de location de matériel BTP courte durée pour la Guyane française.

> Pour le contexte produit, les règles métier et le phasage, voir [`CLAUDE.md`](./CLAUDE.md).

## Stack

Next.js 16 · TypeScript · Tailwind v4 · shadcn/ui · Prisma 7 · Supabase · Stripe · Vitest · Playwright · pnpm

## Prérequis

- Node 22+
- pnpm 10+ (installé via `corepack enable`)
- Un projet Supabase (Postgres + Auth + Storage)
- Un compte Stripe (clés test pour le développement)

## Démarrage

```bash
# Installer les dépendances
pnpm install

# Copier les variables d'environnement
cp .env.example .env
# puis éditer .env avec les valeurs réelles

# Générer le client Prisma
pnpm db:generate

# Appliquer les migrations sur la base de dev
pnpm db:migrate

# Lancer le serveur de développement
pnpm dev
```

Le site est disponible sur http://localhost:3000.

## Scripts disponibles

| Script              | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `pnpm dev`          | Serveur Next.js en dev (HMR)                            |
| `pnpm build`        | Build de production                                     |
| `pnpm start`        | Démarre le serveur de production (après `build`)        |
| `pnpm lint`         | ESLint                                                  |
| `pnpm lint:fix`     | ESLint avec auto-fix                                    |
| `pnpm typecheck`    | `tsc --noEmit`                                          |
| `pnpm format`       | Prettier (réécriture)                                   |
| `pnpm format:check` | Prettier (vérification, ne modifie pas)                 |
| `pnpm test`         | Tests unitaires Vitest (CI mode)                        |
| `pnpm test:watch`   | Tests Vitest en watch                                   |
| `pnpm test:ui`      | Interface graphique Vitest                              |
| `pnpm test:e2e`     | Tests end-to-end Playwright                             |
| `pnpm db:generate`  | Régénère le client Prisma                               |
| `pnpm db:migrate`   | Crée et applique une migration en dev                   |
| `pnpm db:push`      | Pousse le schéma sans créer de migration (proto rapide) |
| `pnpm db:studio`    | Ouvre Prisma Studio                                     |
| `pnpm db:seed`      | Seed du catalogue (Phase 2)                             |

## Variables d'environnement

Voir [`.env.example`](./.env.example) pour la liste complète, avec des commentaires expliquant où récupérer chaque valeur. À retenir :

- `DATABASE_URL` (pooled) + `DIRECT_URL` (direct) pour Supabase Postgres
- `NEXT_PUBLIC_SUPABASE_*` pour le client browser
- `SUPABASE_SERVICE_ROLE_KEY` côté serveur uniquement
- `STRIPE_*` pour paiements et empreintes CB
- `RESEND_*` pour les emails transactionnels

## Tests

```bash
# Tests unitaires (logique métier dans lib/)
pnpm test

# Tests e2e (Playwright lance le dev server automatiquement)
pnpm test:e2e:install   # première fois uniquement (télécharge les browsers)
pnpm test:e2e
```

## Conventions

- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, etc.). Pre-commit hook : Prettier auto-format. Commit-msg hook : commitlint.
- **Code** : anglais (identifiants, commentaires, noms de fichiers).
- **UI / strings utilisateur** : français.
- **Argent** : toujours en cents (Int), jamais en float.
- **Server Actions** ou routes API protégées pour toute mutation.

## Phases

| Phase | Statut  | Description                                              |
| ----- | ------- | -------------------------------------------------------- |
| 0     | ✓       | Bootstrap (Next + Tailwind + Prisma + Supabase + Stripe) |
| 1     | ✓       | Auth + KYC (Supabase + Stripe Identity)                  |
| 2     | ✓       | Catalogue public (13 équipements + filtres + SEO)        |
| 3     | ✓       | Réservation + paiement Stripe + empreinte CB             |
| 4     | ✓ (min) | Facture PDF + email — état des lieux à venir             |
| 5     | ✓ (min) | Admin dashboard + bookings + flotte                      |
| 6     | ✓       | Pages légales + Vercel config + deploy                   |

## Déploiement (Vercel + Supabase)

1. **Pousser sur GitHub** — la branche `main` est suivie par Vercel.
2. **Créer le projet Vercel** : https://vercel.com/new → Import depuis GitHub. Vercel détecte Next.js.
3. **Variables d’environnement** (Vercel → Settings → Environment Variables) — copier celles de `.env.example` avec les valeurs prod :
   - `DATABASE_URL` = Supabase **transaction pooler** (port 6543)
   - `DIRECT_URL` = Supabase **session pooler** ou direct (port 5432)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_APP_URL` = `https://votre-domaine.fr`
4. **Configurer le webhook Stripe prod** : Stripe Dashboard → Developers → Webhooks → Add endpoint
   - URL : `https://votre-domaine.fr/api/webhooks/stripe`
   - Events : `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`, `identity.verification_session.verified`, `identity.verification_session.requires_input`, `identity.verification_session.canceled`
   - Copier le `whsec_...` dans `STRIPE_WEBHOOK_SECRET` côté Vercel
5. **Configurer Supabase** :
   - Bucket Storage `invoices` à créer (Public bucket activé)
   - Authentication → URL Configuration → Redirect URLs : ajouter `https://votre-domaine.fr/auth/confirm`
   - Authentication → Email Templates : adapter en français
6. **Promouvoir un user en ADMIN** (depuis Supabase Studio → SQL Editor) :
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@gset.fr';
   ```

Le déploiement est ensuite automatique : chaque push sur `main` déclenche une nouvelle build Vercel.

## Phase courante

Toutes les phases V1 sont implémentées. Voir [`CHANGELOG.md`](./CHANGELOG.md).

## Licence

Propriétaire — GSET Guyane.
