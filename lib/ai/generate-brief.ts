import "server-only";

import { slugify } from "@/lib/utils";
import {
  generateStructured,
  isAnthropicConfigured,
} from "@/lib/ai/anthropic";
import type { GenOutcome } from "@/lib/ai/types";
import type {
  BusinessBrief,
  GeneratedBrief,
  GeneratedPage,
} from "@/types/domain";

/**
 * Website-brief generator.
 *
 * This is a deterministic, dependency-free implementation that synthesizes a
 * structured brief from the business inputs. It is intentionally the single
 * seam where a real LLM call goes: replace the body of `generateBrief` with an
 * Anthropic call (model `claude-opus-4-8`) that returns the same
 * `GeneratedBrief` shape, and every caller keeps working unchanged.
 *
 *   import Anthropic from "@anthropic-ai/sdk";
 *   const anthropic = new Anthropic({ apiKey: serverEnv().ANTHROPIC_API_KEY });
 *   const msg = await anthropic.messages.create({ model: "claude-opus-4-8", ... });
 *
 * Until an API key is provisioned, this local generator keeps the full
 * workflow (wizard → generate → versions) functional end to end.
 */

const SECTION_LIBRARY: Record<string, string[]> = {
  home: ["Hero", "Value proposition", "Social proof", "Features", "Call to action"],
  about: ["Story", "Mission", "Team", "Values"],
  services: ["Service overview", "Process", "Pricing teaser", "FAQ"],
  pricing: ["Plan comparison", "Feature matrix", "FAQ", "Call to action"],
  portfolio: ["Case study grid", "Highlighted project", "Results", "Testimonials"],
  blog: ["Featured post", "Recent posts", "Categories", "Newsletter signup"],
  contact: ["Contact form", "Map / location", "Support details"],
  faq: ["Common questions", "Search", "Contact prompt"],
};

const DEFAULT_SECTIONS = ["Intro", "Body content", "Call to action"];

function sectionsFor(pageName: string): string[] {
  return SECTION_LIBRARY[pageName.toLowerCase()] ?? DEFAULT_SECTIONS;
}

function purposeFor(pageName: string, brief: BusinessBrief): string {
  const name = pageName.toLowerCase();
  switch (name) {
    case "home":
      return `Introduce ${brief.businessName} and convert ${brief.targetAudience} with a clear primary action.`;
    case "about":
      return `Build trust by telling the ${brief.businessName} story and mission.`;
    case "services":
      return `Explain what ${brief.businessName} offers and how it helps ${brief.targetAudience}.`;
    case "pricing":
      return `Present plans transparently and drive sign-ups.`;
    case "contact":
      return `Make it effortless for ${brief.targetAudience} to reach ${brief.businessName}.`;
    default:
      return `Support the visitor journey for ${brief.businessName}.`;
  }
}

function keywordsFor(brief: BusinessBrief): string[] {
  const base = [
    brief.businessName,
    brief.industry,
    ...brief.targetAudience.split(/\s+/).slice(0, 3),
  ];
  const seeds = [
    `${brief.industry} for ${brief.targetAudience}`.trim(),
    `best ${brief.industry.toLowerCase()} solution`,
    `${brief.businessName} reviews`,
  ];
  return Array.from(new Set([...base, ...seeds].map((k) => k.trim())))
    .filter(Boolean)
    .slice(0, 8);
}

function ctasFor(brief: BusinessBrief): string[] {
  const byGoal: Record<string, string> = {
    "Generate leads": "Request a free consultation",
    "Sell products": "Shop the collection",
    "Book appointments": "Book your appointment",
    "Build brand awareness": "Discover our story",
    "Share information": "Explore resources",
    "Grow a community": "Join the community",
  };
  const ctas = brief.goals.map((g) => byGoal[g]).filter(Boolean);
  return ctas.length > 0 ? ctas : ["Get started today"];
}

/**
 * Produce a structured brief. Async + a small artificial delay so the UI's
 * generating state is observable and the signature matches a real API call.
 */
function buildBriefDeterministic(
  brief: BusinessBrief,
  options?: { now?: Date },
): GeneratedBrief {
  const sitemap: GeneratedPage[] = brief.pages.map((name) => ({
    name,
    slug: slugify(name) || "page",
    purpose: purposeFor(name, brief),
    sections: sectionsFor(name),
  }));

  const generatedAt = (options?.now ?? new Date()).toISOString();

  return {
    title: `${brief.businessName} — Website Brief`,
    summary: `A ${brief.tone.toLowerCase()} ${brief.industry} website for ${brief.businessName}, designed to ${brief.goals
      .map((g) => g.toLowerCase())
      .join(", ")} for ${brief.targetAudience}.`,
    valueProposition: `${brief.businessName} helps ${brief.targetAudience} by ${brief.description.replace(/\.$/, "")}.`,
    targetAudience: brief.targetAudience,
    toneGuidelines: `Maintain a ${brief.tone.toLowerCase()} voice throughout. Keep copy concise, benefit-led, and consistent with the ${brief.industry} space.`,
    sitemap,
    callsToAction: ctasFor(brief),
    seoKeywords: keywordsFor(brief),
    designDirection: {
      primaryColor: brief.primaryColor,
      mood: `${brief.tone} and modern`,
      typography:
        brief.tone === "Luxury" || brief.tone === "Minimal"
          ? "Elegant serif headings with a clean sans-serif body"
          : "Geometric sans-serif throughout for a contemporary feel",
    },
    generatedAt,
    briefSnapshot: brief,
  };
}

function isBriefShape(value: unknown): value is GeneratedBrief {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<GeneratedBrief>;
  return (
    typeof v.title === "string" &&
    typeof v.summary === "string" &&
    Array.isArray(v.sitemap) &&
    Array.isArray(v.callsToAction) &&
    Array.isArray(v.seoKeywords)
  );
}

/**
 * Generate a website brief. Uses Claude Opus 4.8 when configured, otherwise the
 * deterministic engine. Returns the brief plus generation provenance.
 */
export async function generateBrief(
  brief: BusinessBrief,
  options?: { now?: Date },
): Promise<GenOutcome<GeneratedBrief>> {
  const generatedAt = (options?.now ?? new Date()).toISOString();

  const ai = await generateStructured<GeneratedBrief>({
    maxTokens: 4000,
    system:
      "You are a senior brand strategist. Produce a structured website brief as JSON with this exact shape: " +
      '{ title: string, summary: string, valueProposition: string, targetAudience: string, ' +
      "toneGuidelines: string, sitemap: { name: string, slug: string, purpose: string, sections: string[] }[], " +
      "callsToAction: string[], seoKeywords: string[], designDirection: { primaryColor: string, mood: string, typography: string } }.",
    prompt: `Create the website brief for this business:\n${JSON.stringify(brief, null, 2)}`,
  });

  if (ai && isBriefShape(ai.data)) {
    return {
      data: {
        ...ai.data,
        designDirection: {
          ...ai.data.designDirection,
          primaryColor: brief.primaryColor,
        },
        generatedAt,
        briefSnapshot: brief,
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
    data: buildBriefDeterministic(brief, { now: new Date(generatedAt) }),
    meta: {
      provider: "fallback",
      model: null,
      inputTokens: 0,
      outputTokens: 0,
      status: isAnthropicConfigured() ? "error" : "fallback",
    },
  };
}
