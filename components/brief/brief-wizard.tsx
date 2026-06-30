"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Save } from "lucide-react";

import {
  generateAction,
  saveBriefAction,
} from "@/app/(dashboard)/projects/brief-actions";
import { briefStepSchemas } from "@/lib/validations/brief";
import {
  GOALS,
  INDUSTRIES,
  PAGE_PRESETS,
  TONES,
  type BusinessBrief,
} from "@/types/domain";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ToggleChip } from "@/components/ui/toggle-chip";
import { FieldError, FormError } from "@/components/auth/form-feedback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

const STEPS = [
  { key: "basics", title: "Business basics" },
  { key: "audience", title: "Audience & goals" },
  { key: "design", title: "Design & pages" },
  { key: "review", title: "Review" },
] as const;

type FieldErrors = Record<string, string[]>;

interface BriefWizardProps {
  projectId: string;
  initialBrief: BusinessBrief;
  onSaved?: () => void;
  onGenerated?: () => void;
}

export function BriefWizard({
  projectId,
  initialBrief,
  onSaved,
  onGenerated,
}: BriefWizardProps) {
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<BusinessBrief>(initialBrief);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [customPage, setCustomPage] = useState("");
  const [isPending, startTransition] = useTransition();

  const progress = useMemo(
    () => Math.round(((step + 1) / STEPS.length) * 100),
    [step],
  );

  function update<K extends keyof BusinessBrief>(
    key: K,
    value: BusinessBrief[K],
  ) {
    setBrief((prev) => ({ ...prev, [key]: value }));
  }

  function toggleInArray(key: "goals" | "pages", value: string) {
    setBrief((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }

  function validateStep(index: number): boolean {
    const key = STEPS[index].key;
    if (key === "review") return true;
    const schema = briefStepSchemas[key];
    const result = schema.safeParse(brief);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors as FieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  function persist(thenGenerate: boolean) {
    setFormError(undefined);
    startTransition(async () => {
      const saved = await saveBriefAction(projectId, brief);
      if (!saved.ok) {
        setFormError(saved.error ?? "Could not save the brief.");
        if (saved.fieldErrors) setErrors(saved.fieldErrors);
        return;
      }
      toast.success("Brief saved");
      onSaved?.();

      if (thenGenerate) {
        const generated = await generateAction(projectId);
        if (!generated.ok) {
          setFormError(generated.error ?? "Generation failed.");
          return;
        }
        toast.success("Website brief generated");
        onGenerated?.();
      }
    });
  }

  const stepKey = STEPS[step].key;
  const addCustomPage = () => {
    const value = customPage.trim();
    if (value && !brief.pages.includes(value)) {
      update("pages", [...brief.pages, value]);
    }
    setCustomPage("");
  };

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between">
          <CardTitle>{STEPS[step].title}</CardTitle>
          <span className="text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={progress} aria-label="Wizard progress" />
      </CardHeader>

      <CardContent className="space-y-6">
        <FormError message={formError} />

        {stepKey === "basics" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                value={brief.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                placeholder="Acme Studio"
                aria-invalid={Boolean(errors.businessName)}
              />
              <FieldError messages={errors.businessName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={brief.industry}
                onValueChange={(v) =>
                  update("industry", v as BusinessBrief["industry"])
                }
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">What does the business do?</Label>
              <Textarea
                id="description"
                value={brief.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe your product, service, and what makes it different."
                className="min-h-28"
                aria-invalid={Boolean(errors.description)}
              />
              <FieldError messages={errors.description} />
            </div>
          </div>
        )}

        {stepKey === "audience" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target audience</Label>
              <Textarea
                id="targetAudience"
                value={brief.targetAudience}
                onChange={(e) => update("targetAudience", e.target.value)}
                placeholder="Who are you trying to reach? e.g. early-stage founders."
                aria-invalid={Boolean(errors.targetAudience)}
              />
              <FieldError messages={errors.targetAudience} />
            </div>
            <div className="space-y-2">
              <Label>Primary goals</Label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((goal) => (
                  <ToggleChip
                    key={goal}
                    label={goal}
                    selected={brief.goals.includes(goal)}
                    onToggle={() => toggleInArray("goals", goal)}
                  />
                ))}
              </div>
              <FieldError messages={errors.goals} />
            </div>
          </div>
        )}

        {stepKey === "design" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tone">Brand tone</Label>
                <Select
                  value={brief.tone}
                  onValueChange={(v) =>
                    update("tone", v as BusinessBrief["tone"])
                  }
                >
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary color</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="primaryColor"
                    type="color"
                    value={brief.primaryColor}
                    onChange={(e) => update("primaryColor", e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent"
                    aria-label="Primary color"
                  />
                  <Input
                    value={brief.primaryColor}
                    onChange={(e) => update("primaryColor", e.target.value)}
                    aria-invalid={Boolean(errors.primaryColor)}
                  />
                </div>
                <FieldError messages={errors.primaryColor} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pages</Label>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set([...PAGE_PRESETS, ...brief.pages])).map(
                  (page) => (
                    <ToggleChip
                      key={page}
                      label={page}
                      selected={brief.pages.includes(page)}
                      onToggle={() => toggleInArray("pages", page)}
                    />
                  ),
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={customPage}
                  onChange={(e) => setCustomPage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomPage();
                    }
                  }}
                  placeholder="Add a custom page"
                />
                <Button type="button" variant="outline" onClick={addCustomPage}>
                  Add
                </Button>
              </div>
              <FieldError messages={errors.pages} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitors">Competitors (optional)</Label>
              <Textarea
                id="competitors"
                value={brief.competitors ?? ""}
                onChange={(e) => update("competitors", e.target.value)}
                placeholder="List a few competitor websites or brands."
                aria-invalid={Boolean(errors.competitors)}
              />
              <FieldError messages={errors.competitors} />
            </div>
          </div>
        )}

        {stepKey === "review" && (
          <dl className="divide-y divide-border rounded-lg border border-border">
            {[
              ["Business", brief.businessName],
              ["Industry", brief.industry],
              ["Audience", brief.targetAudience],
              ["Goals", brief.goals.join(", ") || "—"],
              ["Tone", brief.tone],
              ["Pages", brief.pages.join(", ") || "—"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4"
              >
                <dt className="w-32 shrink-0 text-sm font-medium text-muted-foreground">
                  {label}
                </dt>
                <dd className="text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>

      <div className="flex flex-col-reverse gap-3 border-t border-border p-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          disabled={step === 0 || isPending}
          className={cn(step === 0 && "invisible")}
        >
          <ArrowLeft />
          Back
        </Button>

        {stepKey !== "review" ? (
          <Button type="button" onClick={next} disabled={isPending}>
            Continue
            <ArrowRight />
          </Button>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => persist(false)}
              disabled={isPending}
            >
              <Save />
              Save brief
            </Button>
            <Button
              type="button"
              onClick={() => persist(true)}
              disabled={isPending}
            >
              <Sparkles />
              {isPending ? "Working…" : "Save & generate"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
