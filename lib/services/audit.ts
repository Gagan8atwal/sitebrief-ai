import "server-only";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { toError } from "@/lib/utils";
import type { Json } from "@/types/database";
import type { AuditAction, EventType } from "@/lib/constants";

/**
 * Append an entry to the audit log. Best-effort: a failure here must never
 * break the primary operation, so errors are logged and swallowed.
 */
export async function recordAudit(params: {
  actorId: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: Json;
}): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("audit_log").insert({
      actor_id: params.actorId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? {},
    });
    if (error) throw error;
  } catch (error) {
    logger.error("Failed to record audit entry", {
      error: toError(error).message,
      action: params.action,
      entityType: params.entityType,
    });
  }
}

/**
 * Emit a domain event. Best-effort, same contract as `recordAudit`.
 */
export async function emitEvent(params: {
  type: EventType;
  projectId?: string | null;
  actorId?: string | null;
  payload?: Json;
}): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("events").insert({
      type: params.type,
      project_id: params.projectId ?? null,
      actor_id: params.actorId ?? null,
      payload: params.payload ?? {},
    });
    if (error) throw error;
  } catch (error) {
    logger.error("Failed to emit event", {
      error: toError(error).message,
      type: params.type,
    });
  }
}
