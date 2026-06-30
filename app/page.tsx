import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { APP_NAME, ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";

const stack = [
  { label: "framework", value: "Next.js 15 · App Router" },
  { label: "language", value: "TypeScript (strict)" },
  { label: "styling", value: "Tailwind CSS v4 · shadcn/ui" },
  { label: "backend", value: "Supabase (Auth · Postgres · RLS)" },
];

export default async function Home() {
  const user = await getUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {APP_NAME}
      </p>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
        Foundation ready.
      </h1>

      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Sprint 1 foundation — auth, dashboard shell, project CRUD, and a typed
        Supabase data layer with row-level security.
      </p>

      <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          system / stack
        </div>
        <ul className="divide-y divide-border">
          {stack.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between px-5 py-3 font-mono text-sm"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="flex items-center gap-2 text-foreground">
                {row.value}
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex items-center gap-3">
        {user ? (
          <Button asChild>
            <Link href={ROUTES.dashboard}>
              Go to dashboard
              <ArrowRight />
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild>
              <Link href={ROUTES.signup}>
                Get started
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href={ROUTES.login}>Sign in</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
