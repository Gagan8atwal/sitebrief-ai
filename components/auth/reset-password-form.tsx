"use client";

import { useActionState } from "react";

import {
  updatePasswordAction,
  type AuthFormState,
} from "@/app/(auth)/actions";
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

const initialState: AuthFormState = {};

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Set a new password</CardTitle>
        <CardDescription>
          Choose a strong password you don’t use elsewhere.
        </CardDescription>
      </CardHeader>
      <form action={formAction} noValidate>
        <CardContent className="space-y-4">
          <FormError message={state.error} />
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(state.fieldErrors?.password)}
              required
            />
            <FieldError messages={state.fieldErrors?.password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
              required
            />
            <FieldError messages={state.fieldErrors?.confirmPassword} />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton className="w-full" pendingText="Updating…">
            Update password
          </SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
