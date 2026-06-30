import "server-only";

import { slugify } from "@/lib/utils";
import {
  generateStructured,
  isAnthropicConfigured,
} from "@/lib/ai/anthropic";
import type { GenOutcome } from "@/lib/ai/types";
import type { BusinessBrief } from "@/types/domain";
import {
  SECTION_TYPES,
  type GeneratedWebsite,
  type NavLink,
  type SectionItem,
  type SectionType,
  type WebsitePage,
  type WebsiteSection,
  type WebsiteStrategy,
} from "@/types/website";

/**
 * Website generation engine.
 *
 * Composes four stages — strategy → sitemap → page architecture → copy — into a
 * complete `GeneratedWebsite`. Like `generate-brief.ts`, this is the single
 * deterministic seam: swap the stage bodies for `claude-opus-4-8` calls that
 * return the same shapes and the editor / preview / revision UI is unchanged.
 */

const TONE_VOICE: Record<string, string> = {
  Professional: "clear, credible, and authoritative",
  Friendly: "warm, conversational, and approachable",
  Bold: "confident, punchy, and energetic",
  Minimal: "spare, precise, and calm",
  Playful: "lively, witty, and human",
  Luxury: "refined, elegant, and aspirational",
};

const FONT_PAIRS: Record<string, { heading: string; body: string }> = {
  Professional: { heading: "Inter", body: "Inter" },
  Friendly: { heading: "Poppins", body: "Inter" },
  Bold: { heading: "Space Grotesk", body: "Inter" },
  Minimal: { heading: "Inter", body: "Inter" },
  Playful: { heading: "Fraunces", body: "Nunito" },
  Luxury: { heading: "Playfair Display", body: "Inter" },
};

// --- Stage 1: strategy ------------------------------------------------------

function buildStrategy(brief: BusinessBrief): WebsiteStrategy {
  const voice = TONE_VOICE[brief.tone] ?? "clear and credible";
  return {
    positioning: `${brief.businessName} is the ${brief.tone.toLowerCase()} ${brief.industry} choice for ${brief.targetAudience}, ${brief.description.replace(/\.$/, "")}.`,
    audienceInsights: `Visitors are ${brief.targetAudience}. They want to quickly understand the value, trust the brand, and take a clear next step. Copy should be ${voice}.`,
    contentStrategy: `Lead with outcomes, not features. Each page opens with a benefit-driven headline, supports it with proof, and ends with a single focused call to action aligned to "${brief.goals[0] ?? "convert visitors"}".`,
    conversionStrategy: brief.goals
      .map((g) => `Optimize for: ${g.toLowerCase()}.`)
      .join(" "),
    keyMessages: [
      `Built for ${brief.targetAudience}`,
      `${brief.tone} ${brief.industry} experience`,
      ...brief.goals.slice(0, 2).map((g) => g),
    ],
  };
}

// --- Stage 2 + 3: sitemap & page architecture -------------------------------

const ARCHITECTURE: Record<string, SectionType[]> = {
  home: ["hero", "valueProps", "features", "stats", "testimonials", "cta"],
  about: ["hero", "about", "stats", "valueProps", "cta"],
  services: ["hero", "features", "valueProps", "testimonials", "cta"],
  pricing: ["hero", "pricing", "faq", "cta"],
  portfolio: ["hero", "features", "testimonials", "cta"],
  blog: ["hero", "features", "cta"],
  contact: ["hero", "contactInfo", "cta"],
  faq: ["hero", "faq", "cta"],
};

function architectureFor(pageName: string): SectionType[] {
  return ARCHITECTURE[pageName.toLowerCase()] ?? ["hero", "valueProps", "cta"];
}

// --- Stage 4: copywriter ----------------------------------------------------

function primaryCta(brief: BusinessBrief): string {
  const byGoal: Record<string, string> = {
    "Generate leads": "Get a free consultation",
    "Sell products": "Shop now",
    "Book appointments": "Book a time",
    "Build brand awareness": "Learn more",
    "Share information": "Explore resources",
    "Grow a community": "Join us",
  };
  return byGoal[brief.goals[0] ?? ""] ?? "Get started";
}

function featureItems(brief: BusinessBrief): SectionItem[] {
  const base: SectionItem[] = [
    {
      title: "Made for your audience",
      description: `Designed around the needs of ${brief.targetAudience}.`,
    },
    {
      title: `${brief.tone} by design`,
      description: `A ${TONE_VOICE[brief.tone] ?? "clear"} experience end to end.`,
    },
    {
      title: "Built to convert",
      description: `Every page guides visitors toward ${(brief.goals[0] ?? "your goal").toLowerCase()}.`,
    },
  ];
  return base;
}

