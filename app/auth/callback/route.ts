import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * OAuth / email-confirmation callback. Exchanges the `code` for a session and
 * redirects onward. `next` is sanitized to same-origin paths to avoid open
 * redirects.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? ROUTES.dashboard;
  const next = nextParam.startsWith("/") ? nextParam : ROUTES.dashboard;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    logger.warn("Auth callback failed", { reason: error.message });
  }

  return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth`);
}
