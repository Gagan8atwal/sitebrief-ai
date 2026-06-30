"use server";

import { revalidatePath } from "next/cache";

import { ROUTES, USER_ROLES, type Role } from "@/lib/constants";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/services/audit";
import { logger } from "@/lib/logger";

export type AdminActionResult = { ok: boolean; error?: string };

/**
 * Change a user's role. Gated to owner/admin here; RLS additionally prevents an
 * admin from editing an owner row or granting the owner role (see
 * profiles_update_admin). Never trusts the client.
 */
export async function updateUserRoleAction(
  userId: string,
  role: Role,
): Promise<AdminActionResult> {
  const { user } = await requireRole(["owner", "admin"]);

  if (!USER_ROLES.includes(role)) {
    return { ok: false, error: "Invalid role." };
  }
  if (userId === user.id) {
    return { ok: false, error: "You cannot change your own role." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    logger.warn("updateUserRole failed", { error: error.message, userId });
    return { ok: false, error: "Update was not permitted." };
  }
  if (!data) {
    // RLS returned no row → not authorized for this target (e.g. an admin
    // attempting to edit an owner).
    return { ok: false, error: "You don't have permission to change this user." };
  }

  await recordAudit({
    actorId: user.id,
    action: "update",
    entityType: "user_role",
    entityId: userId,
    metadata: { role },
  });

  revalidatePath(`${ROUTES.admin}/users`);
  return { ok: true };
}

/** Owner-only: designate which email is auto-promoted to owner on signup. */
export async function updateOwnerEmailAction(
  email: string,
): Promise<AdminActionResult> {
  const { user } = await requireRole(["owner"]);

  const clean = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ owner_email: clean, updated_at: new Date().toISOString() })
    .eq("id", true);

  if (error) {
    logger.warn("updateOwnerEmail failed", { error: error.message });
    return { ok: false, error: "Could not update settings." };
  }

  await recordAudit({
    actorId: user.id,
    action: "update",
    entityType: "app_settings",
    entityId: "owner_email",
  });

  revalidatePath(`${ROUTES.admin}/settings`);
  return { ok: true };
}
