import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ checkEmail?: string; error?: string }>;
}) {
  const params = await searchParams;

  const notice =
    params.checkEmail === "1"
      ? "Check your email to confirm your account, then sign in."
      : params.error === "auth"
        ? "We couldn’t complete that sign-in. Please try again."
        : undefined;

  return <LoginForm notice={notice} />;
}
