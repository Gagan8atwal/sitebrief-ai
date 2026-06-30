/**
 * Website artifact models — the output of the Sprint 3 website engine.
 *
 * A `GeneratedWebsite` is a complete, editable multi-page site plan:
 * strategy + navigation + pages (each a list of typed, copy-filled sections) +
 * theme. It is produced by `lib/ai/generate-website.ts`, persisted on
 * `projects.website`, and snapshotted into `website_versions` for revisions.
 */

export const SECTION_TYPES = [
  "hero",
  "valueProps",
  "features",
  "about",
  "stats",
  "testimonials",
  "pricing",
  "faq",
  "cta",
  "contactInfo",
  "footer",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  valueProps: "Value props",
  features: "Features",
  about: "About",
  stats: "Stats",
  testimonials: "Testimonials",
  pricing: "Pricing",
  faq: "FAQ",
  cta: "Call to action",
  contactInfo: "Contact info",
  footer: "Footer",
};

/** A repeated item inside a section (feature, faq pair, pricing tier, …). */
export type SectionItem = {
  title: string;
  description?: string;
  meta?: string;
};

export type WebsiteSection = {
  id: string;
  type: SectionType;
  heading: string;
  subheading?: string;
  body?: string;
  items?: SectionItem[];
  ctaLabel?: string;
};

export type WebsitePage = {
  id: string;
  name: string;
  slug: string;
  purpose: string;
  isHome: boolean;
  seo: { title: string; description: string };
  sections: WebsiteSection[];
};

export type NavLink = { label: string; slug: string };

export type WebsiteStrategy = {
  positioning: string;
  audienceInsights: string;
  contentStrategy: string;
  conversionStrategy: string;
  keyMessages: string[];
};

export type WebsiteTheme = {
  primaryColor: string;
  tone: string;
  headingFont: string;
  bodyFont: string;
};

export type GeneratedWebsite = {
  name: string;
  strategy: WebsiteStrategy;
  navigation: NavLink[];
  pages: WebsitePage[];
  theme: WebsiteTheme;
  generatedAt: string;
};

/** Narrow an unknown/Json value into a GeneratedWebsite, or null if empty. */
export function isGeneratedWebsite(value: unknown): value is GeneratedWebsite {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Array.isArray((value as GeneratedWebsite).pages) &&
    typeof (value as GeneratedWebsite).strategy === "object"
  );
}
