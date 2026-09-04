import Link from "next/link";
import { Suspense } from "react";
import { getAuthContext } from "@/lib/kernel";
import { ProjectCommandCentre } from "@/components/engineering/project-command-centre";

const DASHBOARD_PANELS = [
  {
    id: "recent-activity",
    title: "What changed",
    body: "Material published deltas across schedule, cost, risk, TQs, and findings.",
    href: "/engineering/apps/project-intelligence",
  },
  {
    id: "assigned-work",
    title: "Attention required",
    body: "Exception-first queue of overdue decisions, actions, risks, and evidence gaps.",
    href: "/engineering/apps/project-intelligence",
  },
  {
    id: "documents",
    title: "Documents",
    body: "What changed in project documents — drill-down from Engineering Intelligence.",
    href: "/engineering/apps/project-intelligence/documents",
  },
  {
    id: "meetings",
    title: "Meetings",
    body: "Meeting commitments, decisions, and follow-up — drill-down from Engineering.",
    href: "/engineering/apps/project-intelligence/meetings",
  },
  {
    id: "findings",
    title: "Findings",
    body: "Open, critical, and overdue findings — drill-down from Engineering.",
    href: "/engineering/apps/project-intelligence/findings",
  },
  {
    id: "reports",
    title: "Reports",
    body: "Executive intelligence with interpretation, not counts alone.",
    href: "/engineering/apps/project-intelligence/reports",
  },
  {
    id: "ai-insights",
    title: "Ask Project Intelligence",
    body: "Evidence-grounded answers. Advisory only. Does not replace project controls systems.",
    href: "/engineering/apps/project-intelligence/analyst",
  },
] as const;

export default async function ProjectIntelligenceOverviewPage() {
  const ctx = await getAuthContext();
  const { data: tenant, error } = ctx
    ? await ctx.supabase.from("tenants").select("settings").eq("id", ctx.tenantId).single()
    : { data: null, error: new Error("Unauthorized") };

  if (error) {
    return (
      <section aria-live="polite">
        <h2 className="text-2xl font-semibold text-slate-900">Project Intelligence unavailable</h2>
        <p className="mt-2 text-slate-600">
          Configuration could not be loaded. Retry shortly or contact an administrator.
        </p>
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
      <p className="text-sm font-medium text-cyan-700">Project Intelligence Overview</p>
      <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
        What changed, why it matters, what needs a decision
      </h2>
      <p className="mt-3 max-w-3xl text-slate-600">
        Project Intelligence is the reasoning layer over existing project evidence. Schedule, cost,
        documents, correspondence, and meetings remain in their systems of record. This overview answers
        health, attention, change, and next decisions from published evidence only.
      </p>

      <div className="mt-8" data-testid="project-intelligence-dashboard">
        <Suspense fallback={<p className="text-sm text-slate-600">Loading Command Centre…</p>}>
          <ProjectCommandCentre />
        </Suspense>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DASHBOARD_PANELS.map((panel) => (
          <article
            key={panel.id}
            data-testid={`project-intelligence-panel-${panel.id}`}
            className="rounded-lg border border-slate-200 p-5 shadow-sm"
          >
            <h3 className="font-medium text-slate-900">{panel.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{panel.body}</p>
            <Link
              href={panel.href}
              className="mt-4 inline-block text-sm font-medium text-cyan-700 hover:underline"
            >
              Open
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
