import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { logger } from "@/lib/logger";

/**
 * Anthropic access layer. Server-only — the API key is never bundled to the
 * client. When `ANTHROPIC_API_KEY` is unset, `generateStructured` returns null
 * so callers transparently fall back to the deterministic engine.
 *
 * Reliability:
 *  - `maxRetries` retries 429/5xx/network errors with exponential backoff.
 *  - `timeout` bounds each request (and large outputs are streamed so the HTTP
 *    connection isn't held open past the timeout).
 */

export const AI_MODEL = "claude-opus-4-8";

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let cached: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!isAnthropicConfigured()) return null;
  if (!cached) {
    cached = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY as string,
      maxRetries: 3,
      timeout: 120_000,
    });
  }
  return cached;
}

export type AiResult<T> = {
  data: T;
  inputTokens: number;
  outputTokens: number;
  model: string;
};

function textFrom(content: Anthropic.Messages.ContentBlock[]): string {
  const parts: string[] = [];
  for (const block of content) {
    if (block.type === "text") parts.push(block.text);
  }
  return parts.join("");
}

/** Extract a JSON object from a model response that may include fences/prose. */
function parseJsonObject<T>(raw: string): T {
  let s = raw.trim();
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) s = fenced[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }
  return JSON.parse(s) as T;
}

/**
 * Run a structured-JSON generation against Claude Opus 4.8. Returns null on any
 * failure (missing key, network, timeout, unparseable output) so the caller can
 * fall back. Large outputs stream to avoid request timeouts.
 */
export async function generateStructured<T>(opts: {
  system: string;
  prompt: string;
  maxTokens?: number;
  stream?: boolean;
}): Promise<AiResult<T> | null> {
  const client = getClient();
  if (!client) return null;

  const max_tokens = opts.maxTokens ?? 8000;
  const system = `${opts.system}\n\nRespond with ONLY a single valid JSON object. No markdown, no code fences, no commentary.`;

  try {
    let text: string;
    let inputTokens = 0;
    let outputTokens = 0;

    if (opts.stream) {
      const stream = client.messages.stream({
        model: AI_MODEL,
        max_tokens,
        thinking: { type: "adaptive" },
        system,
        messages: [{ role: "user", content: opts.prompt }],
      });
      const msg = await stream.finalMessage();
      text = textFrom(msg.content);
      inputTokens = msg.usage.input_tokens;
      outputTokens = msg.usage.output_tokens;
    } else {
      const msg = await client.messages.create({
        model: AI_MODEL,
        max_tokens,
        thinking: { type: "adaptive" },
        system,
        messages: [{ role: "user", content: opts.prompt }],
      });
      text = textFrom(msg.content);
      inputTokens = msg.usage.input_tokens;
      outputTokens = msg.usage.output_tokens;
    }

    const data = parseJsonObject<T>(text);
    return { data, inputTokens, outputTokens, model: AI_MODEL };
  } catch (error) {
    logger.error("Anthropic generation failed; falling back", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
