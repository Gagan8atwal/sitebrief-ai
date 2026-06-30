import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { getProject } from "@/lib/services/projects";
import { isBriefComplete, normalizeBrief } from "@/lib/services/brief";
import { listGenerations } from "@/lib/services/generation";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/projects/status-badge";
import { ProjectWorkspace } from "@/components/projects/project-workspace";

export const metadata: Metadata = {
  title: "Project",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const result = await getProject(user.id, id);

  if (!result.ok) {
    if (result.error.code === "not_found") notFound();
    throw new Error(result.error.message);
  }

  const project = result.data;
  const brief = normalizeBrief(project.brief);
  const generationsResult = await listGenerations(project.id);
  const versions = generationsResult.ok ? generationsResult.data : [];

  return (
    <div className="space-y-8">
      <Link
        href={ROUTES.projects}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <PageHeader
        title={project.name}
        description={`Created ${formatDate(project.created_at)} · /${project.slug}`}
        action={<StatusBadge status={project.status} />}
      />

      <ProjectWorkspace
        project={project}
        initialBrief={brief}
        briefComplete={isBriefComplete(brief)}
        versions={versions}
      />
    </div>
  );
}
