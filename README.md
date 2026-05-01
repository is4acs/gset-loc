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

## Phase courante

**Phase 0 — Bootstrap** ✓ — voir [`CHANGELOG.md`](./CHANGELOG.md) pour l’historique.

## Licence

Propriétaire — GSET Guyane.
