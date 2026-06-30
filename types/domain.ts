/**
 * Domain models for the business-brief wizard and the AI generation workflow.
 *
 * `BusinessBrief` is the structured input a user assembles in the wizard and is
 * persisted on `projects.brief`. `GeneratedBrief` is the structured output the
 * generation service produces and stores in `project_versions.content`.
 */

export const INDUSTRIES = [
  "SaaS",
  "E-commerce",
  "Agency",
  "Healthcare",
  "Education",
  "Finance",
  "Real Estate",
  "Hospitality",
  "Nonprofit",
  "Other",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const TONES = [
  "Professional",
  "Friendly",
  "Bold",
  "Minimal",
  "Playful",
  "Luxury",
] as const;
export type Tone = (typeof TONES)[number];

export const GOALS = [
  "Generate leads",
  "Sell products",
  "Book appointments",
  "Build brand awareness",
  "Share information",
  "Grow a community",
] as const;
export type Goal = (typeof GOALS)[number];

export const PAGE_PRESETS = [
  "Home",
  "About",
  "Services",
  "Pricing",
  "Portfolio",
  "Blog",
  "Contact",
  "FAQ",
] as const;
export type PagePreset = (typeof PAGE_PRESETS)[number];

/** Wizard input — what the user provides. All fields optional until submit. */
export type BusinessBrief = {
  businessName: string;
  industry: Industry;
  description: string;
  targetAudience: string;
  goals: string[];
  tone: Tone;
  primaryColor: string;
  pages: string[];
  competitors?: string;
};

export const EMPTY_BRIEF: BusinessBrief = {
  businessName: "",
  industry: "SaaS",
  description: "",
  targetAudience: "",
  goals: [],
  tone: "Professional",
  primaryColor: "#6d5ae6",
  pages: ["Home", "About", "Contact"],
  competitors: "",
};

/** A single page in the generated sitemap. */
export type GeneratedPage = {
  name: string;
  slug: string;
  purpose: string;
  sections: string[];
};

/** Generation output — what the AI workflow produces. */
export type GeneratedBrief = {
  title: string;
  summary: string;
  valueProposition: string;
  targetAudience: string;
  toneGuidelines: string;
  sitemap: GeneratedPage[];
  callsToAction: string[];
  seoKeywords: string[];
  designDirection: {
    primaryColor: string;
    mood: string;
    typography: string;
  };
  generatedAt: string;
  briefSnapshot: BusinessBrief;
};
