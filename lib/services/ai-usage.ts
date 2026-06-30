import "server-only";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { toError } from "@/lib/utils";
import type { GenMeta } from "@/lib/ai/types";
import type { AiUsageRow } from "@/types/database";

/** Append an AI-usage record. Best-effort — never breaks the generation flow. */
export async function recordAiUsage(params: {
  userId: string;
  projectId: string | null;
  operation: string;
  meta: GenMeta;
}): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("ai_usage").insert({
      user_id: params.userId,
      project_id: params.projectId,
      operation: params.operation,
      provider: params.meta.provider,
      model: params.meta.model,
      input_tokens: params.meta.inputTokens,
      output_tokens: params.meta.outputTokens,
      status: params.meta.status,
    });
    if (error) throw error;
  } catch (error) {
    logger.warn("recordAiUsage failed", { error: toError(error).message });
  }
}

export type AiUsageSummary = {
  totalRuns: number;
  anthropicRuns: number;
  fallbackRuns: number;
  inputTokens: number;
  outputTokens: number;
};

/** Aggregate AI usage visible to the caller (admins/owners see everything). */
export async function getAiUsageSummary(): Promise<AiUsageSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_usage")
    .select("provider, input_tokens, output_tokens");

  if (error || !data) {
    return {
      totalRuns: 0,
      anthropicRuns: 0,
      fallbackRuns: 0,
      inputTokens: 0,
      outputTokens: 0,
    };
  }

  return data.reduce<AiUsageSummary>(
    (acc, row) => {
      acc.totalRuns += 1;
      if (row.provider === "anthropic") acc.anthropicRuns += 1;
      else acc.fallbackRuns += 1;
      acc.inputTokens += row.input_tokens ?? 0;
      acc.outputTokens += row.output_tokens ?? 0;
      return acc;
    },
    {
      totalRuns: 0,
      anthropicRuns: 0,
      fallbackRuns: 0,
      inputTokens: 0,
      outputTokens: 0,
    },
  );
}

export async function listRecentAiUsage(limit = 50): Promise<AiUsageRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_usage")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data;
}
