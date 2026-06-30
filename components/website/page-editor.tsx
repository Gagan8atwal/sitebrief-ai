"use client";

import { useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  rewriteSectionAction,
  saveWebsiteAction,
} from "@/app/(dashboard)/projects/website-actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import {
  SECTION_TYPES,
  SECTION_TYPE_LABELS,
  type GeneratedWebsite,
  type SectionItem,
  type SectionType,
  type WebsiteSection,
} from "@/types/website";

const HAS_ITEMS: SectionType[] = [
  "valueProps",
  "features",
  "stats",
  "testimonials",
  "pricing",
  "faq",
  "contactInfo",
];
const HAS_META: SectionType[] = ["pricing", "stats"];
const HAS_CTA: SectionType[] = ["hero", "cta", "pricing"];
const HAS_BODY: SectionType[] = ["about", "contactInfo"];

function defaultSection(type: SectionType): WebsiteSection {
  const id = globalThis.crypto.randomUUID();
  const base: WebsiteSection = { id, type, heading: SECTION_TYPE_LABELS[type] };
  if (HAS_ITEMS.includes(type)) {
    base.items = [{ title: "New item", description: "" }];
  }
  if (HAS_CTA.includes(type)) base.ctaLabel = "Get started";
  if (HAS_BODY.includes(type)) base.body = "";
  return base;
}

interface PageEditorProps {
  projectId: string;
  website: GeneratedWebsite;
  onSaved?: () => void;
}

