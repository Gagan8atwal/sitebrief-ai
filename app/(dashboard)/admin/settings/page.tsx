import type { Metadata } from "next";

import { APP_NAME } from "@/lib/constants";
import { requireRole } from "@/lib/auth";
import { getOwnerEmail } from "@/lib/services/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OwnerEmailForm } from "@/components/admin/owner-email-form";

export const metadata: Metadata = { title: "System settings" };

export default async function AdminSettingsPage() {
  // Owner-only — system configuration.
  await requireRole(["owner"]);
  const ownerEmail = await getOwnerEmail();

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Platform configuration. Owner only."
      />
      <Card>
        <CardHeader>
          <CardTitle>Ownership</CardTitle>
          <CardDescription>
            Controls who holds the {APP_NAME} owner role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OwnerEmailForm initialEmail={ownerEmail ?? ""} />
        </CardContent>
      </Card>
    </div>
  );
}
