import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard } from "lucide-react";

export const metadata: Metadata = { title: "Billing" };

export default async function AdminBillingPage() {
  // Owner-only — financial configuration.
  await requireRole(["owner"]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Plans, invoices, and revenue."
      />
      <Alert variant="info">
        <CreditCard />
        <AlertTitle>Payments not connected</AlertTitle>
        <AlertDescription>
          Billing is a Stripe integration that requires API keys and a webhook
          endpoint. This view is scaffolded and ready to wire up — connect a
          Stripe account to enable plans, invoices, and revenue reporting.
        </AlertDescription>
      </Alert>
    </div>
  );
}