function copyForSection(
  type: SectionType,
  brief: BusinessBrief,
  strategy: WebsiteStrategy,
  page: { name: string; slug: string },
  variant: number,
): Omit<WebsiteSection, "id" | "type"> {
  const cta = primaryCta(brief);
  switch (type) {
    case "hero":
      return {
        heading: page.slug === "home" || page.name.toLowerCase() === "home"
          ? `${brief.businessName}: ${strategy.keyMessages[0]}`
          : page.name,
        subheading: `${brief.description.split(".")[0]}.`,
        ctaLabel: cta,
      };
    case "valueProps":
      return {
        heading: ["Why choose us", "Built different", "What sets us apart"][
          variant % 3
        ],
        items: featureItems(brief),
      };
    case "features":
      return {
        heading: "What you get",
        subheading: `Everything ${brief.targetAudience} need, in one place.`,
        items: [
          ...featureItems(brief),
          {
            title: "Always improving",
            description: "Continuously refined based on real feedback.",
          },
        ],
      };
    case "about":
      return {
        heading: `About ${brief.businessName}`,
        body: `${strategy.positioning} We exist to serve ${brief.targetAudience} with a ${TONE_VOICE[brief.tone] ?? "clear"} approach.`,
      };
    case "stats":
      return {
        heading: "By the numbers",
        items: [
          { title: "98%", description: "satisfaction" },
          { title: "24/7", description: "availability" },
          { title: "10x", description: "faster setup" },
        ],
      };
    case "testimonials":
      return {
        heading: "What people say",
        items: [
          {
            title: "“A genuine game-changer for our team.”",
            description: `A happy ${brief.industry} customer`,
          },
          {
            title: "“Exactly what we needed, beautifully done.”",
            description: `One of ${brief.targetAudience}`,
          },
        ],
      };
    case "pricing":
      return {
        heading: "Simple, honest pricing",
        items: [
          { title: "Starter", meta: "$0", description: "Get going for free." },
          { title: "Pro", meta: "$29/mo", description: "For growing needs." },
          {
            title: "Scale",
            meta: "Custom",
            description: "For larger teams.",
          },
        ],
        ctaLabel: cta,
      };
    case "faq":
      return {
        heading: "Frequently asked questions",
        items: [
          {
            title: `What does ${brief.businessName} do?`,
            description: brief.description,
          },
          {
            title: "Who is it for?",
            description: `${brief.businessName} is built for ${brief.targetAudience}.`,
          },
          {
            title: "How do I get started?",
            description: `Click “${cta}” and you’ll be guided from there.`,
          },
        ],
      };
    case "cta":
      return {
        heading: ["Ready when you are", "Let’s build something", "Get started today"][
          variant % 3
        ],
        subheading: `Take the next step with ${brief.businessName}.`,
        ctaLabel: cta,
      };
    case "contactInfo":
      return {
        heading: "Get in touch",
        body: `Reach out and the ${brief.businessName} team will respond promptly.`,
        items: [
          { title: "Email", description: `hello@${slugify(brief.businessName) || "company"}.com` },
          { title: "Hours", description: "Mon–Fri, 9–5" },
        ],
      };
    case "footer":
      return { heading: brief.businessName };
    default:
      return { heading: page.name };
  }
}

function buildPage(
  brief: BusinessBrief,
  strategy: WebsiteStrategy,
  pageName: string,
  index: number,
): WebsitePage {
  const isHome = index === 0 || pageName.toLowerCase() === "home";
  const slug = isHome ? "home" : slugify(pageName) || `page-${index}`;
  const types = architectureFor(pageName);

  const sections: WebsiteSection[] = types.map((type, i) => ({
    id: `${slug}-${type}-${i}`,
    type,
    ...copyForSection(type, brief, strategy, { name: pageName, slug }, i),
  }));

  return {
    id: slug,
    name: pageName,
    slug,
    isHome,
    purpose: `The ${pageName} page for ${brief.businessName}.`,
    seo: {
      title: isHome ? brief.businessName : `${pageName} · ${brief.businessName}`,
      description: `${brief.description.split(".")[0]}.`,
    },
    sections,
  };
}

