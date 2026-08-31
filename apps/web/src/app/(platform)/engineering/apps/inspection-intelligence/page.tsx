"use client";

import Link from "next/link";
import {
  AskEngineeringAI,
  OperationalPageIntro,
} from "@/components/engineering/operational";
import { InspectionHostedWorkbench } from "@/components/engineering/inspection-hosted-workbench";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";

const WORKFLOW = [
  { href: "/engineering/apps/inspection-intelligence/plans", label: "Plan" },
  { href: "/engineering/apps/inspection-intelligence/sessions", label: "Execute" },
  { href: "/engineering/apps/inspection-intelligence/field", label: "Capture evidence" },
  { href: "/engineering/apps/inspection-intelligence/sessions", label: "Record observation" },
  { href: "/engineering/apps/inspection-intelligence/defects", label: "Defect / condition" },
  { href: "/engineering/apps/inspection-intelligence/actions", label: "Recommendation / action" },
  { href: "/engineering/apps/inspection-intelligence/review", label: "Verification" },
  { href: "/engineering/apps/inspection-intelligence/sessions", label: "Report" },
  { href: "/engineering/apps/inspection-intelligence/sessions", label: "History" },
] as const;

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
  const { canMutate } = useEngineeringWriteAccess();
  const actions = canMutate
    ? ACTIONS
    : ACTIONS.filter((action) => !/start|create/i.test(action.label));
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
          canMutate ? (
            <Link
              href="/engineering/apps/inspection-intelligence/sessions"
              className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white"
            >
              Start inspection
            </Link>
          ) : undefined
        }
      />
      <div className="mb-6">
        <AskEngineeringAI q="Summarize recent inspections." />
      </div>
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <InspectionHostedWorkbench focus="overview" />
      </div>

      <ol
        className="mb-6 flex flex-wrap gap-2 overflow-x-auto text-sm"
        data-testid="inspection-workflow-strip"
        aria-label="Inspection workflow"
      >
        {WORKFLOW.map((step, index) => (
          <li key={`${step.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span className="text-slate-400" aria-hidden>→</span> : null}
            <Link
              href={step.href}
              className="inline-flex min-h-11 items-center rounded-md border border-slate-200 bg-white px-3 hover:border-slate-400"
            >
              {step.label}
            </Link>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
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
