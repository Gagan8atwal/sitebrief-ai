"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  Eye,
  FileWarning,
  Loader2,
  Map as MapIcon,
  PencilRuler,
  Sparkles,
  History,
} from "lucide-react";

import { generateWebsiteAction } from "@/app/(dashboard)/projects/website-actions";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/sonner";
import { StrategyPanel } from "@/components/website/strategy-panel";
import { SitemapPanel } from "@/components/website/sitemap-panel";
import { PageEditor } from "@/components/website/page-editor";
import { WebsitePreview } from "@/components/website/website-preview";
import { RevisionsPanel } from "@/components/website/revisions-panel";
import type { GeneratedWebsite } from "@/types/website";
import type { WebsiteVersion } from "@/lib/services/website";

interface WebsiteStudioProps {
  projectId: string;
  briefComplete: boolean;
  website: GeneratedWebsite | null;
  versions: WebsiteVersion[];
  onEditBrief?: () => void;
}

export function WebsiteStudio({
  projectId,
  briefComplete,
  website,
  versions,
  onEditBrief,
}: WebsiteStudioProps) {
  const router = useRouter();
  const [isGenerating, startGenerate] = useTransition();

  const generate = () => {
    startGenerate(async () => {
      const result = await generateWebsiteAction(projectId);
      if (!result.ok) {
        toast.error(result.error ?? "Generation failed.");
        return;
      }
      toast.success("Website generated");
      router.refresh();
    });
  };

  if (!briefComplete) {
    return (
      <Alert variant="warning">
        <FileWarning />
        <AlertTitle>Complete the brief first</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          <span>
            The website engine builds from your business brief. Finish the brief
            to generate a full multi-page website.
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

  if (!website) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Generate your website"
        description="Turn your brief into a complete website: strategy, sitemap, multi-page architecture, and copy."
        action={
          <Button onClick={generate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles />
                Generate website
              </>
            )}
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {website.pages.length} pages · regenerate to rebuild from the brief
          (saved as a new revision).
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={generate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles />
              Regenerate
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="strategy" className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="strategy">
            <Compass />
            Strategy
          </TabsTrigger>
          <TabsTrigger value="sitemap">
            <MapIcon />
            Sitemap
          </TabsTrigger>
          <TabsTrigger value="pages">
            <PencilRuler />
            Editor
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye />
            Preview
          </TabsTrigger>
          <TabsTrigger value="revisions">
            <History />
            Revisions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategy">
          <StrategyPanel strategy={website.strategy} />
        </TabsContent>
        <TabsContent value="sitemap">
          <SitemapPanel website={website} />
        </TabsContent>
        <TabsContent value="pages">
          <PageEditor
            projectId={projectId}
            website={website}
            onSaved={() => router.refresh()}
          />
        </TabsContent>
        <TabsContent value="preview">
          <WebsitePreview website={website} />
        </TabsContent>
        <TabsContent value="revisions">
          <RevisionsPanel
            projectId={projectId}
            versions={versions}
            onRestored={() => router.refresh()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