/**
 * Copywriter: regenerate the copy for a single section (a variation). Used by
 * the page editor's per-section "Rewrite" action. Same seam as the full
 * generator — swap for a targeted model call returning the same fields.
 */
export function rewriteSectionCopy(
  brief: BusinessBrief,
  strategy: WebsiteStrategy,
  page: { name: string; slug: string },
  type: SectionType,
  variant: number,
): Omit<WebsiteSection, "id" | "type"> {
  return copyForSection(type, brief, strategy, page, variant);
}

function buildWebsiteDeterministic(
  brief: BusinessBrief,
  options?: { now?: Date },
): GeneratedWebsite {
  const strategy = buildStrategy(brief);

  // Ensure Home leads the sitemap.
  const orderedNames = [
    ...brief.pages.filter((p) => p.toLowerCase() === "home"),
    ...brief.pages.filter((p) => p.toLowerCase() !== "home"),
  ];
  const pageNames = orderedNames.length > 0 ? orderedNames : ["Home"];

  const pages = pageNames.map((name, i) => buildPage(brief, strategy, name, i));
  const navigation: NavLink[] = pages.map((p) => ({
    label: p.name,
    slug: p.slug,
  }));

  const fonts = FONT_PAIRS[brief.tone] ?? { heading: "Inter", body: "Inter" };

  return {
    name: brief.businessName,
    strategy,
    navigation,
    pages,
    theme: {
      primaryColor: brief.primaryColor,
      tone: brief.tone,
      headingFont: fonts.heading,
      bodyFont: fonts.body,
    },
    generatedAt: (options?.now ?? new Date()).toISOString(),
  };
}

function isWebsiteShape(value: unknown): value is GeneratedWebsite {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<GeneratedWebsite>;
  return (
    typeof v.name === "string" &&
    typeof v.strategy === "object" &&
    v.strategy !== null &&
    Array.isArray(v.navigation) &&
    Array.isArray(v.pages) &&
    v.pages.length > 0 &&
    v.pages.every((p) => Array.isArray(p?.sections))
  );
}

/**
 * Generate a full website plan. Uses Claude Opus 4.8 when configured (streamed,
 * since the JSON is large), otherwise the deterministic engine. Returns the
 * website plus generation provenance.
 */
export async function generateWebsite(
  brief: BusinessBrief,
  options?: { now?: Date },
): Promise<GenOutcome<GeneratedWebsite>> {
  const generatedAt = (options?.now ?? new Date()).toISOString();
  const fonts = FONT_PAIRS[brief.tone] ?? { heading: "Inter", body: "Inter" };

  const ai = await generateStructured<GeneratedWebsite>({
    stream: true,
    maxTokens: 16000,
    system:
      "You are a senior web strategist and copywriter. Produce a complete multi-page website plan as JSON with this exact shape: " +
      "{ name: string, strategy: { positioning: string, audienceInsights: string, contentStrategy: string, conversionStrategy: string, keyMessages: string[] }, " +
      "navigation: { label: string, slug: string }[], " +
      "pages: { id: string, name: string, slug: string, purpose: string, isHome: boolean, seo: { title: string, description: string }, " +
      "sections: { id: string, type: string, heading: string, subheading?: string, body?: string, items?: { title: string, description?: string, meta?: string }[], ctaLabel?: string }[] }[], " +
      "theme: { primaryColor: string, tone: string, headingFont: string, bodyFont: string } }. " +
      `Each section "type" MUST be one of: ${SECTION_TYPES.join(", ")}. The first page must have isHome true and slug "home". Fill every section with real, specific marketing copy.`,
    prompt: `Design the website for this business brief:\n${JSON.stringify(brief, null, 2)}`,
  });

  if (ai && isWebsiteShape(ai.data)) {
    return {
      data: {
        ...ai.data,
        theme: {
          ...ai.data.theme,
          primaryColor: brief.primaryColor,
          tone: brief.tone,
          headingFont: fonts.heading,
          bodyFont: fonts.body,
        },
        generatedAt,
      },
      meta: {
        provider: "anthropic",
        model: ai.model,
        inputTokens: ai.inputTokens,
        outputTokens: ai.outputTokens,
        status: "success",
      },
    };
  }

  return {
    data: buildWebsiteDeterministic(brief, { now: new Date(generatedAt) }),
    meta: {
      provider: "fallback",
      model: null,
      inputTokens: 0,
      outputTokens: 0,
      status: isAnthropicConfigured() ? "error" : "fallback",
    },
  };
}
