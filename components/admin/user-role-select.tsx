"use client";

import { useTransition } from "react";

import { updateUserRoleAction } from "@/app/(dashboard)/admin/actions";
import { ROLE_LABELS, USER_ROLES, type Role } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleBadge } from "@/components/admin/role-badge";
import { toast } from "@/components/ui/sonner";

interface UserRoleSelectProps {
  userId: string;
  role: Role;
  /** Roles this viewer is allowed to assign (owner excluded for admins). */
  assignable: Role[];
  /** When false, the role is shown read-only (e.g. the owner row, or self). */
  editable: boolean;
}

export function UserRoleSelect({
  userId,
  role,
  assignable,
  editable,
}: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition();

  if (!editable) return <RoleBadge role={role} />;

  const onChange = (next: string) => {
    startTransition(async () => {
      const res = await updateUserRoleAction(userId, next as Role);
      if (!res.ok) {
        toast.error(res.error ?? "Could not update role.");
        return;
      }
      toast.success("Role updated");
    });
  };

  return (
    <Select value={role} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger className="h-8 w-32" aria-label="Change role">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {USER_ROLES.filter((r) => assignable.includes(r)).map((r) => (
          <SelectItem key={r} value={r}>
            {ROLE_LABELS[r]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
