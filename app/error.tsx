"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

/**
 * Detects errors caused by a stale client bundle / deployment skew — when the
 * browser is holding JS chunks from an older deploy and a newly-mounted chunk
 * (e.g. the website studio) no longer matches. These surface as chunk-load or
 * dynamic-import failures and are fixed by reloading the fresh bundle.
 */
function isStaleBundleError(error: Error & { digest?: string }): boolean {
  const text = `${error?.name ?? ""} ${error?.message ?? ""}`.toLowerCase();
  return (
    text.includes("chunkloaderror") ||
    text.includes("loading chunk") ||
    text.includes("loading css chunk") ||
    text.includes("failed to fetch dynamically imported module") ||
    text.includes("error loading dynamically imported module") ||
    text.includes("importing a module script failed") ||
    text.includes("'text/html' is not a valid javascript mime type")
  );
}

const RECOVER_KEY = "sb-stale-bundle-reloaded";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    logger.error("Route segment error", {
      message: error.message,
      digest: error.digest,
    });

    // Self-heal stale-bundle errors: hard-reload once to pull the new deploy.
    if (isStaleBundleError(error) && typeof window !== "undefined") {
      try {
        if (!sessionStorage.getItem(RECOVER_KEY)) {
          sessionStorage.setItem(RECOVER_KEY, "1");
          setRecovering(true);
          window.location.reload();
          return;
        }
      } catch {
        /* sessionStorage unavailable — fall through to manual UI */
      }
    } else if (typeof window !== "undefined") {
      // Healthy render: clear the guard so a future stale error can recover.
      try {
        sessionStorage.removeItem(RECOVER_KEY);
      } catch {
        /* ignore */
      }
    }
  }, [error]);

  if (recovering) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">Loading the latest version…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred. You can try again — if it persists, please
        contact support.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
