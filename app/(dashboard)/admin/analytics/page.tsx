import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { getAdminOverview } from "@/lib/services/admin";
import { getAiUsageSummary } from "@/lib/services/ai-usage";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  await requireRole(["owner", "admin"]);
  const [overview, ai] = await Promise.all([
    getAdminOverview(),
    getAiUsageSummary(),
  ]);

  const conversion =
    overview.projects > 0
      ? Math.round((overview.websiteGenerations / overview.projects) * 100)
      : 0;
  const anthropicShare =
    ai.totalRuns > 0
      ? Math.round((ai.anthropicRuns / ai.totalRuns) * 100)
      : 0;

  const metrics = [
    { label: "Projects per user", value: ratio(overview.projects, overview.users) },
    {
      label: "Websites per project",
      value: ratio(overview.websiteGenerations, overview.projects),
    },
    { label: "Project → website rate", value: `${conversion}%` },
    { label: "Anthropic share of runs", value: `${anthropicShare}%` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Headline platform metrics derived from live data."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader>
              <CardDescription>{m.label}</CardDescription>
              <CardTitle className="text-3xl">{m.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Time-series charts and cohort analytics land in a future iteration.
          These figures are computed live from the database.
        </CardContent>
      </Card>
    </div>
  );
}

function ratio(a: number, b: number): string {
  if (b === 0) return "0";
  return (a / b).toFixed(1);
}
