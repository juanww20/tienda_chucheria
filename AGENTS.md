@AGENTS.md

# Chuchu — Multi-tenant Digital Menu SaaS

Small SaaS for snack/candy shops. UI language is **Spanish** (respond in Spanish here).
Deployed on **Vercel**. Package manager is **pnpm** (not npm).

## Stack
- Next.js 16 (App Router, Turbopack, React Compiler on), React 19, TypeScript strict.
- Tailwind v4 (theme tokens in `src/app/globals.css`: primary `#8e44ad`, secondary `#f06292`, tertiary `#4dd0e1`, cuaternary `#fff176`, quinary `#d81b60`).
- Supabase (Postgres + Auth + Storage) for persistence/auth/logo uploads.
- GSAP + `@gsap/react` (`useGSAP`) for animation; Swiper for the TV menu. framer-motion still present but new code uses GSAP.

## Roles & routes
- `/login` — email+password (Supabase Auth). Redirects by role.
- `/owner` — owner console: create/delete companies (name, logo, admin gmail+password). Owner-only.
- `/admin` — per-tenant panel, scoped to the logged-in admin's company. Co-branding "Chuchu | <empresa>". Tabs: Ventas&Combos, Inventario, Sugerencias IA, Reportes, Ajustes.
- `/display/<slug>` — public per-tenant TV menu; shows only combos with `on_tv=true`; self-refreshes every 20s.
- `/` — redirects by session/role.

## Data model (`supabase/schema.sql`)
`companies, profiles(role owner|admin, company_id), products, combos, combo_items, sales`.
RLS isolates each tenant via `current_company_id()` / `is_owner()` (security-definer fns).
Storage bucket `logos` is public-read; uploads happen server-side with the service role.

## Supabase clients (`src/lib/supabase/`)
- `client.ts` — browser (publishable key).
- `server.ts` — server components/actions, cookie-based session.
- `admin.ts` — **service-role, server only**, bypasses RLS. Used for owner ops, logo uploads, and the `companies` UPDATE (no UPDATE RLS policy exists for companies).
- `middleware.ts` + root `middleware.ts` — refresh session, gate `/owner` (owner) and `/admin` (auth).

## Key conventions
- Mutations are **server actions** (`src/app/*/actions.ts`) called via `<form action={...}>`; they `revalidatePath` after writing. Tenant CRUD uses the RLS-scoped user client; owner/cross-tenant ops use the service-role client.
- Selling a product (`recordSale`) or combo (`sellCombo`) decrements stock and inserts a `sales` row — this feeds the rotation algorithm.
- Rotation algorithm (`src/lib/algorithm.ts`): velocity from `sales` over 30d, pairs fast+slow sellers, suggests a combo at 15% off. Surfaced in the Sugerencias IA tab; one click creates the combo.
- Shared types in `src/lib/types.ts`. Session/company helper in `src/lib/auth.ts`.
- next/image: remote logos allowed via `*.supabase.co` in `next.config.ts`.

## Env (`.env.local`, gitignored)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable), `SUPABASE_SERVICE_ROLE_KEY` (secret). Same three vars must be set in Vercel.

## Owner bootstrap (manual, one time)
Create an auth user in Supabase (auto-confirm), then `insert into profiles (id,email,role) values ('<uuid>', '<email>', 'owner')`. See the comment block at the end of `supabase/schema.sql`.

## Commands
- `pnpm dev` — local dev.
- `pnpm build` — production build (runs typecheck).
