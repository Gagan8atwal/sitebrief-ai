import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { listAllProjects } from "@/lib/services/admin";
import { formatRelativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban } from "lucide-react";
import { StatusBadge } from "@/components/projects/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "All projects" };

export default async function AdminProjectsPage() {
  await requireRole(["owner", "admin"]);
  const projects = await listAllProjects();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Every project across all customers."
      />
      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Project</TableHead>
                <TableHead className="hidden md:table-cell">Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-foreground">
                    {p.name}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {p.owner_email ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {formatRelativeTime(p.updated_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
