import { slugify } from "@/lib/utils";
import {
  SECTION_TYPES,
  type GeneratedWebsite,
  type NavLink,
  type SectionItem,
  type SectionType,
  type WebsitePage,
  type WebsiteSection,
  type WebsiteStrategy,
  type WebsiteTheme,
} from "@/types/website";

/**
 * Coerce an arbitrary (possibly AI-generated or legacy) value into a fully
 * shaped `GeneratedWebsite`. This is the single guarantee that every renderer
 * (Studio, Preview, Editor, Revisions) receives well-formed data — no missing
 * arrays, no undefined nested objects — so a partial model response can never
 * crash the Website tab. Returns null only when there is no real website yet
 * (no pages), which callers treat as "show the empty state".
 */

const SECTION_SET = new Set<string>(SECTION_TYPES);

function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function strArray(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string")
    : [];
}

function optStr(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function sanitizeItems(v: unknown): SectionItem[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.map((raw) => {
    const o = asObject(raw);
    return {
      title: str(o.title, "Untitled"),
      description: optStr(o.description),
      meta: optStr(o.meta),
    } satisfies SectionItem;
  });
}

function sanitizeSection(
  raw: unknown,
  index: number,
  pageSlug: string,
): WebsiteSection {
  const o = asObject(raw);
  const type = (SECTION_SET.has(str(o.type)) ? o.type : "hero") as SectionType;
  return {
    id: str(o.id) || `${pageSlug}-${type}-${index}`,
    type,
    heading: str(o.heading),
    subheading: optStr(o.subheading),
    body: optStr(o.body),
    items: sanitizeItems(o.items),
    ctaLabel: optStr(o.ctaLabel),
  };
}

function sanitizePage(raw: unknown, index: number): WebsitePage {
  const o = asObject(raw);
  const name = str(o.name, `Page ${index + 1}`);
  const isHome = o.isHome === true || index === 0;
  const slug =
    str(o.slug) || (isHome ? "home" : slugify(name) || `page-${index + 1}`);
  const seo = asObject(o.seo);
  const sections = Array.isArray(o.sections)
    ? o.sections.map((s, i) => sanitizeSection(s, i, slug))
    : [];
  return {
    id: str(o.id) || slug,
    name,
    slug,
    purpose: str(o.purpose),
    isHome,
    seo: { title: str(seo.title, name), description: str(seo.description) },
    sections,
  };
}

function sanitizeStrategy(raw: unknown): WebsiteStrategy {
  const o = asObject(raw);
  return {
    positioning: str(o.positioning),
    audienceInsights: str(o.audienceInsights),
    contentStrategy: str(o.contentStrategy),
    conversionStrategy: str(o.conversionStrategy),
    keyMessages: strArray(o.keyMessages),
  };
}

function sanitizeTheme(raw: unknown): WebsiteTheme {
  const o = asObject(raw);
  return {
    primaryColor: str(o.primaryColor, "#6d5ae6"),
    tone: str(o.tone, "Professional"),
    headingFont: str(o.headingFont, "Inter"),
    bodyFont: str(o.bodyFont, "Inter"),
  };
}

export function sanitizeWebsite(raw: unknown): GeneratedWebsite | null {
  const o = asObject(raw);
  if (!Array.isArray(o.pages) || o.pages.length === 0) return null;

  const pages = o.pages.map((p, i) => sanitizePage(p, i));
  if (!pages.some((p) => p.isHome) && pages[0]) pages[0].isHome = true;

  const navRaw = Array.isArray(o.navigation) ? o.navigation : [];
  const navigation: NavLink[] = navRaw
    .map((n) => {
      const x = asObject(n);
      return { label: str(x.label, "Page"), slug: str(x.slug) };
    })
    .filter((n) => n.slug);

  return {
    name: str(o.name, "Website"),
    strategy: sanitizeStrategy(o.strategy),
    navigation: navigation.length
      ? navigation
      : pages.map((p) => ({ label: p.name, slug: p.slug })),
    pages,
    theme: sanitizeTheme(o.theme),
    generatedAt: str(o.generatedAt) || "1970-01-01T00:00:00.000Z",
  };
}

/** A valid, empty website — used as a type-safe fallback for malformed rows. */
export const EMPTY_WEBSITE: GeneratedWebsite = {
  name: "Website",
  strategy: {
    positioning: "",
    audienceInsights: "",
    contentStrategy: "",
    conversionStrategy: "",
    keyMessages: [],
  },
  navigation: [],
  pages: [],
  theme: {
    primaryColor: "#6d5ae6",
    tone: "Professional",
    headingFont: "Inter",
    bodyFont: "Inter",
  },
  generatedAt: "1970-01-01T00:00:00.000Z",
};
