import Link from "next/link";
import { getAuthContext } from "@/lib/kernel";

const DASHBOARD_PANELS = [
  {
    id: "recent-activity",
    title: "Recent activity",
    body: "Latest document processing, meeting reviews, and mapping events in this workspace.",
    href: "/engineering/apps/project-intelligence/health",
  },
  {
    id: "assigned-work",
    title: "Assigned work",
    body: "Review queues and approval items requiring your seat in this workspace.",
    href: "/engineering/apps/project-intelligence/documents/review",
  },
  {
    id: "documents",
    title: "Documents",
    body: "Document Intelligence — ingestion, retrieval, and grounded answers.",
    href: "/engineering/apps/project-intelligence/documents",
  },
  {
    id: "meetings",
    title: "Meetings",
    body: "Meeting Intelligence — capture, minutes, and provider integrations.",
    href: "/engineering/apps/project-intelligence/meetings",
  },
  {
    id: "findings",
    title: "Findings",
    body: "Findings Intelligence — consolidated evidence across documents and meetings.",
    href: "/engineering/apps/project-intelligence/findings",
  },
  {
    id: "reports",
    title: "Reports",
    body: "Reporting Intelligence — module reports over shared Engineering services.",
    href: "/engineering/apps/project-intelligence/reports",
  },
  {
    id: "ai-insights",
    title: "AI insights",
    body: "Evidence-bound insights via Platform AI Runtime and Engineering Intelligence Framework.",
    href: "/engineering/apps/project-intelligence/documents/query",
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
      <p className="text-sm font-medium text-cyan-700">Engineering OS module</p>
      <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Project Intelligence</h2>
      <p className="mt-3 max-w-2xl text-slate-600">
        Flagship Engineering OS module for document, meeting, findings, and reporting intelligence —
        consuming shared Engineering Domain, shared services, and Platform AI Runtime.
      </p>

      <div
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        data-testid="project-intelligence-dashboard"
      >
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
