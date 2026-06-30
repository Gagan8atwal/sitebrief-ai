"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { updateProfile } from "@/lib/services/profile";
import { updateProfileSchema } from "@/lib/validations/profile";

export type ProfileFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireUser();

  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const result = await updateProfile(user.id, parsed.data);
  if (!result.ok) {
    return { error: result.error.message };
  }

  revalidatePath(ROUTES.settings);
  revalidatePath("/", "layout");
  return { success: true };
}
