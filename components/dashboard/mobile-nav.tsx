"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export function MobileNav({ isStaff = false }: { isStaff?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu />
        </Button>
      </DialogTrigger>
      <DialogContent className="left-0 top-0 max-w-xs translate-x-0 translate-y-0 rounded-none rounded-r-xl">
        <DialogTitle className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {APP_NAME}
        </DialogTitle>
        <div className="mt-4">
          <SidebarNav isStaff={isStaff} onNavigate={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
