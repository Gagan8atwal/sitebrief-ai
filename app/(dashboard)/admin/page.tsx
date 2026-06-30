import type { Metadata } from "next";

import { STAFF_ROLES } from "@/lib/constants";
import { requireRole } from "@/lib/auth";
import { getAdminOverview, listEvents } from "@/lib/services/admin";
import { getAiUsageSummary } from "@/lib/services/ai-usage";
import { isAnthropicConfigured } from "@/lib/ai/anthropic";
import { formatRelativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Console" };

export default async function AdminOverviewPage() {
  await requireRole(STAFF_ROLES);
  const [overview, ai, events] = await Promise.all([
    getAdminOverview(),
    getAiUsageSummary(),
    listEvents(8),
  ]);

  const stats = [
    { label: "Users", value: overview.users },
    { label: "Customers", value: overview.customers },
    { label: "Projects", value: overview.projects },
    { label: "Brief generations", value: overview.briefGenerations },
    { label: "Website generations", value: overview.websiteGenerations },
    { label: "AI runs", value: ai.totalRuns },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Operational overview of the SiteBrief AI platform."
        action={
          <Badge variant={isAnthropicConfigured() ? "success" : "warning"}>
            {isAnthropicConfigured() ? "Anthropic live" : "Fallback engine"}
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl">{s.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {events.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-4 py-2.5 text-sm"
                >
                  <span className="font-mono text-xs text-foreground">
                    {e.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(e.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
