"use client";

import { useTransition } from "react";
import { History, RotateCcw } from "lucide-react";

import { restoreWebsiteVersionAction } from "@/app/(dashboard)/projects/website-actions";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/sonner";
import type { WebsiteVersion } from "@/lib/services/website";

interface RevisionsPanelProps {
  projectId: string;
  versions: WebsiteVersion[];
  onRestored?: () => void;
}

export function RevisionsPanel({
  projectId,
  versions,
  onRestored,
}: RevisionsPanelProps) {
  const [isPending, startTransition] = useTransition();

  if (versions.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No revisions yet"
        description="Each generation and save creates a restorable revision."
      />
    );
  }

  const restore = (versionId: string) => {
    startTransition(async () => {
      const result = await restoreWebsiteVersionAction(projectId, versionId);
      if (!result.ok) {
        toast.error(result.error ?? "Could not restore.");
        return;
      }
      toast.success("Revision restored");
      onRestored?.();
    });
  };

  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {versions.map((version, index) => (
          <div
            key={version.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  v{version.version}
                </span>
                {version.label ? (
                  <Badge variant="secondary">{version.label}</Badge>
                ) : null}
                {index === 0 ? <Badge variant="success">Current</Badge> : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(version.created_at)} ·{" "}
                {formatRelativeTime(version.created_at)} ·{" "}
                {version.content.pages.length} pages
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => restore(version.id)}
              disabled={isPending || index === 0}
            >
              <RotateCcw />
              Restore
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
