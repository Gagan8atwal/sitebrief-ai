"use client";

import { useActionState, useEffect } from "react";

import {
  updateProfileAction,
  type ProfileFormState,
} from "@/app/(dashboard)/settings/actions";
import { SubmitButton } from "@/components/submit-button";
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
import { FieldError, FormError } from "@/components/auth/form-feedback";
import { toast } from "@/components/ui/sonner";

const initialState: ProfileFormState = {};

interface ProfileFormProps {
  email: string;
  fullName: string;
}

export function ProfileForm({ email, fullName }: ProfileFormProps) {
  const [state, formAction] = useActionState(
    updateProfileAction,
    initialState,
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success("Profile updated");
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update how your name appears across SiteBrief AI.
        </CardDescription>
      </CardHeader>
      <form action={formAction} noValidate>
        <CardContent className="space-y-4">
          <FormError message={state.error} />
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={fullName}
              aria-invalid={Boolean(state.fieldErrors?.fullName)}
              required
            />
            <FieldError messages={state.fieldErrors?.fullName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled readOnly />
            <p className="text-xs text-muted-foreground">
              Email changes aren’t supported yet.
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
