import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { ROUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

/** Returns the current authenticated user, or null. */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Returns the current user or redirects to /login. Use at the top of any
 * Server Component / action that requires authentication.
 */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect(ROUTES.login);
  }
  return user;
}
