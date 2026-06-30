"use client";

import { useActionState, useEffect, useTransition } from "react";

import {
  archiveProjectAction,
  deleteProjectAction,
  updateProjectAction,
  type ProjectFormState,
} from "@/app/(dashboard)/projects/actions";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError, FormError } from "@/components/auth/form-feedback";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Project } from "@/types/database";

const initialState: ProjectFormState = {};

export function ProjectSettings({ project }: { project: Project }) {
  const updateWithId = updateProjectAction.bind(null, project.id);
  const [state, formAction] = useActionState(updateWithId, initialState);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success("Project updated");
  }, [state]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Update your project details.</CardDescription>
        </CardHeader>
        <form action={formAction} noValidate>
          <CardContent className="space-y-4">
            <FormError message={state.error} />
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={project.name}
                aria-invalid={Boolean(state.fieldErrors?.name)}
                required
              />
              <FieldError messages={state.fieldErrors?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={project.description ?? ""}
                aria-invalid={Boolean(state.fieldErrors?.description)}
              />
              <FieldError messages={state.fieldErrors?.description} />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
          </CardFooter>
        </form>
      </Card>

      <DangerZone project={project} />
    </div>
  );
}

function DangerZone({ project }: { project: Project }) {
  const [isPending, startTransition] = useTransition();

  const onArchive = () => {
    startTransition(async () => {
      await archiveProjectAction(project.id);
      toast.success("Project archived");
    });
  };

  const onDelete = () => {
    startTransition(async () => {
      await deleteProjectAction(project.id);
    });
  };

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
        <CardDescription>
          Archiving hides a project from active lists. Deleting is permanent.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-wrap justify-end gap-3">
        {project.status !== "archived" ? (
          <Button
            type="button"
            variant="outline"
            onClick={onArchive}
            disabled={isPending}
          >
            Archive
          </Button>
        ) : null}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={isPending}>
              Delete project
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{project.name}”?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes the project, its brief, and all
                generated versions. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>
                Delete project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
