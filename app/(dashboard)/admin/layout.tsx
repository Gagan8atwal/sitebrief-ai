import { ShieldCheck } from "lucide-react";

import { STAFF_ROLES } from "@/lib/constants";
import { requireRole } from "@/lib/auth";
import { RoleBadge } from "@/components/admin/role-badge";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authorization. Customers are redirected to their own home.
  const { profile } = await requireRole(STAFF_ROLES);
  const isOwner = profile.role === "owner";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-foreground">Console</h1>
        </div>
        <RoleBadge role={profile.role} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <AdminNav isOwner={isOwner} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
