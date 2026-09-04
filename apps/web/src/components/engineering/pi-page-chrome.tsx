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
        className="inline-flex min-h-11 items-center gap-1.5 text-[1rem] font-medium text-[color:var(--eos-text-primary)] hover:text-[color:var(--eos-accent)]"
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
        className="text-[1rem] text-[color:var(--eos-accent)] hover:underline"
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
        <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--eos-accent)]">{eyebrow}</p>
        <h2 className="text-[2.125rem] font-semibold tracking-tight text-[color:var(--eos-text-primary)]">{title}</h2>
        {description ? <p className="max-w-3xl text-[1rem] text-[color:var(--eos-text-secondary)]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function PiLoadingSkeleton({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="space-y-3" data-testid="pi-loading-skeleton" role="status" aria-live="polite">
      <p className="text-[1rem] text-[color:var(--eos-text-secondary)]">{label}</p>
      <div className="eos-shimmer h-24 rounded-xl" />
      <div className="eos-shimmer h-40 rounded-xl" />
      <div className="eos-shimmer h-40 rounded-xl" />
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
    <div className="space-y-3 rounded-xl border border-[color:var(--eos-border)] bg-[color:var(--eos-panel-elevated)] px-5 py-5" data-testid={testId ?? "pi-unavailable"} role="alert">
      <p className="text-[1rem] font-medium text-[color:var(--eos-text-primary)]">{title}</p>
      <div className="flex flex-wrap gap-2">
        {onRetry ? (
          <button
            type="button"
            data-testid="pi-retry"
            className="eos-shell-link"
            onClick={() => void onRetry()}
          >
            Retry
          </button>
        ) : null}
        <button
          type="button"
          data-testid="pi-show-details"
          className="eos-shell-link"
          onClick={() => setShowDetails((open) => !open)}
        >
          {showDetails ? "Hide details" : "Show details"}
        </button>
      </div>
      {showDetails ? (
        <dl className="grid gap-1 text-[0.875rem] text-[color:var(--eos-text-secondary)]" data-testid="pi-error-details">
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
