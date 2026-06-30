# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SiteBrief AI — an "AI Website Agency" platform. This repo holds the **Sprint 1
foundation**: Supabase auth, a protected dashboard shell, project CRUD, and a
typed data layer with row-level security. No AI generation or billing yet.

## Commands

```bash
npm run dev         # next dev --turbopack (localhost:3000)
npm run build       # production build
npm run start       # serve production build
npm run lint        # next lint
npm run type-check  # tsc --noEmit
npm run format      # prettier --write
```

No test runner is configured yet. After any non-trivial change, run
`type-check`, `lint`, and `build` — the build is the gate.

## Environment

`lib/env.ts` validates env vars with zod **at import time** — a missing
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` throws on boot and
fails `next build`. A gitignored `.env.local` with placeholder values exists so
the app builds locally without a live Supabase project. Server-only secrets
(`SUPABASE_SERVICE_ROLE_KEY`) are reached via `serverEnv()`, which throws if
called on the client.

## Architecture

- **Next.js 15 App Router + React 19**, TypeScript strict. Route groups:
  `app/(auth)` (public) and `app/(dashboard)` (protected). Auth is via Server
  Actions in `app/(auth)/actions.ts`; project mutations in
  `app/(dashboard)/projects/actions.ts`.
- **Auth & route protection** live in `middleware.ts` → `lib/supabase/middleware.ts`:
  every navigation refreshes the Supabase session and redirects based on
  `PROTECTED_PREFIXES` / `AUTH_ROUTES` in `lib/constants.ts`. Server Components
  call `requireUser()` (`lib/auth.ts`) as a second guard.
- **Three Supabase clients**, do not mix them up: `lib/supabase/client.ts`
  (browser), `lib/supabase/server.ts` (`createClient` cookie-bound + privileged
  `createAdminClient`), and `lib/supabase/middleware.ts`. All are typed with
  `Database` from `types/database.ts`.
- **Service layer** (`lib/services/*`) holds all data access + domain logic and
  returns a `Result<T>` discriminated union (`lib/errors.ts`) instead of
  throwing. `audit.ts` (`recordAudit` / `emitEvent`) is best-effort: failures
  are logged and swallowed so they never break the primary operation.
- **AI generation seams**: `lib/ai/generate-brief.ts` and
  `lib/ai/generate-website.ts` are the *only* places a model lives. Both return
  deterministic, dependency-free outputs so the full flow works with no API key.
  To go live, swap each function body for a `claude-opus-4-8` call returning the
  same shape — every caller is unchanged.
  - Brief flow: wizard input (`BusinessBrief`) persists on `projects.brief`;
    each brief generation is a `project_versions` row (`GenerationVersion`).
  - Website flow (Sprint 3): `generate-website.ts` composes strategy → sitemap →
    page architecture → copy into a `GeneratedWebsite` (`types/website.ts`),
    persisted on `projects.website`. The page editor saves edits back there and
    every generate/save/restore snapshots into `website_versions` (the revision
    engine). The preview (`components/website/*`) renders sections as
    self-contained light "website" templates — do not use app dark-theme tokens
    inside the canvas.
- **Validation**: zod schemas in `lib/validations/*` are the single source for
  input shapes; Server Actions parse `FormData` through them and return
  `fieldErrors` to the client forms.

## Conventions

- **Tailwind CSS v4 is configured in CSS, not JS** — there is no
  `tailwind.config.*`. Design tokens live in `app/globals.css` under `:root` +
  `@theme inline`, exposed as shadcn-compatible semantic names (`bg-card`,
  `text-muted-foreground`, `border-border`, `bg-primary`, …). The app is
  dark-only. Use these tokens, not raw hex.
- **shadcn/ui** primitives are in `components/ui` (config in `components.json`,
  "new-york" style). Add new ones with the shadcn CLI or by matching the
  existing hand-written pattern (`cva` + `cn`).
- **Path alias**: `@/*` → repo root (`tsconfig.json`).
- Toasts use **sonner** (`components/ui/sonner.tsx`), mounted once in the root
  layout. Import `toast` from there.
- After changing the DB schema, update `supabase/migrations/` **and** regenerate
  `types/database.ts` (`supabase gen types typescript --linked`). The two must
  stay in sync — the typed clients depend on it.
