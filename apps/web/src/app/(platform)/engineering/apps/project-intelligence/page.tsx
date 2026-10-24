import Link from "next/link";
import { getAuthContext } from "@/lib/kernel";
import { AskEngineeringAI } from "@/components/engineering/operational";

const PANELS = [
  {
    id: "recent-activity",
    title: "Recent activity",
    body: "Latest document processing, meeting reviews, and mapping events.",
    href: "/engineering/apps/project-intelligence/health",
    action: "View activity",
  },
  {
    id: "assigned-work",
    title: "Assigned work",
    body: "Reviews and approvals that need your attention.",
    href: "/engineering/apps/project-intelligence/documents/review",
    action: "Review queue",
  },
  {
    id: "documents",
    title: "Documents",
    body: "Ingestion, retrieval, and grounded answers from project documents.",
    href: "/engineering/apps/project-intelligence/documents",
    action: "Open documents",
  },
  {
    id: "meetings",
    title: "Meetings",
    body: "Capture, minutes, and meeting follow-up.",
    href: "/engineering/apps/project-intelligence/meetings",
    action: "Open meetings",
  },
  {
    id: "findings",
    title: "Risks / changes",
    body: "Findings across documents and meetings — evidence-linked.",
    href: "/engineering/apps/project-intelligence/findings",
    action: "Open findings",
  },
  {
    id: "reports",
    title: "Forecast & reports",
    body: "Project reports and executive summary from recorded evidence.",
    href: "/engineering/apps/project-intelligence/reports",
    action: "Open reports",
  },
  {
    id: "ai-insights",
    title: "AI Project Analyst",
    body: "Advisory, evidence-bound answers. Human review required before any approval.",
    href: "/engineering/apps/project-intelligence/reasoning",
    action: "Ask the analyst",
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
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Project status</h2>
      <p className="mt-2 max-w-2xl text-slate-600">
        Status, schedule and cost signals, risks, queries, and recent activity from recorded
        project evidence. Insights are advisory.
      </p>
      <div className="mt-4">
        <AskEngineeringAI q="What is the current project status from recorded evidence?" />
      </div>

      <div
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        data-testid="project-intelligence-dashboard"
      >
        {PANELS.map((panel) => (
          <article
            key={panel.id}
            data-testid={`project-intelligence-panel-${panel.id}`}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="font-medium text-slate-900">{panel.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{panel.body}</p>
            <Link
              href={panel.href}
              className="mt-4 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
            >
              {panel.action}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
