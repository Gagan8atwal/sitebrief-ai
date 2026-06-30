"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import {
  createProjectAction,
  type ProjectFormState,
} from "@/app/(dashboard)/projects/actions";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError, FormError } from "@/components/auth/form-feedback";

const initialState: ProjectFormState = {};

export function ProjectForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(
    createProjectAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project details</CardTitle>
      </CardHeader>
      <form action={formAction} noValidate>
        <CardContent className="space-y-4">
          <FormError message={state.error} />

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Acme marketing site"
              aria-invalid={Boolean(state.fieldErrors?.name)}
              required
            />
            <FieldError messages={state.fieldErrors?.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What is this project about?"
              aria-invalid={Boolean(state.fieldErrors?.description)}
            />
            <FieldError messages={state.fieldErrors?.description} />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <SubmitButton pendingText="Creating…">Create project</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
