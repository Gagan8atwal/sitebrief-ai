"use client";

import { useActionState } from "react";
import Link from "next/link";

import { loginAction, type AuthFormState } from "@/app/(auth)/actions";
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

export function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your SiteBrief AI account.</CardDescription>
      </CardHeader>
      <form action={formAction} noValidate>
        <CardContent className="space-y-4">
          {notice ? (
            <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {notice}
            </p>
          ) : null}
          <FormError message={state.error} />

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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href={ROUTES.forgotPassword}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(state.fieldErrors?.password)}
              required
            />
            <FieldError messages={state.fieldErrors?.password} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton className="w-full" pendingText="Signing in…">
            Sign in
          </SubmitButton>
          <p className="text-center text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <Link
              href={ROUTES.signup}
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
