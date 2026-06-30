import { z } from "zod";

/**
 * Centralized, validated environment access.
 *
 * Client-safe values (NEXT_PUBLIC_*) are validated eagerly and may be imported
 * anywhere. Server-only secrets are exposed through `serverEnv()` which throws
 * if accessed in a browser bundle.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

function format(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

const parsedClient = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsedClient.success) {
  throw new Error(
    `Invalid or missing public environment variables:\n${format(parsedClient.error)}\n` +
      `Copy .env.example to .env.local and fill in the values.`,
  );
}

export const env = parsedClient.data;

let cachedServerEnv: z.infer<typeof serverSchema> | null = null;

/**
 * Access server-only secrets. Throws if called from a client bundle.
 */
export function serverEnv(): z.infer<typeof serverSchema> {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() must not be called on the client.");
  }
  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid or missing server environment variables:\n${format(parsed.error)}`,
    );
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}
