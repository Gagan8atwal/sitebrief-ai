# SiteBrief AI

AI Website Agency platform. This repository contains the **Sprint 1 foundation**:
authentication, a protected dashboard shell, project CRUD, and a typed Supabase
data layer secured with row-level security.

## Stack

- **Next.js 15** (App Router, React 19, Server Actions)
- **TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui** primitives (dark theme)
- **Supabase** — Auth, Postgres, Row-Level Security
- **Zod** for runtime validation, **sonner** for toasts

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in Supabase values
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable                        | Scope        | Notes                          |
| ------------------------------- | ------------ | ------------------------------ |
| `NEXT_PUBLIC_APP_URL`           | client       | Defaults to localhost          |
| `NEXT_PUBLIC_SUPABASE_URL`      | client       | Supabase project URL           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client       | Public anon key                |
| `SUPABASE_SERVICE_ROLE_KEY`     | server only  | Bypasses RLS — never expose it |

All variables are validated at startup in `lib/env.ts`.

### Database

Apply the schema in `supabase/migrations/0001_initial_schema.sql` — see
[`supabase/README.md`](supabase/README.md).

## Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run dev`        | Dev server (Turbopack)       |
| `npm run build`      | Production build             |
| `npm run start`      | Serve production build       |
| `npm run lint`       | ESLint (next/core-web-vitals)|
| `npm run type-check` | `tsc --noEmit`               |
| `npm run format`     | Prettier write               |

## Architecture

```
app/
  (auth)/            login, signup, auth server actions
  (dashboard)/       protected layout + dashboard, projects CRUD
  auth/callback/     OAuth / email confirmation handler
  error, not-found, loading, global-error
components/
  ui/                shadcn primitives (button, card, input, table, …)
  auth/ dashboard/ projects/   feature components
lib/
  supabase/          browser, server, and middleware clients
  services/          data access + domain logic (projects, audit, events)
  validations/       zod schemas
  env, errors, logger, constants, utils, auth
types/database.ts    typed schema (regenerate from Supabase)
supabase/migrations/ SQL schema + RLS
middleware.ts        session refresh + route protection
```

Auth state is refreshed in `middleware.ts` on every navigation; protected
routes redirect unauthenticated users to `/login`. The service layer returns a
`Result<T>` discriminated union instead of throwing, so callers handle failure
explicitly.
