import type { WebsiteSection, WebsiteTheme } from "@/types/website";

/**
 * Renders one website section as a modern, responsive template. Intentionally
 * self-contained (light "website" canvas, brand-colored accents) so the preview
 * reads as a real site rather than the dark app chrome. No app design tokens.
 */

function PrimaryButton({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span
      className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

export function SectionRenderer({
  section,
  theme,
}: {
  section: WebsiteSection;
  theme: WebsiteTheme;
}) {
  const color = theme.primaryColor;
  const items = section.items ?? [];

  switch (section.type) {
    case "hero":
      return (
        <section className="px-6 py-20 text-center sm:py-28">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {section.heading}
            </h1>
            {section.subheading ? (
              <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
                {section.subheading}
              </p>
            ) : null}
            {section.ctaLabel ? (
              <div className="mt-8">
                <PrimaryButton label={section.ctaLabel} color={color} />
              </div>
            ) : null}
          </div>
        </section>
      );

    case "valueProps":
    case "features":
      return (
        <section className="bg-slate-50 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            {section.heading ? (
              <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
                {section.heading}
              </h2>
            ) : null}
            {section.subheading ? (
              <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
                {section.subheading}
              </p>
            ) : null}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-white p-6 text-left"
                >
                  <span
                    className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {i + 1}
                  </span>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  {item.description ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "about":
      return (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {section.heading}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              {section.body}
            </p>
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="px-6 py-14" style={{ backgroundColor: `${color}10` }}>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 text-center sm:grid-cols-3">
            {items.map((item, i) => (
              <div key={i}>
                <div
                  className="text-4xl font-bold"
                  style={{ color }}
                >
                  {item.title}
                </div>
                <div className="mt-1 text-sm uppercase tracking-wide text-slate-500">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </section>
      );

    case "testimonials":
      return (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
              {section.heading}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {items.map((item, i) => (
                <figure
                  key={i}
                  className="rounded-xl border border-slate-200 bg-white p-6"
                >
                  <blockquote className="text-slate-800">{item.title}</blockquote>
                  <figcaption className="mt-3 text-sm text-slate-500">
                    — {item.description}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      );

    case "pricing":
      return (
        <section className="bg-slate-50 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
              {section.heading}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-6"
                >
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <div className="mt-2 text-3xl font-bold text-slate-900">
                    {item.meta}
                  </div>
                  <p className="mt-2 flex-1 text-sm text-slate-600">
                    {item.description}
                  </p>
                  {section.ctaLabel ? (
                    <div className="mt-4">
                      <PrimaryButton label={section.ctaLabel} color={color} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "faq":
      return (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {section.heading}
            </h2>
            <dl className="mt-8 divide-y divide-slate-200">
              {items.map((item, i) => (
                <div key={i} className="py-5">
                  <dt className="font-semibold text-slate-900">{item.title}</dt>
                  <dd className="mt-2 text-sm text-slate-600">
                    {item.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      );

    case "cta":
      return (
        <section className="px-6 py-16" style={{ backgroundColor: color }}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {section.heading}
            </h2>
            {section.subheading ? (
              <p className="mt-3 text-white/85">{section.subheading}</p>
            ) : null}
            {section.ctaLabel ? (
              <div className="mt-6">
                <span
                  className="inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold shadow-sm"
                  style={{ color }}
                >
                  {section.ctaLabel}
                </span>
              </div>
            ) : null}
          </div>
        </section>
      );

    case "contactInfo":
      return (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {section.heading}
            </h2>
            {section.body ? (
              <p className="mt-3 text-slate-600">{section.body}</p>
            ) : null}
            <ul className="mt-6 space-y-2">
              {items.map((item, i) => (
                <li key={i} className="text-sm text-slate-700">
                  <span className="font-medium text-slate-900">
                    {item.title}:
                  </span>{" "}
                  {item.description}
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "footer":
      return (
        <footer className="border-t border-slate-200 bg-slate-900 px-6 py-10 text-center text-sm text-slate-400">
          {section.heading}
        </footer>
      );

    default:
      return null;
  }
}
