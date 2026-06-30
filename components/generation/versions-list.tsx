"use client";

import { useState } from "react";
import { History } from "lucide-react";

import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { BriefOutput } from "@/components/generation/brief-output";
import type { GenerationVersion } from "@/lib/services/generation";

export function VersionsList({ versions }: { versions: GenerationVersion[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    versions[0]?.id ?? null,
  );

  if (versions.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No versions yet"
        description="Generated website briefs will appear here, with full version history."
      />
    );
  }

  const selected =
    versions.find((v) => v.id === selectedId) ?? versions[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <ol className="space-y-2" aria-label="Version history">
        {versions.map((version, index) => {
          const active = version.id === selected.id;
          return (
            <li key={version.id}>
              <button
                type="button"
                onClick={() => setSelectedId(version.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-accent/50",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    v{version.version}
                  </span>
                  {index === 0 ? (
                    <Badge variant="success">Latest</Badge>
                  ) : null}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(version.created_at)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <Card>
        <CardContent className="pt-6">
          <BriefOutput brief={selected.content} />
        </CardContent>
      </Card>
    </div>
  );
}
