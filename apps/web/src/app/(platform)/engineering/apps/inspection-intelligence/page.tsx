import Link from "next/link";

/**
 * Phase 9A discovery shell only — no commercial inspection workflows.
 */
export default function InspectionIntelligenceDiscoveryPage() {
  return (
    <section data-testid="inspection-intelligence-discovery-ready" aria-labelledby="ii-discovery-title">
      <h1 id="ii-discovery-title" className="text-2xl font-semibold text-slate-900">
        Inspection Intelligence
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Architecture discovery lock (0.1.0-discovery). Generic inspection framework,
        ownership boundaries, and platform integration are documented. Commercial
        inspection product features are not implemented in this phase.
      </p>
      <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-slate-700">
        <li>Engineering OS module — not a separate Operating System</li>
        <li>Shared domain owns projects and assets</li>
        <li>Platform AI Runtime, Workflow, Knowledge Graph, Files, Commerce reused</li>
        <li>Product features implemented: false</li>
      </ul>
      <p className="mt-6 text-sm text-slate-500">
        Framework docs live under{" "}
        <Link className="underline" href="/engineering/apps/project-intelligence/about">
          Engineering OS documentation
        </Link>{" "}
        in the monorepo <code>docs/architecture/INSPECTION_INTELLIGENCE_*.md</code>.
      </p>
    </section>
  );
}
