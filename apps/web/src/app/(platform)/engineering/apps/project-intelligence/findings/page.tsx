import Link from "next/link";

export default function FindingsIntelligencePage() {
  return (
    <section data-testid="project-intelligence-findings-ready">
      <p className="text-sm font-medium text-cyan-700">Findings Intelligence</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">Findings</h2>
      <p className="mt-2 max-w-2xl text-slate-600">
        Consolidated findings from Document Intelligence and Meeting Intelligence. Document Intelligence
        emits typed candidate findings only; Findings Intelligence owns lifecycle and disposition.
        Findings never mutate Engineering Core without human approval.
      </p>
      <ul className="mt-8 space-y-3 text-sm text-slate-700">
        <li className="rounded-md border border-slate-200 px-4 py-3">
          Document findings surface from the document review queue.
        </li>
        <li className="rounded-md border border-slate-200 px-4 py-3">
          Meeting proposals remain review-bound until approved into Core.
        </li>
        <li className="rounded-md border border-slate-200 px-4 py-3">
          Synthesis consumes Engineering AI framework evidence grounding and citations.
        </li>
      </ul>
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link
          className="text-cyan-700 hover:underline"
          href="/engineering/apps/project-intelligence/documents/review"
        >
          Document review queue
        </Link>
        <Link
          className="text-cyan-700 hover:underline"
          href="/engineering/apps/project-intelligence/meetings"
        >
          Meeting Intelligence
        </Link>
      </div>
    </section>
  );
}
