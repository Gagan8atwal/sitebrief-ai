"use client";

import { useEffect, useState } from "react";

/** True only after the component has hydrated on the client. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
