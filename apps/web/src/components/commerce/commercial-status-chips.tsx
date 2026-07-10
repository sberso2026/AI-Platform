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

const SUBSCRIPTION_TONE: Record<SubscriptionStatus, string> = {
  trialing: "border-violet-200 bg-violet-50 text-violet-900",
  active: "border-emerald-200 bg-emerald-50 text-emerald-900",
  past_due: "border-amber-200 bg-amber-50 text-amber-900",
  cancelled: "border-slate-200 bg-slate-100 text-slate-700",
  expired: "border-slate-200 bg-slate-50 text-slate-600",
};

const LICENCE_TONE: Record<LicenceStatus, string> = {
  active: "border-sky-200 bg-sky-50 text-sky-900",
  suspended: "border-amber-200 bg-amber-50 text-amber-900",
  expired: "border-slate-200 bg-slate-50 text-slate-600",
};

const INSTALLATION_TONE: Partial<Record<InstallationStatus, string>> & Record<string, string> = {
  not_installed: "border-slate-200 bg-slate-50 text-slate-600",
  requested: "border-blue-200 bg-blue-50 text-blue-900",
  provisioning: "border-blue-200 bg-blue-50 text-blue-900",
  installing: "border-blue-200 bg-blue-50 text-blue-900",
  validating: "border-blue-200 bg-blue-50 text-blue-900",
  active: "border-emerald-200 bg-emerald-50 text-emerald-900",
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-900",
  degraded: "border-amber-200 bg-amber-50 text-amber-900",
  suspended: "border-amber-200 bg-amber-50 text-amber-900",
  failed: "border-red-200 bg-red-50 text-red-900",
  uninstalling: "border-slate-200 bg-slate-100 text-slate-700",
  uninstalled: "border-slate-200 bg-slate-50 text-slate-600",
};

function StatusPill({
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
      data-status={value}
    >
      <span className="text-[0.65rem] font-medium uppercase tracking-wide opacity-70">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

export function CommercialStatusChips({
  subscriptionStatus,
  licenceStatus,
  installationStatus,
}: {
  subscriptionStatus: SubscriptionStatus;
  licenceStatus: LicenceStatus;
  installationStatus: InstallationStatus;
}) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="commercial-status-chips">
      <StatusPill
        label="Subscription"
        value={SUBSCRIPTION_STATUS_LABELS[subscriptionStatus]}
        tone={SUBSCRIPTION_TONE[subscriptionStatus]}
        testId="status-subscription"
      />
      <StatusPill
        label="Licence"
        value={LICENCE_STATUS_LABELS[licenceStatus]}
        tone={LICENCE_TONE[licenceStatus]}
        testId="status-licence"
      />
      <StatusPill
        label="Installation"
        value={INSTALLATION_STATUS_LABELS[installationStatus]}
        tone={INSTALLATION_TONE[installationStatus] ?? INSTALLATION_TONE.not_installed!}
        testId="status-installation"
      />
    </div>
  );
}
