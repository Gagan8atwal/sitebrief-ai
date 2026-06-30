import type { MetadataRoute } from "next";

import { env } from "@/lib/env";
import { ROUTES } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const now = new Date();

  return [ROUTES.home, ROUTES.login, ROUTES.signup].map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === ROUTES.home ? 1 : 0.6,
  }));
}
