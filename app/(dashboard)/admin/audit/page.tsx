import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { listAudit } from "@/lib/services/admin";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Audit trail" };

export default async function AuditPage() {
  await requireRole(["owner", "admin"]);
  const entries = await listAudit(100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail"
        description="A record of privileged and data-changing actions."
      />
      {entries.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No audit entries yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <Badge variant="secondary">{e.action}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.entity_type}
                    {e.entity_id ? (
                      <span className="ml-1 font-mono text-xs">
                        {e.entity_id.slice(0, 8)}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell
                    className="text-right text-xs text-muted-foreground"
                    title={formatDate(e.created_at)}
                  >
                    {formatRelativeTime(e.created_at)}
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
