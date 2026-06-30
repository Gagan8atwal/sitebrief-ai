import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/projects/status-badge";
import type { Project } from "@/types/database";

export function ProjectsTable({ projects }: { projects: Project[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                <Link
                  href={`${ROUTES.projects}/${project.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {project.name}
                </Link>
                {project.description ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {project.description}
                  </p>
                ) : null}
              </TableCell>
              <TableCell>
                <StatusBadge status={project.status} />
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {formatRelativeTime(project.updated_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
