# Supabase

Schema and policies for SiteBrief AI live in `migrations/`.

## Apply the schema

**Option A — Supabase CLI (recommended):**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option B — SQL editor:**
Paste the contents of `migrations/0001_initial_schema.sql` into the Supabase
dashboard SQL editor and run it.

## Regenerate types after schema changes

```bash
supabase gen types typescript --linked > types/database.ts
```

## What the migration creates

| Object              | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `profiles`          | 1:1 with `auth.users`, auto-created on signup    |
| `projects`          | Core entity, owner-scoped, unique slug per owner |
| `project_versions`  | Versioning foundation                            |
| `events`            | Domain event stream                              |
| `audit_log`         | Mutation audit trail                             |

Row-level security is enabled on every table; all access is scoped to
`auth.uid()`. A `handle_new_user` trigger provisions a profile row on signup,
and `set_updated_at` keeps `updated_at` current on mutation.
