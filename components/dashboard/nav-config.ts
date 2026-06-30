import {
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "@/lib/constants";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Navigation available to every authenticated user (the customer portal). */
export const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.projects, label: "Projects", icon: FolderKanban },
  { href: ROUTES.billing, label: "Billing", icon: CreditCard },
  { href: ROUTES.settings, label: "Settings", icon: Settings2 },
];

/** Staff-only entry into the internal console. */
export const ADMIN_NAV_ITEM: NavItem = {
  href: ROUTES.admin,
  label: "Console",
  icon: ShieldCheck,
};

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
