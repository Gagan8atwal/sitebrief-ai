import type { Metadata } from "next";

import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectForm } from "@/components/projects/project-form";

export const metadata: Metadata = {
  title: "New project",
};

export default async function NewProjectPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="New project"
        description="Create a project to organize a site brief."
      />
      <ProjectForm />
    </div>
  );
}
