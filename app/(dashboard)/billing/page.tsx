import type { Metadata } from "next";
import { CreditCard, FileText } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Billing"
        description="Your plan and invoices."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-primary" />
            Current plan
          </CardTitle>
          <CardDescription>
            You’re on the free foundation plan. Paid plans arrive with the
            billing integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <span className="inline-flex items-center rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
            Free
          </span>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Invoices</h2>
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Invoices will appear here once paid plans are enabled."
        />
      </section>
    </div>
  );
}
