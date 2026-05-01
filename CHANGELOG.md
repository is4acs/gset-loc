# Changelog

Tous les changements notables de ce projet sont documentés dans ce fichier.

Le format est inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et le projet suit un versioning sémantique pour les releases.

## [Unreleased]

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
