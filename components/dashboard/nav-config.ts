import {
  FolderKanban,
  LayoutDashboard,
  Settings2,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "@/lib/constants";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.projects, label: "Projects", icon: FolderKanban },
  { href: ROUTES.settings, label: "Settings", icon: Settings2 },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
