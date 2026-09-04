"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@rtb/ui";
import { ArrowLeft } from "lucide-react";
import { PI_BASE_PATH, withPiProjectQuery, usePiProjectContext } from "./pi-project-context";

export function PiBackNav({
  fallbackHref = PI_BASE_PATH,
  label = "Back",
}: {
  fallbackHref?: string;
  label?: string;
}) {
  const router = useRouter();
  const { projectId } = usePiProjectContext();
  const href = withPiProjectQuery(fallbackHref, projectId);

  return (
    <div className="flex flex-wrap items-center gap-3" data-testid="pi-back-nav">
      <button
        type="button"
        data-testid="pi-back-button"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-950"
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) router.back();
          else router.push(href);
        }}
      >
        <ArrowLeft className="size-4" />
        {label}
      </button>
      <Link
        href={href}
        data-testid="pi-return-overview"
        className="text-sm text-cyan-800 hover:underline"
      >
        Return to Overview
      </Link>
    </div>
  );
}

export function PiPageHeader({
  eyebrow = "Project Intelligence",
  title,
  description,
  actions,
  backFallback = PI_BASE_PATH,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backFallback?: string;
}) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 space-y-2">
        <PiBackNav fallbackHref={backFallback} />
        <p className="text-sm font-medium text-cyan-700">{eyebrow}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {description ? <p className="max-w-3xl text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function PiLoadingSkeleton({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="space-y-3" data-testid="pi-loading-skeleton" role="status" aria-live="polite">
      <p className="text-sm text-slate-600">{label}</p>
      <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-40 animate-pulse rounded-lg bg-slate-50" />
    </div>
  );
}

export function PiErrorState({ title, description }: { title: string; description: string }) {
  return (
    <EmptyState
      title={title}
      description={description}
      data-testid="pi-error-state"
      role="alert"
    />
  );
}

export function PiUnavailablePanel({
  title,
  dataset,
  requestId,
  onRetry,
  testId,
}: {
  title: string;
  dataset: string;
  requestId?: string | null;
  onRetry?: () => void;
  testId?: string;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white px-4 py-4" data-testid={testId ?? "pi-unavailable"} role="alert">
      <p className="text-sm font-medium text-slate-900">{title}</p>
      <div className="flex flex-wrap gap-2">
        {onRetry ? (
          <button
            type="button"
            data-testid="pi-retry"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            onClick={() => void onRetry()}
          >
            Retry
          </button>
        ) : null}
        <button
          type="button"
          data-testid="pi-show-details"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          onClick={() => setShowDetails((open) => !open)}
        >
          {showDetails ? "Hide details" : "Show details"}
        </button>
      </div>
      {showDetails ? (
        <dl className="grid gap-1 text-xs text-slate-600" data-testid="pi-error-details">
          <div>
            <dt className="inline font-medium">Request ID:</dt>{" "}
            <dd className="inline">{requestId || "unavailable"}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Dataset:</dt>{" "}
            <dd className="inline">{dataset}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
