import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/lib/services/projects";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormError } from "@/components/auth/form-feedback";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectsExplorer } from "@/components/projects/projects-explorer";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const user = await requireUser();
  const result = await listProjects(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projects"
        description="Manage every site brief in your workspace."
        action={
          <Button asChild>
            <Link href={ROUTES.newProject}>
              <Plus />
              New project
            </Link>
          </Button>
        }
      />

      {!result.ok ? (
        <FormError message={result.error.message} />
      ) : result.data.length > 0 ? (
        <ProjectsExplorer projects={result.data} />
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start briefing sites."
          action={
            <Button asChild>
              <Link href={ROUTES.newProject}>
                <Plus />
                New project
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
