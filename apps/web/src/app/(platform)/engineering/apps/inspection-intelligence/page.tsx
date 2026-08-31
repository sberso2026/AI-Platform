"use client";

import Link from "next/link";
import {
  AskEngineeringAI,
  OperationalPageIntro,
} from "@/components/engineering/operational";

const ACTIONS = [
  {
    href: "/engineering/apps/inspection-intelligence/sessions",
    label: "Start inspection",
  },
  {
    href: "/engineering/apps/inspection-intelligence/plans",
    label: "Create inspection plan",
  },
  {
    href: "/engineering/apps/inspection-intelligence/defects",
    label: "Review defects",
  },
  {
    href: "/engineering/apps/inspection-intelligence/review",
    label: "Review verification",
  },
  {
    href: "/engineering/apps/inspection-intelligence/sessions",
    label: "View history",
  },
] as const;

const QUEUES = [
  { href: "/engineering/apps/inspection-intelligence/my-work", title: "Today / upcoming", body: "Assigned inspections for today and the next period." },
  { href: "/engineering/apps/inspection-intelligence/sessions", title: "In progress", body: "Sessions currently being captured." },
  { href: "/engineering/apps/inspection-intelligence/my-work", title: "Overdue", body: "Inspections past their planned date, where recorded." },
  { href: "/engineering/apps/inspection-intelligence/sessions", title: "Recently completed", body: "Completed inspections awaiting report or close-out." },
  { href: "/engineering/apps/inspection-intelligence/defects", title: "Open defects", body: "Defects not yet closed." },
  { href: "/engineering/apps/inspection-intelligence/defects", title: "Unverified defects", body: "Defects awaiting verification." },
  { href: "/engineering/apps/inspection-intelligence/actions", title: "Corrective actions", body: "Outstanding corrective actions from inspections." },
  { href: "/engineering/apps/inspection-intelligence/review", title: "Awaiting verification", body: "Inspections in the verification queue." },
] as const;

export default function InspectionIntelligenceOverviewPage() {
  return (
    <section
      data-testid="inspection-intelligence-discovery-ready"
      aria-labelledby="ii-overview-title"
    >
      <h1 id="ii-overview-title" className="text-2xl font-semibold text-slate-900">
        Inspection workflow
      </h1>
      <OperationalPageIntro
        purpose="Today’s inspections, open defects, verification, and corrective actions from recorded data."
        primaryAction={
          <Link
            href="/engineering/apps/inspection-intelligence/sessions"
            className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white"
          >
            Start inspection
          </Link>
        }
      />
      <div className="mb-6">
        <AskEngineeringAI q="Summarize recent inspections." />
      </div>

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="inline-flex min-h-11 items-center rounded-md border border-slate-200 bg-white px-3 text-sm hover:border-slate-400"
          >
            {action.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUEUES.map((queue) => (
          <Link
            key={queue.title}
            href={queue.href}
            className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
          >
            <h2 className="text-sm font-semibold text-slate-900">{queue.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{queue.body}</p>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-600">
        Queues stay empty until inspection records exist. Certification and release identity are
        under Governance.
      </p>
    </section>
  );
}
