import "server-only";

import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/services/audit";
import { err, ok, type Result } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { UpdateProfileInput } from "@/lib/validations/profile";
import type { Profile } from "@/types/database";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    logger.error("getProfile failed", { error: error.message, userId });
    return null;
  }
  return data;
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<Result<Profile>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: input.fullName })
    .eq("id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    logger.error("updateProfile failed", { error: error.message, userId });
    return err("internal", "Could not update your profile", { cause: error });
  }
  if (!data) {
    return err("not_found", "Profile not found");
  }

  await recordAudit({
    actorId: userId,
    action: "update",
    entityType: "profile",
    entityId: userId,
  });

  return ok(data);
}
