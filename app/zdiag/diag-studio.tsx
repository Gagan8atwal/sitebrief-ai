"use client";

import { Component, type ReactNode } from "react";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { WebsiteStudio } from "@/components/website/website-studio";
import { sanitizeWebsite } from "@/lib/website-sanitize";
import type { GeneratedWebsite } from "@/types/website";
import type { WebsiteVersion } from "@/lib/services/website";

const RAW = {
  name: "Fresno Elite Plumbing",
  pages: [
    {
      id: "home",
      seo: { title: "t", description: "d" },
      name: "Home",
      slug: "home",
      isHome: true,
      purpose: "p",
      sections: [
        { id: "home-hero", type: "hero", heading: "h", body: "b", ctaLabel: "c", subheading: "s" },
        { id: "home-stats", type: "stats", heading: "h", items: [{ title: "5,000+", description: "d" }] },
        { id: "home-features", type: "features", heading: "h", subheading: "s", items: [{ title: "t", description: "d" }] },
      ],
    },
    {
      id: "contact",
      seo: { title: "t", description: "d" },
      name: "Contact",
      slug: "contact",
      isHome: false,
      purpose: "p",
      sections: [{ id: "c-info", type: "contactInfo", heading: "h", items: [{ title: "Phone", description: "x" }] }],
    },
  ],
  theme: { tone: "Professional", bodyFont: "Inter", headingFont: "Inter", primaryColor: "#0F52BA" },
  strategy: { keyMessages: ["a", "b"], positioning: "p", contentStrategy: "c", audienceInsights: "a", conversionStrategy: "cv" },
  navigation: [{ slug: "home", label: "Home" }, { slug: "contact", label: "Contact" }],
  generatedAt: "2026-06-30T20:33:18.620Z",
};

class Boundary extends Component<{ children: ReactNode }, { msg: string | null }> {
  state = { msg: null as string | null };
  static getDerivedStateFromError(e: Error) {
    return { msg: `${e?.name}: ${e?.message}` };
  }
  render() {
    if (this.state.msg) {
      return <pre data-diag-error>{this.state.msg}</pre>;
    }
    return this.props.children;
  }
}

export function DiagStudio() {
  const website = sanitizeWebsite(RAW) as GeneratedWebsite;
  const versions: WebsiteVersion[] = [
    {
      id: "v1",
      project_id: "p",
      version: 1,
      label: "Generated",
      content: website,
      created_by: "u",
      created_at: "2026-06-30T20:33:18.620Z",
    },
  ];

  // Reproduce production exactly: WebsiteStudio's Tabs nested inside an outer Tabs.
  return (
    <Boundary>
      <Tabs value="website" onValueChange={() => {}} className="w-full">
        <TabsContent value="website">
          <WebsiteStudio
            projectId="00000000-0000-0000-0000-000000000000"
            briefComplete={true}
            website={website}
            versions={versions}
          />
        </TabsContent>
      </Tabs>
    </Boundary>
  );
}
