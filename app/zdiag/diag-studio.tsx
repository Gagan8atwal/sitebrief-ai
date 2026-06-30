"use client";

import { Component, type ReactNode } from "react";

import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { sanitizeWebsite } from "@/lib/website-sanitize";
import type { Project } from "@/types/database";
import type { BusinessBrief } from "@/types/domain";
import type { GeneratedWebsite } from "@/types/website";
import type { GenerationVersion } from "@/lib/services/generation";
import type { WebsiteVersion } from "@/lib/services/website";

const WEBSITE_RAW = {
  name: "Fresno Elite Plumbing",
  pages: [
    { id: "home", seo: { title: "t", description: "d" }, name: "Home", slug: "home", isHome: true, purpose: "p",
      sections: [
        { id: "home-hero", type: "hero", heading: "h", body: "b", ctaLabel: "c", subheading: "s" },
        { id: "home-stats", type: "stats", heading: "h", items: [{ title: "5,000+", description: "d" }] },
      ] },
    { id: "contact", seo: { title: "t", description: "d" }, name: "Contact", slug: "contact", isHome: false, purpose: "p",
      sections: [{ id: "c-info", type: "contactInfo", heading: "h", items: [{ title: "Phone", description: "x" }] }] },
  ],
  theme: { tone: "Professional", bodyFont: "Inter", headingFont: "Inter", primaryColor: "#0F52BA" },
  strategy: { keyMessages: ["a", "b"], positioning: "p", contentStrategy: "c", audienceInsights: "a", conversionStrategy: "cv" },
  navigation: [{ slug: "home", label: "Home" }, { slug: "contact", label: "Contact" }],
  generatedAt: "2026-06-30T20:33:18.620Z",
};

const brief: BusinessBrief = {
  businessName: "Fresno Elite Plumbing",
  industry: "Other",
  description: "Plumbing services in Fresno with 24/7 emergency response.",
  targetAudience: "Homeowners and businesses in Fresno",
  goals: ["Generate leads", "Book appointments"],
  tone: "Professional",
  primaryColor: "#0F52BA",
  pages: ["Home", "Services", "About", "FAQ", "Contact"],
  competitors: "",
};

const generatedBrief = {
  title: "Fresno Elite Plumbing — Website Brief",
  summary: "A professional plumbing website.",
  valueProposition: "Fast, reliable plumbing.",
  targetAudience: "Homeowners in Fresno",
  toneGuidelines: "Professional and trustworthy.",
  sitemap: [
    { name: "Home", slug: "home", purpose: "Convert", sections: ["Hero", "CTA"] },
    { name: "Contact", slug: "contact", purpose: "Contact", sections: ["Form"] },
  ],
  callsToAction: ["Call Now", "Book Online"],
  seoKeywords: ["plumber fresno", "emergency plumbing"],
  designDirection: { primaryColor: "#0F52BA", mood: "Professional and modern", typography: "Geometric sans-serif" },
  generatedAt: "2026-06-30T20:30:00.000Z",
  briefSnapshot: brief,
};

const project: Project = {
  id: "00000000-0000-0000-0000-000000000000",
  owner_id: "00000000-0000-0000-0000-000000000001",
  name: "Fresno Elite Plumbing",
  slug: "fresno-elite-plumbing",
  description: null,
  status: "active",
  brief: brief as unknown as Project["brief"],
  website: WEBSITE_RAW as unknown as Project["website"],
  last_generated_at: "2026-06-30T20:33:18.620Z",
  created_at: "2026-06-30T20:00:00.000Z",
  updated_at: "2026-06-30T20:33:18.620Z",
};

class Boundary extends Component<{ children: ReactNode }, { msg: string | null }> {
  state = { msg: null as string | null };
  static getDerivedStateFromError(e: Error) {
    return { msg: `${e?.name}: ${e?.message}\n${(e?.stack ?? "").split("\n").slice(0, 6).join("\n")}` };
  }
  render() {
    if (this.state.msg) return <pre data-diag-error>{this.state.msg}</pre>;
    return this.props.children;
  }
}

export function DiagStudio() {
  const website = sanitizeWebsite(WEBSITE_RAW) as GeneratedWebsite;
  const versions: GenerationVersion[] = [
    { id: "g1", project_id: project.id, version: 1, content: generatedBrief as unknown as GenerationVersion["content"], created_by: "u", created_at: "2026-06-30T20:30:00.000Z" },
  ];
  const websiteVersions: WebsiteVersion[] = [
    { id: "v1", project_id: project.id, version: 1, label: "Generated", content: website, created_by: "u", created_at: "2026-06-30T20:33:18.620Z" },
  ];

  return (
    <Boundary>
      <ProjectWorkspace
        project={project}
        initialBrief={brief}
        briefComplete={true}
        versions={versions}
        website={website}
        websiteVersions={websiteVersions}
      />
    </Boundary>
  );
}
