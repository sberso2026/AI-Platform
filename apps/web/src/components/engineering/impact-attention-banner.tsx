"use client";

/**
 * Contextual impact warning only — does not redesign page layouts.
 */

export type ImpactAttentionBannerProps = {
  title: string;
  detail?: string;
  impactState?: string;
  onViewImpactHref?: string;
  testId?: string;
};

export function ImpactAttentionBanner({
  title,
  detail,
  impactState,
  onViewImpactHref,
  testId = "impact-attention-banner",
}: ImpactAttentionBannerProps) {
  return (
    <div
      className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
      data-testid={testId}
      data-eos-impact-contextual="yes"
      role="status"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{title}</p>
          {detail ? <p className="mt-0.5 text-xs text-amber-900/90">{detail}</p> : null}
          {impactState ? (
            <p className="mt-1 text-[11px] uppercase tracking-wide text-amber-800">
              {impactState.replace(/_/g, " ")}
            </p>
          ) : null}
        </div>
        {onViewImpactHref ? (
          <a
            href={onViewImpactHref}
            className="inline-flex min-h-9 items-center rounded-md border border-amber-400 bg-white px-3 text-xs font-semibold text-amber-950 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
            data-testid={`${testId}-view-impact`}
          >
            View Impact
          </a>
        ) : null}
      </div>
    </div>
  );
}
