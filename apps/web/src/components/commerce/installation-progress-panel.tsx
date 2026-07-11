"use client";

import { Button } from "@rtb/ui";
import type { InstallationProgressView } from "@rtb/platform-core";

const STEP_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  failed: "Failed",
  skipped: "Skipped",
};

function formatDuration(ms?: number): string {
  if (ms === undefined) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function InstallationProgressPanel({
  progress,
  onRetry,
}: {
  progress: InstallationProgressView;
  onRetry?: () => void;
}) {
  return (
    <div className="space-y-6" data-testid="installation-progress">
      {progress.failure && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4"
          data-testid="installation-failure"
        >
          <h3 className="font-semibold text-red-900">{progress.failure.title}</h3>
          <p className="mt-1 text-sm text-red-800">{progress.failure.explanation}</p>
          <p className="mt-2 text-xs text-red-700">
            Reference: {progress.failure.referenceCode}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {progress.failure.canRetry && onRetry && (
              <Button size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
            <a
              href="mailto:support@rtb.eng?subject=Installation%20support"
              className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-sm"
            >
              Contact Support
            </a>
          </div>
        </div>
      )}

      <ol className="space-y-3">
        {progress.steps.map((step) => (
          <li
            key={step.key}
            className="rounded-lg border border-border bg-white p-4"
            data-testid={`install-step-${step.key}`}
            data-step-status={step.status}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-800">{step.label}</p>
                <p className="text-xs text-slate-500">
                  Status: {STEP_STATUS_LABEL[step.status] ?? step.status}
                </p>
              </div>
              {step.errorCode && (
                <span className="text-xs font-mono text-red-600">{step.errorCode}</span>
              )}
            </div>
            {(step.startedAt || step.completedAt) && (
              <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4">
                {step.startedAt && (
                  <div>
                    <dt className="font-medium text-slate-500">Started</dt>
                    <dd>{new Date(step.startedAt).toLocaleString()}</dd>
                  </div>
                )}
                {step.completedAt && (
                  <div>
                    <dt className="font-medium text-slate-500">Completed</dt>
                    <dd>{new Date(step.completedAt).toLocaleString()}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-slate-500">Duration</dt>
                  <dd>{formatDuration(step.durationMs)}</dd>
                </div>
              </dl>
            )}
            {step.evidenceSummary && step.status === "completed" && (
              <p className="mt-2 text-xs text-slate-500">{step.evidenceSummary}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
