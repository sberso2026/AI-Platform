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
        <h2 className="text-2xl font-semibold text-[color:var(--eos-text-primary)]">Project Intelligence unavailable</h2>
        <p className="mt-2 text-[1rem] text-[color:var(--eos-text-secondary)]">
          Configuration could not be loaded. Retry shortly or contact an administrator.
        </p>
      </section>
    );
  }

  const settings = (tenant?.settings ?? {}) as { projectIntelligence?: { enabled?: boolean } };
  if (settings.projectIntelligence?.enabled === false) {
    return (
      <section aria-live="polite">
        <h2 className="text-2xl font-semibold text-[color:var(--eos-text-primary)]">Configuration incomplete</h2>
        <p className="mt-2 text-[1rem] text-[color:var(--eos-text-secondary)]">Project Intelligence has not been enabled for this workspace.</p>
      </section>
    );
  }

  return (
    <section data-testid="project-intelligence-ready" className="eos-command-canvas">
      <p className="text-[0.8125rem] font-semibold tracking-[0.14em] text-[color:var(--eos-accent)]">Project Intelligence Overview</p>
      <h2 className="mt-1 text-[2.125rem] font-semibold tracking-tight text-[color:var(--eos-text-primary)]">
        What changed, what matters, what needs a decision
      </h2>
      <p className="mt-3 max-w-3xl text-[1rem] text-[color:var(--eos-text-secondary)]">
        Project Intelligence is the reasoning layer over existing project evidence. Schedule, cost,
        documents, correspondence, and meetings remain in their systems of record.
      </p>

      <div className="mt-8" data-testid="project-intelligence-dashboard">
        <Suspense fallback={<p className="text-sm text-slate-600">Loading Command Centre…</p>}>
          <ProjectCommandCentre />
        </Suspense>
      </div>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Records and reports">
        {DASHBOARD_PANELS.map((panel) => (
          <Link
            key={panel.id}
            href={panel.href}
            data-testid={`project-intelligence-panel-${panel.id}`}
            className="eos-shell-link"
          >
            {panel.title}
          </Link>
        ))}
      </nav>
    </section>
  );
}
