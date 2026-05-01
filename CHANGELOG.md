# Changelog

Tous les changements notables de ce projet sont documentés dans ce fichier.

Le format est inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et le projet suit un versioning sémantique pour les releases.

## [Unreleased]

### Phase 6 — Deploy & legal placeholders

#### Added

- Pages légales placeholders (à finaliser avec un conseil juridique) :
  - `/mentions-legales`, `/cgv`, `/confidentialite`
- Footer public enrichi avec liens légaux
- `vercel.json` (région `cdg1`, runtime nodejs, maxDuration 30s sur le webhook)
- `/api/health` endpoint de liveness probe
- README étendu : section déploiement Vercel + Supabase pas-à-pas

### Phase 5 — Admin minimum

#### Added

- `/admin` (role `ADMIN` requis) — dashboard avec 4 KPIs (résa du jour, CA du mois, locations en cours, en attente), 8 dernières réservations, résumé flotte
- `/admin/reservations` — tableau filtrable par statut (200 dernières)
- `/admin/flotte` — table de tous les équipements avec toggle `isActive` (server action + revalidate /catalogue)
- `requireAdmin` helper

### Phase 4 minimum — Invoice PDF

#### Added

- Template PDF `lib/pdf/invoice.tsx` (@react-pdf/renderer, A4, charte GSET)
- `lib/pdf/generate-invoice.ts` (render to Buffer)
- `lib/storage/supabase-storage.ts` (upload via service-role)
- `lib/booking/issue-invoice.ts` (idempotent, génère `F-{YYYY}-{NNNNN}`)
- Webhook étendu : génération facture après confirmation
- `/factures` — liste utilisateur avec lien PDF
- Bucket Supabase Storage `invoices` à créer manuellement (Public)

### Phase 3 — Réservation + paiement

#### Added

- `/reservation/nouvelle` (auth + KYC requis) — form complet avec récap tarifaire en temps réel
- `/reservation/[reference]` — détails et statut
- `/mes-locations` — liste des bookings
- Disponibilité avec tampon 30 min, sélection auto d’unité disponible
- Numérotation séquentielle `GSET-{YYYY}-{NNNNN}`
- Pricing complet (HT + TVA Guyane + total + caution adaptative selon trustLevel)
- Stripe Checkout (mode payment, locale fr, setup_future_usage off_session)
- Webhook `checkout.session.completed` → empreinte CB en `capture_method=manual` + email confirmation
- `lib/notifications/email.ts` + `booking-emails.ts` (Resend)
- 9 tests unitaires supplémentaires (53 total)

### Phase 2 — Catalogue public

#### Added

- Seed Prisma : 6 catégories + 13 équipements + 29 unités (idempotent)
- `(public)` route group avec layout (header sticky + footer)
- Landing revisitée : hero brandé, grille catégories, "Comment ça marche"
- `/catalogue` avec filtres (catégorie, avec/sans opérateur) en query params
- `/outil/[slug]` avec image (Next/Image), description, caractéristiques, tarifs HT — 13 pages préerendues via `generateStaticParams`
- Helpers `lib/catalog/queries.ts` et `lib/format.ts`
- SEO : `app/sitemap.ts`, `app/robots.ts`, metadata par page
- `next.config.ts` : remotePatterns pour picsum.photos + Supabase Storage

### Phase 1 — Auth + KYC

#### Added

- Supabase Auth flows: signup, login, logout, password reset (server actions, French UI)
- Email confirmation callback (`/auth/confirm`) that verifies the OTP and creates the `User` row idempotently
- Next.js `proxy.ts` (formerly `middleware.ts` in Next 15) for session refresh + route protection on `/profil`, `/mes-locations`, `/factures`, `/kyc`, `/admin`
- Auth helpers: `getCurrentUser`, `requireUser`, `ensureDbUser`
- Profile page (`/profil`) with editable fields and PRO conditional fields (companyName, SIRET)
- KYC flow via Stripe Identity:
  - `/kyc` page that creates a hosted VerificationSession and redirects
  - `/kyc/retour` post-verification status display
  - `lib/stripe/identity.ts` + `lib/stripe/customer.ts` (idempotent customer creation)
- Stripe webhook handler at `/api/webhooks/stripe` with signature verification + handlers for `identity.verification_session.{verified, requires_input, canceled}`
- shadcn components: input, label, card, alert, separator, sonner
- react-hook-form + @hookform/resolvers integration
- Zod schemas for signup / login / password reset / profile + 17 new unit tests (44 total)
- CI workflow: added a production build step with placeholder envs to catch build-breaking changes

#### Changed

- Schema: `User.id` now stores Supabase `auth.users.id` (UUID), no cuid default
- Migrated `middleware.ts` → `proxy.ts` (Next 16 convention rename)

### Phase 0 — Bootstrap

#### Added

- Init Next.js 16 (App Router) + TypeScript + Tailwind v4
- ESLint, Prettier, Husky (pre-commit + commit-msg), lint-staged, commitlint config
- Vitest (tests unitaires) + Playwright (tests e2e)
- Prisma 7 + schéma de domaine complet (User, Equipment, EquipmentUnit, Booking, Inspection, Invoice, PaymentMethod)
- Clients Supabase : browser, server (cookies async), admin (service role)
- Module `lib/pricing` :
  - `computeRate` (HOUR_1, HOUR_2, HALF_DAY, DAY, MULTI_DAY)
  - `computeDeposit` (multiplicateur STANDARD/CONFIRMED/PREMIUM, engin opérateur → 0)
  - `computeVat` + `htToTtc` (TVA Guyane 8,5 %)
  - Tests unitaires complets sur ces 3 modules
- shadcn/ui initialisé (style base-nova, Tailwind v4) avec couleurs brand : primary `#1F4E79`, accent `#D9822B`
- Layout root en français + police Inter
- Workflow GitHub Actions CI : lint + typecheck + format check + unit tests sur push/PR `main`
- `.env.example` documenté (Supabase, Stripe, Resend, Yousign, etc.)
- `CLAUDE.md`, `README.md`, ce `CHANGELOG.md`
