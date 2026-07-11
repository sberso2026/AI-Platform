import type { InstallationStatus } from "../commerce/commerce-types";
import type {
  InstallationProgressStepView,
  InstallationProgressView,
  InstallationWorkflowStepStatus,
} from "./administration-types";
import { normalizeHealthStatus } from "./status-normalizers";

export const CUSTOMER_INSTALLATION_STEP_DEFS: Array<{
  key: string;
  label: string;
  internalKeys: string[];
}> = [
  { key: "request_received", label: "Request received", internalKeys: [] },
  { key: "subscription_verified", label: "Subscription verified", internalKeys: ["entitlement_verified"] },
  { key: "licence_verified", label: "Licence verified", internalKeys: ["entitlement_verified"] },
  { key: "dependencies_validated", label: "Dependencies validated", internalKeys: ["dependencies_validated"] },
  { key: "provisioning_queued", label: "Provisioning queued", internalKeys: ["provisioning"] },
  { key: "provisioning_running", label: "Provisioning running", internalKeys: ["provisioning"] },
  { key: "artifacts_validated", label: "Artifacts validated", internalKeys: ["validation"] },
  { key: "workspace_assignment", label: "Workspace assignment", internalKeys: ["workspace_assignment"] },
  { key: "health_verification", label: "Health verification", internalKeys: ["validation"] },
  { key: "activation_complete", label: "Activation complete", internalKeys: ["activation"] },
];

export interface RawWorkflowStep {
  step_key: string;
  step_order?: number;
  status: string;
  started_at?: string | null;
  completed_at?: string | null;
  error_code?: string | null;
  error_message?: string | null;
}

export interface RawInstallationRecord {
  id: string;
  status: string;
  product_id?: string;
  metadata?: Record<string, unknown>;
}

function mapInternalStepStatus(status: string): InstallationWorkflowStepStatus {
  switch (status) {
    case "completed":
      return "completed";
    case "in_progress":
    case "running":
      return "in_progress";
    case "failed":
      return "failed";
    case "skipped":
      return "skipped";
    default:
      return "pending";
  }
}

function durationMs(start?: string | null, end?: string | null): number | undefined {
  if (!start || !end) return undefined;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return ms >= 0 ? ms : undefined;
}

function resolveCustomerStepStatus(
  defKey: string,
  internalSteps: RawWorkflowStep[],
  installationStatus: string
): InstallationWorkflowStepStatus {
  const def = CUSTOMER_INSTALLATION_STEP_DEFS.find((d) => d.key === defKey);
  if (!def) return "pending";

  if (defKey === "request_received") {
    if (installationStatus !== "not_installed") return "completed";
    return "pending";
  }

  if (def.internalKeys.length === 0) {
    return "pending";
  }

  const matches = internalSteps.filter((s) => def.internalKeys.includes(s.step_key));
  if (matches.length === 0) return "pending";

  if (defKey === "provisioning_queued") {
    const prov = matches[0];
    if (prov.status === "pending") return "completed";
    if (prov.status === "in_progress" || prov.status === "running") return "pending";
  }

  if (defKey === "provisioning_running") {
    const prov = matches[0];
    if (prov.status === "in_progress" || prov.status === "running") return "in_progress";
    if (prov.status === "completed") return "completed";
    if (prov.status === "failed") return "failed";
    return "pending";
  }

  if (defKey === "subscription_verified" || defKey === "licence_verified") {
    const ent = internalSteps.find((s) => s.step_key === "entitlement_verified");
    if (!ent) return "pending";
    if (ent.status === "completed") return "completed";
    if (ent.status === "failed") return "failed";
    if (ent.status === "in_progress" || ent.status === "running") {
      return defKey === "subscription_verified" ? "completed" : "in_progress";
    }
    return "pending";
  }

  const primary = matches[matches.length - 1];
  return mapInternalStepStatus(primary.status);
}

function stepTimings(
  defKey: string,
  internalSteps: RawWorkflowStep[]
): Pick<InstallationProgressStepView, "startedAt" | "completedAt" | "durationMs" | "errorCode"> {
  const def = CUSTOMER_INSTALLATION_STEP_DEFS.find((d) => d.key === defKey);
  if (!def || def.internalKeys.length === 0) return {};

  const matches = internalSteps.filter((s) => def.internalKeys.includes(s.step_key));
  if (matches.length === 0) return {};

  const startedAt = matches.map((m) => m.started_at).find(Boolean) ?? undefined;
  const completedAt = matches.map((m) => m.completed_at).find(Boolean) ?? undefined;
  const errorCode = matches.map((m) => m.error_code).find(Boolean) ?? undefined;

  return {
    startedAt: startedAt ?? undefined,
    completedAt: completedAt ?? undefined,
    durationMs: durationMs(startedAt, completedAt),
    errorCode: errorCode ?? undefined,
  };
}

export function mapInstallationProgress(input: {
  installation: RawInstallationRecord;
  workflowSteps: RawWorkflowStep[];
  productSlug?: string;
  productName?: string;
  healthCheckStatus?: string;
}): InstallationProgressView {
  const installationStatus = input.installation.status as InstallationStatus;
  const steps: InstallationProgressStepView[] = CUSTOMER_INSTALLATION_STEP_DEFS.map((def) => {
    const status = resolveCustomerStepStatus(def.key, input.workflowSteps, input.installation.status);
    const timings = stepTimings(def.key, input.workflowSteps);

    return {
      key: def.key,
      label: def.label,
      status,
      ...timings,
      evidenceSummary:
        status === "completed"
          ? `${def.label} verified`
          : status === "failed"
            ? "Step failed — see error reference"
            : undefined,
    };
  });

  const failedStep = input.workflowSteps.find((s) => s.status === "failed");
  const failure =
    installationStatus === "failed" && failedStep
      ? {
          title: "Installation could not complete",
          explanation:
            failedStep.error_message ??
            "The installation workflow encountered an error. Retry when permitted or contact support.",
          referenceCode: failedStep.error_code ?? "INSTALLATION_FAILED",
          canRetry: true,
        }
      : undefined;

  return {
    installationId: input.installation.id,
    productSlug: input.productSlug,
    productName: input.productName,
    installationStatus,
    healthStatus: normalizeHealthStatus({
      installationStatus,
      healthCheckStatus: input.healthCheckStatus,
    }),
    steps,
    failure,
  };
}
