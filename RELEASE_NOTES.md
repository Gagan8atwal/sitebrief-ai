# SiteBrief AI — Release Notes

**Branch:** `sprint-1-2-foundation-website-flow`
**Latest commit:** `d3cc099`
**Status:** Sprint 1 + Sprint 2 + Sprint 3 complete. Builds green. Awaiting live
Supabase credentials to deploy.

SiteBrief AI is an **AI website builder**: a user fills out a business brief and
the app generates a complete, editable, multi-page website plan — strategy,
sitemap, page architecture, and copy — with a live responsive preview and full
revision history.

---

## Sprint 1 — Foundation

- Next.js 15 (App Router, React 19) + TypeScript (strict) project, with the
  original mis-named config files corrected to canonical names.
- Tailwind CSS v4 design system (CSS-based, dark theme, shadcn-compatible
  semantic tokens) and shadcn/ui setup.
- Supabase integration: typed browser, server, admin, and middleware clients.
- Authentication foundation: email/password sign-up, sign-in, sign-out, OAuth/
  email callback handler.
- Route protection via middleware (session refresh + redirects) and
  `requireUser()` server guard.
- Service layer returning a `Result<T>` discriminated union; structured logger;
  centralized env validation (zod); error taxonomy.
- Database schema (migrations) with **row-level security on every table**:
  `profiles`, `projects`, `project_versions`, `events`, `audit_log`; auto
  profile provisioning + `updated_at` triggers.
- Project CRUD, audit and event foundations.
- App shell: dashboard layout, error/not-found/loading/global-error pages,
  reusable UI primitives, toast system.

## Sprint 2 — Business Brief & Brief Generation

- Complete auth flow: forgot-password + reset-password (email link → callback →
  update), no email-enumeration leak.
- **Business brief wizard**: 4-step flow (basics → audience → design → review)
  with per-step zod validation and progress.
- Brief generation: validates the brief, synthesizes a structured
  `GeneratedBrief`, stores each run as a `project_versions` row; version history
  viewer.
- Dashboard with stats and recent projects; project listing with search +
  status filter; settings page (profile + session).
- UI library expansion: tabs, dialog, alert-dialog, select, dropdown-menu,
  avatar, progress, switch, alert, toggle-chip.
- Responsive design: mobile drawer nav, adaptive layouts; loading/empty/error
  states throughout; `AlertDialog` confirmations.

## Sprint 3 — AI Website Engine

- **AI Website Strategy Engine** — positioning, audience insights, content and
  conversion strategy, key messages.
- **Sitemap Generator** — Home-first navigation derived from the brief's pages.
- **Multi-page architecture generator** — per-page section architecture by page
  type, producing typed `WebsitePage[]`.
- **AI Copywriter** — fills every section's copy; per-section one-click
  **Rewrite** with variations.
- **Page editor** — edit, add, remove, and reorder sections and their items;
  multi-page switcher; dirty-tracking with save.
- **Website preview** — full-page render (nav + sections + footer) with
  desktop/tablet/mobile device toggle and page selector.
- **Revision engine** — `website_versions` snapshots on every generate/save/
  restore; one-click restore of any revision.
- **Modern responsive templates** — 11 self-contained, brand-colored section
  templates (hero, value props, features, about, stats, testimonials, pricing,
  faq, cta, contact, footer).
- **Component library expansion** — tooltip + the website template renderer
  (22 UI primitives total).
- **Production polish** — `robots.txt`, `sitemap.xml`, OpenGraph/Twitter
  metadata, `metadataBase`, deployment guide.

> AI generation is deterministic and dependency-free today, isolated behind two
> seams (`lib/ai/generate-brief.ts`, `lib/ai/generate-website.ts`). Swap each
> body for a `claude-opus-4-8` call returning the same shape to go live — no
> caller changes.

---

## Architecture summary

- **Framework:** Next.js 15 App Router, React 19 Server Components + Server
  Actions, TypeScript strict.
