import "server-only";

import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/services/audit";
import { err, ok, type Result } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { businessBriefSchema } from "@/lib/validations/brief";
import { EMPTY_BRIEF, type BusinessBrief } from "@/types/domain";
import type { Json } from "@/types/database";

/** Merge a stored (partial) brief over the defaults so the wizard always
 *  receives a complete, well-typed object. */
export function normalizeBrief(raw: Json | null | undefined): BusinessBrief {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_BRIEF };
  }
  return { ...EMPTY_BRIEF, ...(raw as Partial<BusinessBrief>) };
}

/** Whether a brief has enough data to run a generation. */
export function isBriefComplete(brief: BusinessBrief): boolean {
  return businessBriefSchema.safeParse(brief).success;
}

export async function saveBrief(
  ownerId: string,
  projectId: string,
  brief: BusinessBrief,
): Promise<Result<BusinessBrief>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ brief: brief as unknown as Json })
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .select("brief")
    .maybeSingle();

  if (error) {
    logger.error("saveBrief failed", { error: error.message, projectId });
    return err("internal", "Could not save the brief", { cause: error });
  }
  if (!data) {
    return err("not_found", "Project not found");
  }

  await recordAudit({
    actorId: ownerId,
    action: "update",
    entityType: "brief",
    entityId: projectId,
  });

  return ok(normalizeBrief(data.brief));
}
