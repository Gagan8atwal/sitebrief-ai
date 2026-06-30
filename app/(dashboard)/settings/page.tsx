import type { Metadata } from "next";

import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/services/profile";
import { signOutAction } from "@/app/(auth)/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/settings/profile-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  const email = profile?.email ?? user.email ?? "";
  const fullName =
    profile?.full_name ??
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences."
      />

      <ProfileForm email={email} fullName={fullName} />

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Sign out of this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
