import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type Role } from "@/lib/constants";

const VARIANT: Record<Role, React.ComponentProps<typeof Badge>["variant"]> = {
  owner: "default",
  admin: "success",
  team: "secondary",
  customer: "outline",
};

export function RoleBadge({ role }: { role: Role }) {
  return <Badge variant={VARIANT[role]}>{ROLE_LABELS[role]}</Badge>;
}
