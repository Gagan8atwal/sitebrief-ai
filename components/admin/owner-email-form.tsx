"use client";

import { useState, useTransition } from "react";

import { updateOwnerEmailAction } from "@/app/(dashboard)/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

export function OwnerEmailForm({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const res = await updateOwnerEmailAction(email);
      if (!res.ok) {
        toast.error(res.error ?? "Could not save.");
        return;
      }
      toast.success("Owner email updated");
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="owner-email">Owner email</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="owner-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="owner@example.com"
        />
        <Button onClick={save} disabled={isPending || !email.trim()}>
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        The account that signs up (or has signed up) with this email is
        automatically the platform owner.
      </p>
    </div>
  );
}
