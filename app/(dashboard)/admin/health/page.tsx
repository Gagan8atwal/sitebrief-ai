import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";

import { env } from "@/lib/env";
import { requireRole } from "@/lib/auth";
import { isAnthropicConfigured } from "@/lib/ai/anthropic";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "System health" };

async function dbReachable(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("app_settings")
      .select("id", { head: true, count: "exact" });
    return !error;
  } catch {
    return false;
  }
}

export default async function HealthPage() {
  await requireRole(["owner"]);
  const dbOk = await dbReachable();

  const checks: { label: string; ok: boolean; detail: string }[] = [
    { label: "Database", ok: dbOk, detail: dbOk ? "Connected" : "Unreachable" },
    {
      label: "Anthropic API",
      ok: isAnthropicConfigured(),
      detail: isAnthropicConfigured()
        ? "Configured (claude-opus-4-8)"
        : "Not set — using deterministic fallback",
    },
    {
      label: "Service role key",
      ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      detail: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Present" : "Not set",
    },
    { label: "App URL", ok: true, detail: env.NEXT_PUBLIC_APP_URL },
    { label: "Supabase URL", ok: true, detail: env.NEXT_PUBLIC_SUPABASE_URL },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health"
        description="Live status of platform dependencies."
      />
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {checks.map((c) => (
            <div
              key={c.label}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex items-center gap-2">
                {c.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-warning" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {c.label}
                </span>
              </div>
              <span className="truncate text-xs text-muted-foreground">
                {c.detail}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
