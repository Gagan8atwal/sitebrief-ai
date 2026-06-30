import type { Metadata } from "next";

import { USER_ROLES, type Role } from "@/lib/constants";
import { requireRole } from "@/lib/auth";
import { listProfiles } from "@/lib/services/admin";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRoleSelect } from "@/components/admin/user-role-select";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const { user, profile } = await requireRole(["owner", "admin"]);
  const profiles = await listProfiles();
  const isOwner = profile.role === "owner";

  // Admins may assign any role except owner; owners may assign all.
  const assignable: Role[] = isOwner
    ? [...USER_ROLES]
    : USER_ROLES.filter((r) => r !== "owner");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Everyone with an account. Owners manage all roles; admins manage non-owner roles."
      />

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>User</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => {
              const isSelf = p.id === user.id;
              const isOwnerRow = p.role === "owner";
              // Editable unless it's yourself, or it's an owner row and you're
              // not the owner. (RLS enforces the same rules server-side.)
              const editable = !isSelf && (isOwner || !isOwnerRow);
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {p.full_name ?? "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(p.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <UserRoleSelect
                        userId={p.id}
                        role={p.role}
                        assignable={assignable}
                        editable={editable}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
