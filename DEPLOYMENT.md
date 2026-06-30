# Deployment Guide

SiteBrief AI is a Next.js 15 app backed by Supabase. It deploys cleanly to
Vercel. Everything runs locally against placeholder env values, but a live
deploy needs a real Supabase project.

## 1. Supabase

1. Create a project at https://supabase.com/dashboard.
2. **Settings → API**: copy the Project URL, the `anon` public key, and the
   `service_role` key.
3. Apply the schema (in order) with the CLI or the SQL editor:
   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/migrations/0002_business_brief.sql`
   - `supabase/migrations/0003_website_engine.sql`
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
4. **Auth → URL Configuration**: set Site URL to your production domain and add
   `https://<domain>/auth/callback` to the redirect allowlist.
5. (Optional) Disable email confirmation for instant sessions after signup.

## 2. Vercel

1. Import `Gagan8atwal/sitebrief-ai` — Next.js is auto-detected.
2. Set environment variables (Production **and** Preview):

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_APP_URL` | your production URL |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (server-only) |

3. Deploy.

## 3. Post-deploy smoke test

- [ ] Sign up → a `profiles` row is auto-created → land on the dashboard
- [ ] Forgot password → reset link → set new password
- [ ] Create a project → complete the brief wizard
- [ ] **Generate** → a brief version appears (Versions tab)
- [ ] **Website → Generate** → strategy, sitemap, editor, and preview populate
- [ ] Edit a section, **Rewrite** copy, **Save** → a revision is recorded
- [ ] Restore a prior revision
- [ ] Mobile nav + responsive preview (desktop/tablet/mobile)

## 4. Optional — go live with real AI

The generation engine is isolated behind two functions:
`lib/ai/generate-brief.ts` and `lib/ai/generate-website.ts`. Each returns a
typed shape and is the single place to call a model.

1. Add `ANTHROPIC_API_KEY` to the server env (and to `lib/env.ts`'s server
   schema).
2. Replace each function body with an Anthropic call using `claude-opus-4-8`
   that returns the same shape. No caller changes are required.

## Build notes

- `npm run type-check` and `npm run lint` are the enforced quality gates and run
  independently of the build. `next.config.mjs` skips the redundant in-build
  passes to save memory.
- On machines with < 4 GB RAM, set `LOW_MEM_BUILD=1` to disable minification and
  source maps for a local build. Vercel and CI build with full optimization by
  default — do **not** set this in production.
