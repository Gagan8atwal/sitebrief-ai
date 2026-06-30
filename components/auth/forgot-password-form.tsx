"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import {
  requestPasswordResetAction,
  type ResetRequestState,
} from "@/app/(auth)/actions";
import { ROUTES } from "@/lib/constants";
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
import { FieldError } from "@/components/auth/form-feedback";

const initialState: ResetRequestState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  if (state.sent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Check your email
          </CardTitle>
          <CardDescription>
            If an account exists for that address, we’ve sent a link to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href={ROUTES.login}
            className="text-sm font-medium text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we’ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <form action={formAction} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(state.fieldErrors?.email)}
              required
            />
            <FieldError messages={state.fieldErrors?.email} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton className="w-full" pendingText="Sending…">
            Send reset link
          </SubmitButton>
          <Link
            href={ROUTES.login}
            className="text-center text-sm font-medium text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
