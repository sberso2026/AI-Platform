"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AskEngineeringAI,
  EmptyOperationalState,
  OperationalError,
  OperationalPageIntro,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import {
  useEngineeringProjectFilter,
  withProjectQuery,
} from "@/hooks/use-engineering-project-filter";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type DashboardPayload = {
  openActionsCount?: number;
  attention?: {
    openActions?: unknown[];
    openIssues?: unknown[];
  };
};

export function ProjectControlsSurfacePage({
  title,
  purpose,
  testId,
  emptyTitle,
  emptyDescription,
  advisory = false,
}: {
  title: string;
  purpose: string;
  testId: string;
  emptyTitle: string;
  emptyDescription: string;
  advisory?: boolean;
}) {
  const projectId = useEngineeringProjectFilter();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch(withProjectQuery("/api/engineering/dashboard", projectId))
      .then((r) => parseApiJsonResponse<DashboardPayload>(r))
      .then((parsed) => {
        if (!parsed.ok) {
          setError(parsed.errorMessage ?? "Failed to load project controls");
          setDashboard(null);
          return;
        }
        setDashboard(parsed.data);
        setError(null);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "load_failed"))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const hasPublished =
    (dashboard?.attention?.openActions?.length ?? 0) > 0 ||
    (dashboard?.attention?.openIssues?.length ?? 0) > 0 ||
    (dashboard?.openActionsCount ?? 0) > 0;

  return (
    <section data-testid={testId} aria-labelledby={`${testId}-title`}>
      <h1 id={`${testId}-title`} className="text-2xl font-semibold text-slate-900">
        {title}
      </h1>
      {advisory ? (
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-800">Advisory</p>
      ) : null}
      <OperationalPageIntro purpose={purpose} />
      <AskEngineeringAI
        projectId={projectId}
        q={`Summarize published ${title.toLowerCase()} evidence for this project.`}
      />
      {loading ? <div className="mt-6"><OperationalSkeleton /></div> : null}
      {error ? (
        <div className="mt-6">
          <OperationalError message={error} onRetry={load} />
        </div>
      ) : null}
      {!loading && !error ? (
        <div className="mt-6">
          <EmptyOperationalState
            title={emptyTitle}
            description={
              hasPublished
                ? emptyDescription
                : emptyDescription
            }
            testId={`${testId}-empty`}
            action={
              <Link href="/engineering/apps/project-controls" className="text-sm font-medium underline">
                Return to overview
              </Link>
            }
          />
        </div>
      ) : null}
    </section>
  );
}
