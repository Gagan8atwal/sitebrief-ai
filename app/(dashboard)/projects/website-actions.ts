"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import {
  generateWebsiteForProject,
  restoreWebsiteVersion,
  rewriteSection,
  saveWebsite,
  type SectionCopy,
} from "@/lib/services/website";
import type { GeneratedWebsite } from "@/types/website";

export type WebsiteActionResult = {
  ok: boolean;
  error?: string;
};

export type RewriteResult =
  | { ok: true; copy: SectionCopy }
  | { ok: false; error: string };

function revalidate(projectId: string) {
  revalidatePath(`${ROUTES.projects}/${projectId}`);
}

export async function generateWebsiteAction(
  projectId: string,
): Promise<WebsiteActionResult> {
  const user = await requireUser();
  const result = await generateWebsiteForProject(user.id, projectId);
  if (!result.ok) return { ok: false, error: result.error.message };
  revalidate(projectId);
  return { ok: true };
}

export async function saveWebsiteAction(
  projectId: string,
  website: GeneratedWebsite,
): Promise<WebsiteActionResult> {
  const user = await requireUser();
  const result = await saveWebsite(user.id, projectId, website);
  if (!result.ok) return { ok: false, error: result.error.message };
  revalidate(projectId);
  return { ok: true };
}

export async function restoreWebsiteVersionAction(
  projectId: string,
  versionId: string,
): Promise<WebsiteActionResult> {
  const user = await requireUser();
  const result = await restoreWebsiteVersion(user.id, projectId, versionId);
  if (!result.ok) return { ok: false, error: result.error.message };
  revalidate(projectId);
  return { ok: true };
}

export async function rewriteSectionAction(
  projectId: string,
  pageId: string,
  sectionId: string,
  variant: number,
): Promise<RewriteResult> {
  const user = await requireUser();
  const result = await rewriteSection(
    user.id,
    projectId,
    pageId,
    sectionId,
    variant,
  );
  if (!result.ok) return { ok: false, error: result.error.message };
  return { ok: true, copy: result.data };
}
