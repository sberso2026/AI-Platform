import { getAuthContext } from "@/lib/kernel";

export default async function ProjectIntelligenceOverviewPage() {
  const ctx = await getAuthContext();
  const { data: tenant, error } = ctx
    ? await ctx.supabase.from("tenants").select("settings").eq("id", ctx.tenantId).single()
    : { data: null, error: new Error("Unauthorized") };

  if (error) {
    return (
      <section aria-live="polite">
        <h2 className="text-2xl font-semibold text-slate-900">Project Intelligence unavailable</h2>
        <p className="mt-2 text-slate-600">Configuration could not be loaded. Retry shortly or contact an administrator.</p>
      </section>
    );
  }

  const settings = (tenant?.settings ?? {}) as { projectIntelligence?: { enabled?: boolean } };
  if (settings.projectIntelligence?.enabled === false) {
    return (
      <section aria-live="polite">
        <h2 className="text-2xl font-semibold text-slate-900">Configuration incomplete</h2>
        <p className="mt-2 text-slate-600">Project Intelligence has not been enabled for this workspace.</p>
      </section>
    );
  }

  return (
    <section data-testid="project-intelligence-ready">
      <p className="text-sm font-medium text-cyan-700">Engineering OS application</p>
      <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Project Intelligence</h2>
      <p className="mt-3 max-w-2xl text-slate-600">
        Review legacy project mappings, monitor synchronization health, and generate evidence-bound summaries.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Migration", "Review mapping candidates without changing Engineering Core data."],
          ["Health", "Check mapping and synchronization service status."],
          ["AI summaries", "Summaries remain read-only and abstain without enough evidence."],
        ].map(([title, body]) => (
          <article key={title} className="rounded-lg border border-slate-200 p-5 shadow-sm">
            <h3 className="font-medium text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
