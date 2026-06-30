import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/constants";

const VARIANT: Record<
  ProjectStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  draft: "secondary",
  active: "success",
  archived: "outline",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={VARIANT[status]}>{PROJECT_STATUS_LABELS[status]}</Badge>
  );
}
