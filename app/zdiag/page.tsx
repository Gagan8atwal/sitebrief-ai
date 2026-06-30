import { DiagStudio } from "./diag-studio";

// TEMPORARY public diagnostics page — renders the website studio (nested Tabs +
// real data) in the real Next runtime to surface the Website-tab exception.
// No auth so it can be fetched directly. Removed once the bug is fixed.
export const dynamic = "force-dynamic";

export default function DiagPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <DiagStudio />
    </div>
  );
}
