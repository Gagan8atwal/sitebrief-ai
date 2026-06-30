"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { saveBrief } from "@/lib/services/brief";
import { runGeneration } from "@/lib/services/generation";
import { businessBriefSchema } from "@/lib/validations/brief";
import type { BusinessBrief } from "@/types/domain";

export type ActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/** Persist the full business brief for a project. */
export async function saveBriefAction(
  projectId: string,
  brief: BusinessBrief,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = businessBriefSchema.safeParse(brief);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please complete all required fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const result = await saveBrief(user.id, projectId, parsed.data);
  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath(`${ROUTES.projects}/${projectId}`);
  return { ok: true };
}

/** Run an AI generation for a project (brief must already be complete). */
export async function generateAction(
  projectId: string,
): Promise<ActionResult> {
  const user = await requireUser();

  const result = await runGeneration(user.id, projectId);
  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath(`${ROUTES.projects}/${projectId}`);
  revalidatePath(ROUTES.projects);
  revalidatePath(ROUTES.dashboard);
  return { ok: true };
}
