import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { getAiUsageSummary, listRecentAiUsage } from "@/lib/services/ai-usage";
import { isAnthropicConfigured } from "@/lib/ai/anthropic";
import { formatRelativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Sparkles } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "AI usage" };

export default async function AiUsagePage() {
  await requireRole(["owner", "admin"]);
  const [summary, recent] = await Promise.all([
    getAiUsageSummary(),
    listRecentAiUsage(50),
  ]);

  const cards = [
    { label: "Total runs", value: summary.totalRuns },
    { label: "Anthropic", value: summary.anthropicRuns },
    { label: "Fallback", value: summary.fallbackRuns },
    {
      label: "Tokens (in / out)",
      value: `${summary.inputTokens.toLocaleString()} / ${summary.outputTokens.toLocaleString()}`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Usage"
        description="Generation volume and token spend."
        action={
          <Badge variant={isAnthropicConfigured() ? "success" : "warning"}>
            {isAnthropicConfigured() ? "claude-opus-4-8" : "Deterministic"}
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader>
              <CardDescription>{c.label}</CardDescription>
              <CardTitle className="text-2xl">{c.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {recent.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No AI runs yet"
          description="Each brief or website generation is recorded here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Operation</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="hidden sm:table-cell">Tokens</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium capitalize text-foreground">
                    {r.operation}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={r.provider === "anthropic" ? "success" : "secondary"}
                    >
                      {r.provider}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {r.input_tokens} / {r.output_tokens}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatRelativeTime(r.created_at)}
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
