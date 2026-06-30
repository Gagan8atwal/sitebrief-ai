import "server-only";

import { createClient } from "@/lib/supabase/server";
import { recordAudit, emitEvent } from "@/lib/services/audit";
import { err, ok, type Result } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { slugify, toError } from "@/lib/utils";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "@/lib/validations/project";
import type { Json, Project, ProjectUpdate } from "@/types/database";

/**
 * Data-access + domain logic for projects. All reads/writes go through the
 * RLS-bound server client, so the database enforces per-user isolation; the
 * `owner_id` we pass is defense-in-depth, not the only guard.
 */

export async function listProjects(ownerId: string): Promise<Result<Project[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (error) {
    logger.error("listProjects failed", { error: error.message, ownerId });
    return err("internal", "Could not load projects", { cause: error });
  }
  return ok(data);
}

export async function getProject(
  ownerId: string,
  id: string,
): Promise<Result<Project>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    logger.error("getProject failed", { error: error.message, id });
    return err("internal", "Could not load project", { cause: error });
  }
  if (!data) {
    return err("not_found", "Project not found");
  }
  return ok(data);
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string,
  base: string,
): Promise<string> {
  const root = slugify(base) || "project";
  let candidate = root;
  let suffix = 1;

  // Bounded loop; collisions are rare and per-owner.
  while (suffix < 50) {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("owner_id", ownerId)
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
  return `${root}-${Date.now()}`;
}

export async function createProject(
  ownerId: string,
  input: CreateProjectInput,
): Promise<Result<Project>> {
  const supabase = await createClient();
  const slug = await uniqueSlug(supabase, ownerId, input.name);

  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: ownerId,
      name: input.name,
      slug,
      description: input.description ? input.description : null,
      status: "draft",
    })
    .select("*")
    .single();

  if (error) {
    logger.error("createProject failed", { error: error.message, ownerId });
    return err("internal", "Could not create project", { cause: error });
  }

  await Promise.all([
    recordAudit({
      actorId: ownerId,
      action: "create",
      entityType: "project",
      entityId: data.id,
      metadata: { name: data.name },
    }),
    emitEvent({
      type: "project.created",
      projectId: data.id,
      actorId: ownerId,
      payload: { name: data.name },
    }),
  ]);

  return ok(data);
}

export async function updateProject(
  ownerId: string,
  id: string,
  input: UpdateProjectInput,
): Promise<Result<Project>> {
  const supabase = await createClient();

  const patch: ProjectUpdate = {};
  const metadata: Record<string, Json> = {};
  if (input.name !== undefined) {
    patch.name = input.name;
    metadata.name = input.name;
  }
  if (input.description !== undefined) {
    patch.description = input.description ? input.description : null;
    metadata.description = patch.description;
  }
  if (input.status !== undefined) {
    patch.status = input.status;
    metadata.status = input.status;
  }

  if (Object.keys(patch).length === 0) {
    return getProject(ownerId, id);
  }

  const { data, error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("*")
    .maybeSingle();

  if (error) {
    logger.error("updateProject failed", { error: error.message, id });
    return err("internal", "Could not update project", { cause: error });
  }
  if (!data) {
    return err("not_found", "Project not found");
  }

  await Promise.all([
    recordAudit({
      actorId: ownerId,
      action: input.status === "archived" ? "archive" : "update",
      entityType: "project",
      entityId: id,
      metadata,
    }),
    emitEvent({
      type:
        input.status === "archived"
          ? "project.archived"
          : "project.updated",
      projectId: id,
      actorId: ownerId,
      payload: metadata,
    }),
  ]);

  return ok(data);
}

export async function deleteProject(
  ownerId: string,
  id: string,
): Promise<Result<true>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) {
    logger.error("deleteProject failed", { error: error.message, id });
    return err("internal", "Could not delete project", { cause: error });
  }

  await recordAudit({
    actorId: ownerId,
    action: "delete",
    entityType: "project",
    entityId: id,
  });

  return ok(true);
}

export async function countProjects(ownerId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", ownerId);

  if (error) {
    logger.warn("countProjects failed", { error: toError(error).message });
    return 0;
  }
  return count ?? 0;
}
