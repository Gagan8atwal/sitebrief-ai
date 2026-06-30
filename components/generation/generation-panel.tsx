"use client";

import { useTransition } from "react";
import { Loader2, Sparkles, FileWarning } from "lucide-react";

import { generateAction } from "@/app/(dashboard)/projects/brief-actions";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/sonner";
import { BriefOutput } from "@/components/generation/brief-output";
import type { GenerationVersion } from "@/lib/services/generation";

interface GenerationPanelProps {
  projectId: string;
  briefComplete: boolean;
  latest: GenerationVersion | null;
  onGenerated?: () => void;
  onEditBrief?: () => void;
}

export function GenerationPanel({
  projectId,
  briefComplete,
  latest,
  onGenerated,
  onEditBrief,
}: GenerationPanelProps) {
  const [isPending, startTransition] = useTransition();

  const run = () => {
    startTransition(async () => {
      const result = await generateAction(projectId);
      if (!result.ok) {
        toast.error(result.error ?? "Generation failed.");
        return;
      }
      toast.success("Website brief generated");
      onGenerated?.();
    });
  };

  if (!briefComplete) {
    return (
      <Alert variant="warning">
        <FileWarning />
        <AlertTitle>Complete the brief first</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          <span>
            The business brief needs a few more details before SiteBrief AI can
            generate a website brief.
          </span>
          {onEditBrief ? (
            <Button size="sm" variant="outline" onClick={onEditBrief}>
              Go to brief
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle>AI website brief</CardTitle>
            <p className="text-sm text-muted-foreground">
              {latest
                ? `Latest: v${latest.version} · ${formatRelativeTime(latest.created_at)}`
                : "No brief generated yet."}
            </p>
          </div>
          <Button onClick={run} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles />
                {latest ? "Regenerate" : "Generate"}
              </>
            )}
          </Button>
        </CardHeader>
        {isPending ? (
          <CardContent>
            <GeneratingSkeleton />
          </CardContent>
        ) : null}
      </Card>

      {latest ? (
        <Card>
          <CardContent className="pt-6">
            <BriefOutput brief={latest.content} />
          </CardContent>
        </Card>
      ) : (
        !isPending && (
          <EmptyState
            icon={Sparkles}
            title="Ready to generate"
            description="Run the generator to turn your business brief into a structured website brief."
          />
        )
      )}
    </div>
  );
}

function GeneratingSkeleton() {
  return (
    <div className="space-y-3" aria-live="polite" aria-busy="true">
      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="grid gap-3 pt-2 sm:grid-cols-2">
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
