import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { ROUTES, roleHome, type Role } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

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

/** The authenticated user paired with their profile row (incl. role). */
export type SessionContext = { user: User; profile: Profile };

/**
 * Returns the current user + profile, or null if unauthenticated. The profile
 * is the source of truth for `role` — never trust a client-supplied role.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;
  return { user, profile };
}

/** Require an authenticated session and return user + profile, else redirect. */
export async function requireSession(): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (!ctx) redirect(ROUTES.login);
  return ctx;
}

/**
 * Require one of the given roles. Authenticated users without a permitted role
 * are redirected to their own role home (never shown the forbidden page chrome).
 */
export async function requireRole(roles: Role[]): Promise<SessionContext> {
  const ctx = await requireSession();
  if (!roles.includes(ctx.profile.role)) {
    redirect(roleHome(ctx.profile.role));
  }
  return ctx;
}

export function hasRole(profile: Profile | null, roles: Role[]): boolean {
  return Boolean(profile && roles.includes(profile.role));
}