- **Styling:** Tailwind CSS v4 (CSS-configured, dark-only app theme) + shadcn/ui
  primitives. The website preview renders on its own light "website" canvas.
- **Auth & access:** Supabase Auth; `middleware.ts` refreshes the session on
  every navigation and enforces protected/auth routes; RLS scopes all data to
  `auth.uid()`.
- **Data flow:** Server Components read through the service layer
  (`lib/services/*`), which returns `Result<T>`; Server Actions validate input
  with zod (`lib/validations/*`) and mutate. Audit/event writes are best-effort.
- **AI seams:** `lib/ai/*` are the only places a model lives; outputs are typed
  (`types/domain.ts`, `types/website.ts`) and persisted on `projects.brief` /
  `projects.website`, with history in `project_versions` / `website_versions`.
- **Quality gates:** `npm run type-check` and `npm run lint` run independently;
  `next build` skips its redundant in-build copies to save memory.

## Folder structure

```
app/
  (auth)/            login, signup, forgot/reset password, auth actions
  (dashboard)/       protected layout; dashboard, projects, settings
    projects/[id]/   project workspace (brief, generate, website, versions)
  auth/callback/     OAuth / email-confirmation handler
  robots.ts sitemap.ts error/global-error/not-found/loading
components/
  ui/                22 shadcn-style primitives
  auth/ dashboard/ projects/ settings/   feature components
  brief/             business brief wizard
  generation/        brief generation panel, output, versions
  website/           strategy, sitemap, page editor, preview, canvas,
                     section templates, revisions, studio
lib/
  ai/                generate-brief, generate-website (model seams)
  services/          projects, brief, generation, website, profile, audit
  supabase/          browser, server (+admin), middleware clients
  validations/       zod schemas
  auth, constants, env, errors, logger, utils
types/               database, domain, website
supabase/migrations/ 0001 schema · 0002 brief · 0003 website engine (+ RLS)
middleware.ts        session refresh + route protection
```

## Remaining blockers (all external)

1. **Supabase project** — set real `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (local uses
   gitignored placeholders); apply migrations `0001`→`0003`.
2. **Anthropic API key** — to replace the deterministic generators with live
   `claude-opus-4-8` calls (app is fully functional without it).
3. **Vercel** — project + environment variables for deployment.
4. **Build RAM (local only)** — this dev machine has too little free RAM for a
   full `next build`; use `LOW_MEM_BUILD=1` locally, or build on Vercel. Not a
   code defect (type-check, lint, and webpack compilation all pass).

## Deployment checklist

- [ ] Create Supabase project; copy URL + anon + service_role keys
- [ ] Apply `supabase/migrations/0001`, `0002`, `0003`
- [ ] Auth → URL config: Site URL + `https://<domain>/auth/callback`
- [ ] Import repo to Vercel (Next.js auto-detected)
- [ ] Set env vars (Production + Preview): `NEXT_PUBLIC_APP_URL`,
      `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
      `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Deploy; smoke-test signup → brief → generate → website → edit → revision
- [ ] (Optional) add `ANTHROPIC_API_KEY` and wire the real model in `lib/ai/*`

See `DEPLOYMENT.md` for the full step-by-step.

## Roadmap to v1.0

1. **Live AI** — wire `claude-opus-4-8` into both generation seams; add streaming
   generation with progress.
2. **Publish & export** — export the generated website as static HTML/Next.js,
   or one-click publish to a hosted subdomain.
3. **Richer editor** — drag-and-drop section reordering, image fields/uploads
   (Supabase Storage), inline theme editing, undo/redo.
4. **Templates & themes** — multiple starting templates and switchable visual
   themes beyond the brand color.
5. **Collaboration** — sharing, roles, comments per project.
6. **Billing** — Stripe plans and usage limits.
7. **Quality** — automated tests (unit + e2e), CI pipeline running type-check /
   lint / build, error monitoring.
8. **Polish** — onboarding, empty-state guidance, accessibility audit, SEO of
   generated pages.

_No telephony, SMS, receptionist, or appointment features — SiteBrief AI is
strictly an AI website builder._
