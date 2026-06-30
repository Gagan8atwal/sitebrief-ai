import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
