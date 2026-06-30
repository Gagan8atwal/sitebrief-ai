import { z } from "zod";

import { GOALS, INDUSTRIES, TONES } from "@/types/domain";

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, "Enter a valid hex color (e.g. #6d5ae6)");

/** Per-step schemas — used to validate each wizard step independently. */
export const briefStepSchemas = {
  basics: z.object({
    businessName: z
      .string()
      .trim()
      .min(2, "Business name is required")
      .max(80, "Business name is too long"),
    industry: z.enum(INDUSTRIES),
    description: z
      .string()
      .trim()
      .min(20, "Describe your business in at least 20 characters")
      .max(600, "Keep the description under 600 characters"),
  }),
  audience: z.object({
    targetAudience: z
      .string()
      .trim()
      .min(10, "Describe your target audience")
      .max(400, "Keep this under 400 characters"),
    goals: z
      .array(z.enum(GOALS))
      .min(1, "Select at least one goal")
      .max(GOALS.length),
  }),
  design: z.object({
    tone: z.enum(TONES),
    primaryColor: hexColor,
    pages: z
      .array(z.string().trim().min(1))
      .min(1, "Select at least one page")
      .max(12, "That's a lot of pages — keep it under 12"),
    competitors: z
      .string()
      .trim()
      .max(400, "Keep this under 400 characters")
      .optional()
      .or(z.literal("")),
  }),
} as const;

/** Full brief schema — the merge of every step, validated on final submit. */
export const businessBriefSchema = briefStepSchemas.basics
  .merge(briefStepSchemas.audience)
  .merge(briefStepSchemas.design);

export type BusinessBriefInput = z.infer<typeof businessBriefSchema>;
export type BriefStep = keyof typeof briefStepSchemas;
