import Link from "next/link";

const DIAGNOSTIC_LINKS = [
  {
    href: "/engineering/apps/project-intelligence/health",
    title: "Health",
    body: "Application and provider readiness checks.",
  },
  {
    href: "/engineering/apps/project-intelligence/knowledge",
    title: "Knowledge",
    body: "Knowledge graph and retrieval diagnostics.",
  },
  {
    href: "/engineering/apps/project-intelligence/settings",
    title: "Governance",
    body: "Settings, mappings, and policy configuration.",
  },
  {
    href: "/engineering/apps/project-intelligence/migration",
    title: "Migration",
    body: "Legacy mapping and migration operations.",
  },
  {
    href: "/engineering/apps/project-intelligence/reasoning",
    title: "Reasoning assistant",
    body: "Advanced reasoning diagnostics.",
  },
  {
    href: "/engineering/apps/project-intelligence/forecasting",
    title: "Forecasting",
    body: "Published forecast interpretation diagnostics.",
  },
  {
    href: "/engineering/apps/project-intelligence/documents/health",
    title: "Document provider health",
    body: "Ingestion and provider diagnostics for documents.",
  },
  {
    href: "/engineering/apps/project-intelligence/meetings/health",
    title: "Meeting provider health",
    body: "Meeting capture provider diagnostics.",
  },
  {
    href: "/engineering/apps/project-intelligence/meetings/settings/providers",
    title: "Meeting providers",
    body: "Provider configuration. Hidden from normal operational navigation.",
  },
] as const;

export default function ProjectIntelligenceDiagnosticsPage() {
  return (
    <section data-testid="project-intelligence-diagnostics-ready">
      <p className="text-sm font-medium text-cyan-700">Administration</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">Diagnostics</h2>
      <p className="mt-2 max-w-3xl text-slate-600">
        Advanced, health, governance, migration, and provider tools. These are not primary
        management destinations.
      </p>
      <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Diagnostics">
        {DIAGNOSTIC_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md border border-slate-200 px-4 py-3 hover:border-slate-400"
          >
            <p className="font-medium text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.body}</p>
          </Link>
        ))}
      </nav>
    </section>
  );
}
