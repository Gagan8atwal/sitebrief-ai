import "server-only";

import { createClient } from "@/lib/supabase/server";
import { emitEvent, recordAudit } from "@/lib/services/audit";
import { recordAiUsage } from "@/lib/services/ai-usage";
import { generateBrief } from "@/lib/ai/generate-brief";
import { normalizeBrief, isBriefComplete } from "@/lib/services/brief";
import { err, ok, type Result } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { Json, ProjectVersion } from "@/types/database";
import type { GeneratedBrief } from "@/types/domain";

/** A project_version row whose `content` is a typed GeneratedBrief. */
export type GenerationVersion = Omit<ProjectVersion, "content"> & {
  content: GeneratedBrief;
};

function asGeneration(row: ProjectVersion): GenerationVersion {
  return { ...row, content: row.content as unknown as GeneratedBrief };
}

export async function listGenerations(
  projectId: string,
): Promise<Result<GenerationVersion[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_versions")
    .select("*")
    .eq("project_id", projectId)
    .order("version", { ascending: false });

  if (error) {
    logger.error("listGenerations failed", {
      error: error.message,
      projectId,
    });
    return err("internal", "Could not load versions", { cause: error });
  }
  return ok(data.map(asGeneration));
}

/**
 * Run a generation for a project: validate the brief, synthesize the output,
 * and persist it as the next project_version. Returns the new version.
 */
export async function runGeneration(
  ownerId: string,
  projectId: string,
): Promise<Result<GenerationVersion>> {
  const supabase = await createClient();

  // Load the owning project (RLS also enforces ownership).
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, brief")
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (projectError) {
    return err("internal", "Could not load project", { cause: projectError });
  }
  if (!project) {
    return err("not_found", "Project not found");
  }

  const brief = normalizeBrief(project.brief);
  if (!isBriefComplete(brief)) {
    return err(
      "validation",
      "Complete the business brief before generating.",
    );
  }

  // Determine the next version number.
  const { data: last } = await supabase
    .from("project_versions")
    .select("version")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextVersion = (last?.version ?? 0) + 1;

  let generated: GeneratedBrief;
  try {
    const outcome = await generateBrief(brief);
    generated = outcome.data;
    await recordAiUsage({
      userId: ownerId,
      projectId,
      operation: "brief",
      meta: outcome.meta,
    });
  } catch (error) {
    logger.error("generateBrief threw", { projectId, error: String(error) });
    return err("internal", "Generation failed. Please try again.");
  }

  const { data: inserted, error: insertError } = await supabase
    .from("project_versions")
    .insert({
      project_id: projectId,
      version: nextVersion,
      content: generated as unknown as Json,
      created_by: ownerId,
    })
    .select("*")
    .single();

  if (insertError) {
    logger.error("runGeneration insert failed", {
      error: insertError.message,
      projectId,
    });
    return err("internal", "Could not save the generated brief", {
      cause: insertError,
    });
  }

  await supabase
    .from("projects")
    .update({ last_generated_at: generated.generatedAt })
    .eq("id", projectId)
    .eq("owner_id", ownerId);

  await Promise.all([
    recordAudit({
      actorId: ownerId,
      action: "create",
      entityType: "version",
      entityId: inserted.id,
      metadata: { version: nextVersion },
    }),
    emitEvent({
      type: "version.created",
      projectId,
      actorId: ownerId,
      payload: { version: nextVersion },
    }),
  ]);

  return ok(asGeneration(inserted));
}
