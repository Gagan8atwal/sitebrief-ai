"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signupAction, type AuthFormState } from "@/app/(auth)/actions";
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
import { FieldError, FormError } from "@/components/auth/form-feedback";

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>
          Start building with SiteBrief AI in seconds.
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
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              aria-invalid={Boolean(state.fieldErrors?.fullName)}
              required
            />
            <FieldError messages={state.fieldErrors?.fullName} />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton className="w-full" pendingText="Creating account…">
            Create account
          </SubmitButton>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={ROUTES.login}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
