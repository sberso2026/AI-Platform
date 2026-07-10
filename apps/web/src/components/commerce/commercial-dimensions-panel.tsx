"use client";

import { cn } from "@rtb/ui";
import type {
  InstallationStatus,
  LicenceStatus,
  SubscriptionStatus,
} from "@rtb/platform-core";
import {
  INSTALLATION_STATUS_LABELS,
  LICENCE_STATUS_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
} from "@rtb/platform-core";
import { CommercialStatusChips } from "./commercial-status-chips";

function DimensionPill({
  label,
  value,
  tone,
  testId,
}: {
  label: string;
  value: string;
  tone: string;
  testId: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-col gap-0.5 rounded-md border px-2 py-1 text-xs",
        tone
      )}
      data-testid={testId}
    >
      <span className="text-[0.65rem] font-medium uppercase tracking-wide opacity-70">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

export function CommercialDimensionsPanel({
  subscriptionStatus,
  licenceStatus,
  installationStatus,
  seatUsage,
  trialEnd,
  entitlementAllowed,
  catalogueFallback,
}: {
  subscriptionStatus: SubscriptionStatus;
  licenceStatus: LicenceStatus;
  installationStatus: InstallationStatus;
  seatUsage?: { assigned: number; total: number };
  trialEnd?: string | null;
  entitlementAllowed?: boolean;
  catalogueFallback?: boolean;
}) {
  const isTrial = subscriptionStatus === "trialing";

  return (
    <div className="space-y-3" data-testid="commercial-dimensions">
      {catalogueFallback && (
        <p className="text-xs text-amber-700" data-testid="catalogue-fallback-inline">
          Registry fallback — live commerce dimensions may differ.
        </p>
      )}
      <CommercialStatusChips
        subscriptionStatus={subscriptionStatus}
        licenceStatus={licenceStatus}
        installationStatus={installationStatus}
      />
      <div className="flex flex-wrap gap-2">
        {seatUsage && (
          <DimensionPill
            label="Seats"
            value={`${seatUsage.assigned} / ${seatUsage.total}`}
            tone="border-indigo-200 bg-indigo-50 text-indigo-900"
            testId="status-seats"
          />
        )}
        <DimensionPill
          label="Trial"
          value={isTrial ? trialEnd ?? "Active" : "Not in trial"}
          tone={
            isTrial
              ? "border-violet-200 bg-violet-50 text-violet-900"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }
          testId="status-trial"
        />
        {entitlementAllowed !== undefined && (
          <DimensionPill
            label="Entitlement"
            value={entitlementAllowed ? "Granted" : "Denied"}
            tone={
              entitlementAllowed
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-900"
            }
            testId="status-entitlement"
          />
        )}
      </div>
    </div>
  );
}

export {
  SUBSCRIPTION_STATUS_LABELS,
  LICENCE_STATUS_LABELS,
  INSTALLATION_STATUS_LABELS,
};
