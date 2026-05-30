# MadaShop — Madagascar Trilingual Cross-Border E-Commerce

This is a Next.js 15 (App Router) + TypeScript trilingual e-commerce platform for Madagascar,
supporting both self-owned products and China agent purchasing (代购).

## Key Directories

- `prisma/schema.prisma` — Full data model
- `prisma/seed.ts` — Seed data (admin, categories, sample products, settings)
- `messages/` — UI copy (fr/en/zh)
- `src/app/[locale]/` — Front-end pages (locale-prefixed)
- `src/app/admin/` — Admin panel (no locale prefix)
- `src/app/api/` — API routes
- `src/lib/` — Core utilities
  - `db.ts` — Prisma client singleton
  - `i18n.ts` — next-intl config
  - `pricing.ts` — Fee/price calculations (Decimal.js, no float)
  - `orderStateMachine.ts` — Order status transition rules
  - `translate.ts` — Claude API product translation
  - `payments/Provider.ts` — Unified payment provider interface
  - `payments/ManualProvider.ts` — Bank transfer / manual payment
  - `importers/ManualImporter.ts` — Manual product import

## Business Logic

### Order Status Machine
See `src/lib/orderStateMachine.ts` for all valid transitions.
AGENT orders: DRAFT → QUOTED → DEPOSIT_PENDING → DEPOSIT_PAID → PROCURING → PURCHASED →
              AT_CN_WAREHOUSE → BALANCE_PENDING → BALANCE_PAID → INTL_SHIPPING →
              ARRIVED_MG → READY_FOR_PICKUP → COMPLETED
SELF orders: DRAFT → DEPOSIT_PENDING → DEPOSIT_PAID → READY_FOR_PICKUP → COMPLETED

### Currency
All prices stored as Decimal (MGA). CNY cost price also stored for cost tracking.
Exchange rate in Setting table (key: "exchange_rate_cny_mga").

### Locales
Supported: fr (default), en, zh
URL pattern: /fr/..., /en/..., /zh/...

## Development Commands

```bash
npm run dev          # Start dev server
npm run db:push      # Push schema to DB (dev)
npm run db:migrate   # Create migration
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm run build        # Production build
```

## Environment Setup

Copy `.env.example` to `.env` and fill in:
- DATABASE_URL + DIRECT_URL (Supabase PostgreSQL)
- NEXT_PUBLIC_SUPABASE_URL + keys
- ANTHROPIC_API_KEY
- STRIPE_SECRET_KEY (optional)
- RESEND_API_KEY (optional)
