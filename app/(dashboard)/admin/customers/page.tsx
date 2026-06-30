import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { listCustomers } from "@/lib/services/admin";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { UserCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage() {
  await requireRole(["owner", "admin"]);
  const customers = await listCustomers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="End users on customer plans."
      />
      {customers.length === 0 ? (
        <EmptyState icon={UserCircle} title="No customers yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-foreground">
                    {c.full_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.email}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {formatDate(c.created_at)}
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
