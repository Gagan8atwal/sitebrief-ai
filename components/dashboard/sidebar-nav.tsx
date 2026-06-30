"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ADMIN_NAV_ITEM,
  NAV_ITEMS,
  isNavItemActive,
} from "@/components/dashboard/nav-config";

interface SidebarNavProps {
  isStaff?: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ isStaff = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const items = isStaff ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <nav className="flex flex-col gap-1" aria-label="Primary">
      {items.map((item) => {
        // The Console root must not stay highlighted while on a customer route.
        const active =
          item.href === ROUTES.admin
            ? pathname === ROUTES.admin || pathname.startsWith(`${ROUTES.admin}/`)
            : isNavItemActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
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
