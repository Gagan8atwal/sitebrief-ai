import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { listEvents } from "@/lib/services/admin";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Logs" };

export default async function LogsPage() {
  await requireRole(["owner", "admin"]);
  const events = await listEvents(100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logs"
        description="The platform event stream."
      />
      {events.length === 0 ? (
        <EmptyState icon={ScrollText} title="No events yet" />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {events.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-4 px-4 py-2.5"
              >
                <span className="font-mono text-xs text-foreground">
                  {e.type}
                </span>
                <span
                  className="text-xs text-muted-foreground"
                  title={formatDate(e.created_at)}
                >
                  {formatRelativeTime(e.created_at)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
