"use client";

import { Component, type ReactNode } from "react";

import { ProjectWorkspace } from "@/components/projects/project-workspace";
import type { Project } from "@/types/database";
import type { BusinessBrief } from "@/types/domain";
import type { GeneratedWebsite } from "@/types/website";
import type { GenerationVersion } from "@/lib/services/generation";
import type { WebsiteVersion } from "@/lib/services/website";

class Boundary extends Component<{ children: ReactNode }, { msg: string | null }> {
  state = { msg: null as string | null };
  static getDerivedStateFromError(e: Error) {
    return { msg: `${e?.name}: ${e?.message}\n${(e?.stack ?? "").split("\n").slice(0, 8).join("\n")}` };
  }
  render() {
    if (this.state.msg) return <pre data-diag-error>{this.state.msg}</pre>;
    return this.props.children;
  }
}

export function DiagStudio(props: {
  project: Project;
  initialBrief: BusinessBrief;
  briefComplete: boolean;
  versions: GenerationVersion[];
  website: GeneratedWebsite | null;
  websiteVersions: WebsiteVersion[];
}) {
  return (
    <Boundary>
      <ProjectWorkspace {...props} />
    </Boundary>
  );
}
