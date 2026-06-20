const stack = [
  { label: "framework", value: "Next.js 15 · App Router" },
  { label: "language", value: "TypeScript" },
  { label: "styling", value: "Tailwind CSS v4" },
  { label: "backend", value: "Supabase-ready" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
        SiteBrief AI
      </p>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
        Foundation ready.
      </h1>

      <p className="mt-3 text-base leading-relaxed text-muted">
        Sprint 1.1 — platform shell only. No auth, no AI, no billing.
      </p>

      <div className="mt-10 overflow-hidden rounded-xl border border-line bg-surface">
        <div className="border-b border-line px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted">
          system / stack
        </div>
        <ul className="divide-y divide-line">
          {stack.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between px-5 py-3 font-mono text-sm"
            >
              <span className="text-muted">{row.label}</span>
              <span className="flex items-center gap-2 text-foreground">
                {row.value}
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 font-mono text-xs text-muted">
        next →{" "}
        <span className="text-foreground">cp .env.example .env.local</span>
      </p>
    </main>
  );
}
