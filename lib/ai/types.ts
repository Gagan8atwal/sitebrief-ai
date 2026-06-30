/** Provenance for a single generation, logged to `ai_usage`. */
export type GenMeta = {
  provider: "anthropic" | "fallback";
  model: string | null;
  inputTokens: number;
  outputTokens: number;
  status: "success" | "fallback" | "error";
};

export type GenOutcome<T> = { data: T; meta: GenMeta };

export const FALLBACK_META: GenMeta = {
  provider: "fallback",
  model: null,
  inputTokens: 0,
  outputTokens: 0,
  status: "fallback",
};
