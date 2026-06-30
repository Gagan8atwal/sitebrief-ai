"use client";

import { useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WebsiteCanvas } from "@/components/website/website-canvas";
import type { GeneratedWebsite } from "@/types/website";

const DEVICES = {
  desktop: { label: "Desktop", width: "100%", icon: Monitor },
  tablet: { label: "Tablet", width: "768px", icon: Tablet },
  mobile: { label: "Mobile", width: "390px", icon: Smartphone },
} as const;

type Device = keyof typeof DEVICES;

export function WebsitePreview({ website }: { website: GeneratedWebsite }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [pageId, setPageId] = useState(website.pages[0]?.id ?? "");

  const page =
    website.pages.find((p) => p.id === pageId) ?? website.pages[0];

  if (!page) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={page.id} onValueChange={setPageId}>
          <SelectTrigger className="sm:w-56" aria-label="Preview page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {website.pages.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          className="inline-flex items-center gap-1 rounded-lg border border-border p-1"
          role="group"
          aria-label="Preview device"
        >
          {(Object.keys(DEVICES) as Device[]).map((key) => {
            const Icon = DEVICES[key].icon;
            const active = device === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDevice(key)}
                aria-pressed={active}
                title={DEVICES[key].label}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{DEVICES[key].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center overflow-hidden rounded-xl border border-border bg-muted/30 p-4">
        <div
          className="h-[640px] overflow-y-auto rounded-lg border border-border bg-white shadow-sm transition-[width] duration-300"
          style={{ width: DEVICES[device].width, maxWidth: "100%" }}
        >
          <WebsiteCanvas website={website} page={page} />
        </div>
      </div>
    </div>
  );
}
