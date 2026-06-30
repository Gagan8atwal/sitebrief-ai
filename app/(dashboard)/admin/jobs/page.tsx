import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { listEvents } from "@/lib/services/admin";
import { formatRelativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Website jobs" };

export default async function WebsiteJobsPage() {
  await requireRole(["owner", "admin"]);
  const events = await listEvents(60);
  const jobs = events.filter(
    (e) => e.type === "version.created" || e.type === "project.updated",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Jobs"
        description="Brief and website generation runs across the platform."
      />
      {jobs.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No generation jobs yet"
          description="Jobs appear here as customers generate briefs and websites."
        />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {job.type === "version.created" ? "Generation" : "Update"}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {job.project_id?.slice(0, 8) ?? "—"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(job.created_at)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
