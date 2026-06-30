import { Compass, MessageSquare, Target, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WebsiteStrategy } from "@/types/website";

export function StrategyPanel({ strategy }: { strategy: WebsiteStrategy }) {
  const blocks = [
    { icon: Compass, title: "Positioning", body: strategy.positioning },
    { icon: Users, title: "Audience insights", body: strategy.audienceInsights },
    { icon: Target, title: "Content strategy", body: strategy.contentStrategy },
    {
      icon: MessageSquare,
      title: "Conversion strategy",
      body: strategy.conversionStrategy,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {blocks.map((block) => {
          const Icon = block.icon;
          return (
            <Card key={block.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  {block.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {block.body}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Key messages</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-2">
            {strategy.keyMessages.map((message, i) => (
              <li key={i}>
                <Badge variant="secondary">{message}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
