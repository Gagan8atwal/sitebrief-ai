import { FileText, Megaphone, Palette, Search, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedBrief } from "@/types/domain";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof FileText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </div>
  );
}

/** Renders a generated website brief in a structured, readable layout. */
export function BriefOutput({ brief }: { brief: GeneratedBrief }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {brief.title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {brief.summary}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section icon={Megaphone} title="Value proposition">
          <p className="text-sm text-muted-foreground">
            {brief.valueProposition}
          </p>
        </Section>
        <Section icon={Users} title="Target audience">
          <p className="text-sm text-muted-foreground">
            {brief.targetAudience}
          </p>
        </Section>
      </div>

      <Section icon={FileText} title="Sitemap">
        <div className="grid gap-3 sm:grid-cols-2">
          {(brief.sitemap ?? []).map((page) => (
            <Card key={page.slug}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">{page.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{page.purpose}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ul className="flex flex-wrap gap-1.5">
                  {(page.sections ?? []).map((section) => (
                    <li key={section}>
                      <Badge variant="secondary">{section}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section icon={Megaphone} title="Calls to action">
          <ul className="flex flex-wrap gap-1.5">
            {(brief.callsToAction ?? []).map((cta) => (
              <li key={cta}>
                <Badge>{cta}</Badge>
              </li>
            ))}
          </ul>
        </Section>
        <Section icon={Search} title="SEO keywords">
          <ul className="flex flex-wrap gap-1.5">
            {(brief.seoKeywords ?? []).map((kw) => (
              <li key={kw}>
                <Badge variant="outline">{kw}</Badge>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section icon={Palette} title="Design direction">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span
              className="h-4 w-4 rounded-full border border-border"
              style={{ backgroundColor: brief.designDirection?.primaryColor }}
              aria-hidden="true"
            />
            {brief.designDirection?.primaryColor}
          </span>
          <span>{brief.designDirection?.mood}</span>
          <span>{brief.designDirection?.typography}</span>
        </div>
      </Section>
    </div>
  );
}
