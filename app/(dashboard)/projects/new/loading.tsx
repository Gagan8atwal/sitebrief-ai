import { Skeleton } from "@/components/ui/skeleton";

export default function NewProjectLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
