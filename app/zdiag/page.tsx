import { createAdminClient } from "@/lib/supabase/server";
import { normalizeBrief, isBriefComplete } from "@/lib/services/brief";
import { getWebsite } from "@/lib/services/website";
import { sanitizeWebsite, EMPTY_WEBSITE } from "@/lib/website-sanitize";
import type { GeneratedBrief } from "@/types/domain";
import { DiagStudio } from "./diag-studio";

// TEMPORARY diagnostics — fetches the REAL project data (service role) and
// renders the real ProjectWorkspace so the exact production crash reproduces.
export const dynamic = "force-dynamic";

export default async function DiagPage() {
  try {
    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!project) return <pre data-diag-error>no project found</pre>;

    const [{ data: wv }, { data: pv }] = await Promise.all([
      admin
        .from("website_versions")
        .select("*")
        .eq("project_id", project.id)
        .order("version", { ascending: false }),
      admin
        .from("project_versions")
        .select("*")
        .eq("project_id", project.id)
        .order("version", { ascending: false }),
    ]);

    const brief = normalizeBrief(project.brief);
    const website = getWebsite(project.website);
    const websiteVersions = (wv ?? []).map((r) => ({
      ...r,
      content: sanitizeWebsite(r.content) ?? EMPTY_WEBSITE,
    }));
    const versions = (pv ?? []).map((r) => ({
      ...r,
      content: r.content as unknown as GeneratedBrief,
    }));

    return (
      <div className="min-h-screen bg-background p-6">
        <DiagStudio
          project={project}
          initialBrief={brief}
          briefComplete={isBriefComplete(brief)}
          versions={versions}
          website={website}
          websiteVersions={websiteVersions}
        />
      </div>
    );
  } catch (e) {
    return <pre data-diag-error>DIAG FETCH ERROR: {String(e)}</pre>;
  }
}
