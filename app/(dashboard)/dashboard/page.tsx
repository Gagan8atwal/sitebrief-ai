import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/lib/services/projects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectsTable } from "@/components/projects/projects-table";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const result = await listProjects(user.id);
  const projects = result.ok ? result.data : [];

  const total = projects.length;
  const active = projects.filter((p) => p.status === "active").length;
  const drafts = projects.filter((p) => p.status === "draft").length;
  const recent = projects.slice(0, 5);

  const stats = [
    { label: "Total projects", value: total },
    { label: "Active", value: active },
    { label: "Drafts", value: drafts },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="An overview of your SiteBrief AI workspace."
        action={
          <Button asChild>
            <Link href={ROUTES.newProject}>
              <Plus />
              New project
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Recent projects
          </h2>
          {total > 0 ? (
            <Link
              href={ROUTES.projects}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>

        {recent.length > 0 ? (
          <ProjectsTable projects={recent} />
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to get started."
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
      </section>
    </div>
  );
}