export function PageEditor({ projectId, website, onSaved }: PageEditorProps) {
  const [draft, setDraft] = useState<GeneratedWebsite>(website);
  const [activePageId, setActivePageId] = useState(website.pages[0]?.id ?? "");
  const [dirty, setDirty] = useState(false);
  const [newType, setNewType] = useState<SectionType>("features");
  const [isSaving, startSave] = useTransition();
  const [rewriting, setRewriting] = useState<string | null>(null);

  const page =
    draft.pages.find((p) => p.id === activePageId) ?? draft.pages[0];

  function mutatePage(
    pageId: string,
    fn: (p: GeneratedWebsite["pages"][number]) => GeneratedWebsite["pages"][number],
  ) {
    setDraft((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.id === pageId ? fn(p) : p)),
    }));
    setDirty(true);
  }

  function updateSection(
    sectionId: string,
    patch: Partial<WebsiteSection>,
  ) {
    if (!page) return;
    mutatePage(page.id, (p) => ({
      ...p,
      sections: p.sections.map((s) =>
        s.id === sectionId ? { ...s, ...patch } : s,
      ),
    }));
  }

  function updateItem(
    sectionId: string,
    index: number,
    patch: Partial<SectionItem>,
  ) {
    if (!page) return;
    mutatePage(page.id, (p) => ({
      ...p,
      sections: p.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: (s.items ?? []).map((it, i) =>
                i === index ? { ...it, ...patch } : it,
              ),
            }
          : s,
      ),
    }));
  }

  function addItem(sectionId: string) {
    if (!page) return;
    mutatePage(page.id, (p) => ({
      ...p,
      sections: p.sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: [...(s.items ?? []), { title: "New item" }] }
          : s,
      ),
    }));
  }

  function removeItem(sectionId: string, index: number) {
    if (!page) return;
    mutatePage(page.id, (p) => ({
      ...p,
      sections: p.sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: (s.items ?? []).filter((_, i) => i !== index) }
          : s,
      ),
    }));
  }

  function moveSection(sectionId: string, dir: -1 | 1) {
    if (!page) return;
    const idx = page.sections.findIndex((s) => s.id === sectionId);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= page.sections.length) return;
    const sections = [...page.sections];
    [sections[idx], sections[next]] = [sections[next], sections[idx]];
    mutatePage(page.id, (p) => ({ ...p, sections }));
  }

  function removeSection(sectionId: string) {
    if (!page) return;
    mutatePage(page.id, (p) => ({
      ...p,
      sections: p.sections.filter((s) => s.id !== sectionId),
    }));
  }

  function addSection() {
    if (!page) return;
    mutatePage(page.id, (p) => ({
      ...p,
      sections: [...p.sections, defaultSection(newType)],
    }));
  }

  function rewrite(section: WebsiteSection) {
    if (!page) return;
    setRewriting(section.id);
    rewriteSectionAction(
      projectId,
      page.id,
      section.id,
      Math.floor(Math.random() * 3) + 1,
    )
      .then((result) => {
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        updateSection(section.id, result.copy);
        toast.success("Copy rewritten");
      })
      .finally(() => setRewriting(null));
  }

  function save() {
    startSave(async () => {
      const result = await saveWebsiteAction(projectId, draft);
      if (!result.ok) {
        toast.error(result.error ?? "Could not save.");
        return;
      }
      setDirty(false);
      toast.success("Website saved");
      onSaved?.();
    });
  }

  if (!page) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {draft.pages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePageId(p.id)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                p.id === page.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
        <Button onClick={save} disabled={!dirty || isSaving}>
          <Save />
          {isSaving ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </Button>
      </div>

      <div className="space-y-4">
        {page.sections.map((section, index) => (
          <Card key={section.id}>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 pb-3">
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                {SECTION_TYPE_LABELS[section.type]}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => rewrite(section)}
                  disabled={rewriting === section.id}
                  title="Rewrite copy with AI"
                  aria-label="Rewrite copy with AI"
                >
                  <Sparkles
                    className={cn(rewriting === section.id && "animate-pulse")}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveSection(section.id, -1)}
                  disabled={index === 0}
                  title="Move up"
                  aria-label="Move section up"
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveSection(section.id, 1)}
                  disabled={index === page.sections.length - 1}
                  title="Move down"
                  aria-label="Move section down"
                >
                  <ArrowDown />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSection(section.id)}
                  title="Delete section"
                  aria-label="Delete section"
                >
                  <Trash2 />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor={`${section.id}-heading`}>Heading</Label>
                <Input
                  id={`${section.id}-heading`}
                  value={section.heading}
                  onChange={(e) =>
                    updateSection(section.id, { heading: e.target.value })
                  }
                />
              </div>

              {(section.subheading !== undefined ||
                section.type === "hero" ||
                section.type === "features") && (
                <div className="space-y-1.5">
                  <Label htmlFor={`${section.id}-sub`}>Subheading</Label>
                  <Input
                    id={`${section.id}-sub`}
                    value={section.subheading ?? ""}
                    onChange={(e) =>
                      updateSection(section.id, { subheading: e.target.value })
                    }
                  />
                </div>
              )}

              {HAS_BODY.includes(section.type) && (
                <div className="space-y-1.5">
                  <Label htmlFor={`${section.id}-body`}>Body</Label>
                  <Textarea
                    id={`${section.id}-body`}
                    value={section.body ?? ""}
                    onChange={(e) =>
                      updateSection(section.id, { body: e.target.value })
                    }
                  />
                </div>
              )}

              {HAS_CTA.includes(section.type) && (
                <div className="space-y-1.5">
                  <Label htmlFor={`${section.id}-cta`}>Button label</Label>
                  <Input
                    id={`${section.id}-cta`}
                    value={section.ctaLabel ?? ""}
                    onChange={(e) =>
                      updateSection(section.id, { ctaLabel: e.target.value })
                    }
                  />
                </div>
              )}

              {HAS_ITEMS.includes(section.type) && (
                <div className="space-y-2">
                  <Label>Items</Label>
                  {(section.items ?? []).map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-start gap-2 rounded-md border border-border p-2"
                    >
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          updateItem(section.id, i, { title: e.target.value })
                        }
                        placeholder="Title"
                        className="min-w-40 flex-1"
                      />
                      {HAS_META.includes(section.type) && (
                        <Input
                          value={item.meta ?? ""}
                          onChange={(e) =>
                            updateItem(section.id, i, { meta: e.target.value })
                          }
                          placeholder="Value"
                          className="w-24"
                        />
                      )}
                      <Input
                        value={item.description ?? ""}
                        onChange={(e) =>
                          updateItem(section.id, i, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Description"
                        className="min-w-40 flex-[2]"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(section.id, i)}
                        aria-label="Remove item"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItem(section.id)}
                  >
                    <Plus />
                    Add item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
          <Label className="shrink-0">Add a section</Label>
          <Select
            value={newType}
            onValueChange={(v) => setNewType(v as SectionType)}
          >
            <SelectTrigger className="sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {SECTION_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={addSection}>
            <Plus />
            Add section
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
