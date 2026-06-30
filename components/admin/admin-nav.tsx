"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  CreditCard,
  FolderKanban,
  Globe,
  LayoutDashboard,
  ScrollText,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: LucideIcon; ownerOnly?: boolean };

const ITEMS: Item[] = [
  { href: ROUTES.admin, label: "Dashboard", icon: LayoutDashboard },
  { href: `${ROUTES.admin}/users`, label: "Users", icon: Users },
  { href: `${ROUTES.admin}/customers`, label: "Customers", icon: UserCircle },
  { href: `${ROUTES.admin}/projects`, label: "Projects", icon: FolderKanban },
  { href: `${ROUTES.admin}/jobs`, label: "Website Jobs", icon: Globe },
  { href: `${ROUTES.admin}/ai-usage`, label: "AI Usage", icon: Sparkles },
  { href: `${ROUTES.admin}/analytics`, label: "Analytics", icon: BarChart3 },
  { href: `${ROUTES.admin}/billing`, label: "Billing", icon: CreditCard, ownerOnly: true },
  { href: `${ROUTES.admin}/settings`, label: "Settings", icon: Settings2, ownerOnly: true },
  { href: `${ROUTES.admin}/health`, label: "System Health", icon: Activity, ownerOnly: true },
  { href: `${ROUTES.admin}/logs`, label: "Logs", icon: ScrollText },
  { href: `${ROUTES.admin}/audit`, label: "Audit Trail", icon: ShieldCheck },
];

export function AdminNav({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();
  const items = ITEMS.filter((i) => isOwner || !i.ownerOnly);

  return (
    <nav
      className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
      aria-label="Console"
    >
      {items.map((item) => {
        const active =
          item.href === ROUTES.admin
            ? pathname === ROUTES.admin
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
