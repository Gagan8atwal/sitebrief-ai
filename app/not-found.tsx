import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="mt-3 text-2xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>
      <Button asChild className="mt-6">
        <Link href={ROUTES.home}>Back to home</Link>
      </Button>
    </main>
  );
}
