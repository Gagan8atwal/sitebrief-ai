import Link from "next/link";

import { APP_NAME, ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { UserNav } from "@/components/dashboard/user-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-border bg-card/40 px-4 py-5 lg:flex">
        <Link
          href={ROUTES.dashboard}
          className="px-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {APP_NAME}
        </Link>
        <SidebarNav />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link
              href={ROUTES.dashboard}
              className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground lg:hidden"
            >
              {APP_NAME}
            </Link>
          </div>
          <UserNav email={user.email ?? "account"} />
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
