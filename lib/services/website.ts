import "server-only";

import { createClient } from "@/lib/supabase/server";
import { emitEvent, recordAudit } from "@/lib/services/audit";
import { recordAiUsage } from "@/lib/services/ai-usage";
import {
  generateWebsite,
  rewriteSectionCopy,
} from "@/lib/ai/generate-website";
import { normalizeBrief, isBriefComplete } from "@/lib/services/brief";
import { err, ok, type Result } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { sanitizeWebsite, EMPTY_WEBSITE } from "@/lib/website-sanitize";
import type { Json, WebsiteVersionRow } from "@/types/database";
import type { GeneratedWebsite, WebsiteSection } from "@/types/website";

export type WebsiteVersion = Omit<WebsiteVersionRow, "content"> & {
  content: GeneratedWebsite;
};

function asVersion(row: WebsiteVersionRow): WebsiteVersion {
  // Snapshots are always sanitized so the revisions UI can never crash on a
  // malformed historical payload.
  return { ...row, content: sanitizeWebsite(row.content) ?? EMPTY_WEBSITE };
}

/**
 * Read the current editable website plan for a project, sanitized so every
 * renderer receives a fully-shaped object. Returns null when no website exists
 * yet (the Studio then shows its empty state).
 */
export function getWebsite(
  raw: Json | null | undefined,
): GeneratedWebsite | null {
  return sanitizeWebsite(raw);
}

async function nextVersion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
): Promise<number> {
  const { data } = await supabase
    .from("website_versions")
    .select("version")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.version ?? 0) + 1;
}

async function snapshot(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    projectId: string;
    ownerId: string;
    website: GeneratedWebsite;
    label: string;
  },
): Promise<Result<WebsiteVersion>> {
  const version = await nextVersion(supabase, params.projectId);
  const { data, error } = await supabase
    .from("website_versions")
    .insert({
      project_id: params.projectId,
      version,
      label: params.label,
      content: params.website as unknown as Json,
      created_by: params.ownerId,
    })
    .select("*")
    .single();

  if (error) {
    logger.error("website snapshot failed", {
      error: error.message,
      projectId: params.projectId,
    });
    return err("internal", "Could not save a website revision", {
      cause: error,
    });
  }
  return ok(asVersion(data));
}

async function persistCurrent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string,
  projectId: string,
  website: GeneratedWebsite,
): Promise<Result<true>> {
  const { data, error } = await supabase
    .from("projects")
    .update({
      website: website as unknown as Json,
      last_generated_at: website.generatedAt,
    })
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .select("id")
    .maybeSingle();

  if (error) {
    return err("internal", "Could not save the website", { cause: error });
  }
  if (!data) {
    return err("not_found", "Project not found");
  }
  return ok(true);
}

/** Generate a full website plan from the project's business brief. */
export async function generateWebsiteForProject(
  ownerId: string,
  projectId: string,
): Promise<Result<GeneratedWebsite>> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, brief")
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) return err("internal", "Could not load project", { cause: error });
  if (!project) return err("not_found", "Project not found");

  const brief = normalizeBrief(project.brief);
  if (!isBriefComplete(brief)) {
    return err("validation", "Complete the business brief first.");
  }

  let website: GeneratedWebsite;
  try {
    const outcome = await generateWebsite(brief);
    website = outcome.data;
    await recordAiUsage({
      userId: ownerId,
      projectId,
      operation: "website",
      meta: outcome.meta,
    });
  } catch (cause) {
    logger.error("generateWebsite threw", { projectId, error: String(cause) });
    return err("internal", "Website generation failed. Please try again.");
  }

  const persisted = await persistCurrent(supabase, ownerId, projectId, website);
  if (!persisted.ok) return persisted;

  await snapshot(supabase, {
    projectId,
    ownerId,
    website,
    label: "Generated",
  });

  await Promise.all([
    recordAudit({
      actorId: ownerId,
      action: "create",
      entityType: "website",
      entityId: projectId,
    }),
    emitEvent({
      type: "project.updated",
      projectId,
      actorId: ownerId,
      payload: { event: "website.generated" },
    }),
  ]);

  return ok(website);
}

/** Persist an edited website plan and record a revision snapshot. */
export async function saveWebsite(
  ownerId: string,
  projectId: string,
  website: GeneratedWebsite,
  label = "Edited",
): Promise<Result<GeneratedWebsite>> {
  const supabase = await createClient();
  const stamped: GeneratedWebsite = {
    ...website,
    generatedAt: new Date().toISOString(),
  };

  const persisted = await persistCurrent(supabase, ownerId, projectId, stamped);
  if (!persisted.ok) return persisted;

  await snapshot(supabase, { projectId, ownerId, website: stamped, label });
  await recordAudit({
    actorId: ownerId,
    action: "update",
    entityType: "website",
    entityId: projectId,
  });

  return ok(stamped);
}

export async function listWebsiteVersions(
  projectId: string,
): Promise<WebsiteVersion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_versions")
    .select("*")
    .eq("project_id", projectId)
    .order("version", { ascending: false });

  if (error) {
    logger.error("listWebsiteVersions failed", {
      error: error.message,
      projectId,
    });
    return [];
  }
  return data.map(asVersion);
}

export type SectionCopy = Omit<WebsiteSection, "id" | "type">;

/**
 * Regenerate the copy for one section using the brief + current strategy.
 * Does not persist — returns the new copy so the editor can preview/merge it.
 */
export async function rewriteSection(
  ownerId: string,
  projectId: string,
  pageId: string,
  sectionId: string,
  variant: number,
): Promise<Result<SectionCopy>> {
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select("brief, website")
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) return err("internal", "Could not load project", { cause: error });
  if (!project) return err("not_found", "Project not found");

  const website = getWebsite(project.website);
  if (!website) return err("not_found", "No website to edit");

  const page = website.pages.find((p) => p.id === pageId);
  const section = page?.sections.find((s) => s.id === sectionId);
  if (!page || !section) return err("not_found", "Section not found");

  const brief = normalizeBrief(project.brief);
  const copy = rewriteSectionCopy(
    brief,
    website.strategy,
    { name: page.name, slug: page.slug },
    section.type,
    variant,
  );
  return ok(copy);
}

/** Restore a prior snapshot as the current website (records a new snapshot). */
export async function restoreWebsiteVersion(
  ownerId: string,
  projectId: string,
  versionId: string,
): Promise<Result<GeneratedWebsite>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_versions")
    .select("*")
    .eq("id", versionId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) return err("internal", "Could not load revision", { cause: error });
  if (!data) return err("not_found", "Revision not found");

  const restored = asVersion(data).content;
  return saveWebsite(
    ownerId,
    projectId,
    restored,
    `Restored from v${data.version}`,
  );
}
