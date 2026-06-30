"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import {
  createProject,
  deleteProject,
  updateProject,
} from "@/lib/services/projects";
import {
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/validations/project";

export type ProjectFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

function flatten(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(([, v]) => v && v.length),
  ) as Record<string, string[]>;
}

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const user = await requireUser();

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }

  const result = await createProject(user.id, parsed.data);
  if (!result.ok) {
    return { error: result.error.message };
  }

  revalidatePath(ROUTES.projects);
  revalidatePath(ROUTES.dashboard);
  redirect(`${ROUTES.projects}/${result.data.id}`);
}

export async function updateProjectAction(
  id: string,
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const user = await requireUser();

  const parsed = updateProjectSchema.safeParse({
    name: formData.get("name") ?? undefined,
    description: formData.get("description") ?? undefined,
    status: formData.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }

  const result = await updateProject(user.id, id, parsed.data);
  if (!result.ok) {
    return { error: result.error.message };
  }

  revalidatePath(ROUTES.projects);
  revalidatePath(`${ROUTES.projects}/${id}`);
  return { success: true };
}

export async function archiveProjectAction(id: string): Promise<void> {
  const user = await requireUser();
  await updateProject(user.id, id, { status: "archived" });
  revalidatePath(ROUTES.projects);
  revalidatePath(`${ROUTES.projects}/${id}`);
}

export async function deleteProjectAction(id: string): Promise<void> {
  const user = await requireUser();
  await deleteProject(user.id, id);
  revalidatePath(ROUTES.projects);
  revalidatePath(ROUTES.dashboard);
  redirect(ROUTES.projects);
}
