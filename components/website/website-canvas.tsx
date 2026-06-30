import { SectionRenderer } from "@/components/website/section-renderer";
import type { GeneratedWebsite, WebsitePage } from "@/types/website";

/**
 * A complete rendered page: branded nav header, the page's sections, and a
 * footer derived from the site. Self-contained light canvas.
 */
export function WebsiteCanvas({
  website,
  page,
}: {
  website: GeneratedWebsite;
  page: WebsitePage;
}) {
  const { theme, navigation, name } = website;

  return (
    <div className="min-h-full bg-white text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <span className="text-base font-bold" style={{ color: theme.primaryColor }}>
          {name}
        </span>
        <nav className="hidden gap-5 text-sm text-slate-600 sm:flex">
          {(navigation ?? []).slice(0, 5).map((link) => (
            <span
              key={link.slug}
              className={
                link.slug === page.slug ? "font-semibold text-slate-900" : ""
              }
            >
              {link.label}
            </span>
          ))}
        </nav>
        <span
          className="rounded-md px-3 py-1.5 text-xs font-semibold text-white"
          style={{ backgroundColor: theme.primaryColor }}
        >
          {navigation.length > 0 ? "Menu" : ""}
        </span>
      </header>

      <main>
        {(page.sections ?? []).map((section) => (
          <SectionRenderer key={section.id} section={section} theme={theme} />
        ))}
      </main>

      <footer className="border-t border-slate-200 bg-slate-900 px-6 py-8 text-center text-xs text-slate-400">
        © {name}. Built with SiteBrief AI.
      </footer>
    </div>
  );
}
