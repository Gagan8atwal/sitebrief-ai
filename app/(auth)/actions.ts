"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES, roleHome, type Role } from "@/lib/constants";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/services/audit";
import { logger } from "@/lib/logger";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validations/auth";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function fieldErrors(
  flatten: { fieldErrors: Record<string, string[] | undefined> },
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(flatten.fieldErrors).filter(([, v]) => v && v.length),
  ) as Record<string, string[]>;
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error.flatten()) };
  }

  const supabase = await createClient();
  const { data: signIn, error } =
    await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    logger.warn("Login failed", { reason: error.message });
    return { error: "Invalid email or password." };
  }

  revalidatePath("/", "layout");
  redirect(await resolveHome(signIn.user?.id));
}

/** Resolve the post-auth landing route from the user's role. */
async function resolveHome(userId?: string): Promise<string> {
  if (!userId) return ROUTES.dashboard;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return roleHome((data?.role ?? "customer") as Role);
}

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error.flatten()) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) {
    logger.warn("Signup failed", { reason: error.message });
    return { error: error.message };
  }

  if (data.user) {
    await recordAudit({
      actorId: data.user.id,
      action: "create",
      entityType: "account",
      entityId: data.user.id,
    });
  }

  // If email confirmation is disabled, a session exists and we can proceed.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(await resolveHome(data.user?.id));
  }

  redirect(`${ROUTES.login}?checkEmail=1`);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(ROUTES.login);
}

export type ResetRequestState = AuthFormState & { sent?: boolean };

export async function requestPasswordResetAction(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error.flatten()) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${ROUTES.resetPassword}`,
    },
  );

  if (error) {
    logger.warn("Password reset request failed", { reason: error.message });
  }

  // Always report success to avoid leaking which emails are registered.
  return { sent: true };
}

export async function updatePasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error.flatten()) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Your reset link has expired. Request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    logger.warn("Password update failed", { reason: error.message });
    return { error: error.message };
  }

  await recordAudit({
    actorId: user.id,
    action: "update",
    entityType: "account",
    entityId: user.id,
    metadata: { event: "password_reset" },
  });

  revalidatePath("/", "layout");
  redirect(ROUTES.dashboard);
}
