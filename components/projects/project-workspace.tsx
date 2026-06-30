"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  LayoutGrid,
  Settings2,
  Sparkles,
  History,
} from "lucide-react";

import { formatRelativeTime } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BriefWizard } from "@/components/brief/brief-wizard";
import { GenerationPanel } from "@/components/generation/generation-panel";
import { VersionsList } from "@/components/generation/versions-list";
import { ProjectSettings } from "@/components/projects/project-settings";
import type { Project } from "@/types/database";
import type { BusinessBrief } from "@/types/domain";
import type { GenerationVersion } from "@/lib/services/generation";

interface ProjectWorkspaceProps {
  project: Project;
  initialBrief: BusinessBrief;
  briefComplete: boolean;
  versions: GenerationVersion[];
}

export function ProjectWorkspace({
  project,
  initialBrief,
  briefComplete,
  versions,
}: ProjectWorkspaceProps) {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const latest = versions[0] ?? null;

  const refresh = () => router.refresh();

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="flex w-full flex-wrap justify-start sm:w-auto">
        <TabsTrigger value="overview">
          <LayoutGrid />
          Overview
        </TabsTrigger>
        <TabsTrigger value="brief">
          <FileText />
          Brief
        </TabsTrigger>
        <TabsTrigger value="generate">
          <Sparkles />
          Generate
        </TabsTrigger>
        <TabsTrigger value="versions">
          <History />
          Versions
          {versions.length > 0 ? (
            <Badge variant="secondary" className="ml-1">
              {versions.length}
            </Badge>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="settings">
          <Settings2 />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Business brief
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant={briefComplete ? "success" : "warning"}>
                {briefComplete ? "Complete" : "Incomplete"}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {briefComplete
                  ? "Your brief is ready to generate from."
                  : "Add a few more details to unlock generation."}
              </p>
              <Button size="sm" variant="outline" onClick={() => setTab("brief")}>
                {briefComplete ? "Edit brief" : "Complete brief"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Latest generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {latest ? (
                <>
                  <p className="text-sm text-foreground">
                    v{latest.version} ·{" "}
                    <span className="text-muted-foreground">
                      {formatRelativeTime(latest.created_at)}
                    </span>
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTab("versions")}
                  >
                    View versions
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Nothing generated yet.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setTab("generate")}
                    disabled={!briefComplete}
                  >
                    <Sparkles />
                    Generate
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="brief">
        <BriefWizard
          projectId={project.id}
          initialBrief={initialBrief}
          onSaved={refresh}
          onGenerated={() => {
            refresh();
            setTab("versions");
          }}
        />
      </TabsContent>

      <TabsContent value="generate">
        <GenerationPanel
          projectId={project.id}
          briefComplete={briefComplete}
          latest={latest}
          onGenerated={refresh}
          onEditBrief={() => setTab("brief")}
        />
      </TabsContent>

      <TabsContent value="versions">
        <VersionsList versions={versions} />
      </TabsContent>

      <TabsContent value="settings">
        <ProjectSettings project={project} />
      </TabsContent>
    </Tabs>
  );
}
