import { FileText, Home } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SECTION_TYPE_LABELS } from "@/types/website";
import type { GeneratedWebsite } from "@/types/website";

export function SitemapPanel({ website }: { website: GeneratedWebsite }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {website.pages.length}{" "}
        {website.pages.length === 1 ? "page" : "pages"} · navigation order
        reflects the live site.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {website.pages.map((page) => (
          <Card key={page.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                {page.isHome ? (
                  <Home className="h-4 w-4 text-primary" aria-hidden="true" />
                ) : (
                  <FileText
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                {page.name}
                <span className="font-mono text-xs font-normal text-muted-foreground">
                  /{page.slug === "home" ? "" : page.slug}
                </span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">{page.purpose}</p>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-wrap gap-1.5">
                {(page.sections ?? []).map((section) => (
                  <li key={section.id}>
                    <Badge variant="outline">
                      {SECTION_TYPE_LABELS[section.type] ?? section.type}
                    </Badge>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
