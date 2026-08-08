/**
 * Phase 12H — SimulationApplicationQualification (layer 3).
 *
 * Context-bounded Method+Provider permission. Not universally accurate.
 */

export const APPLICATION_QUALIFICATION_STATUSES = [
  "draft",
  "active",
  "suspended",
  "revoked",
  "superseded",
] as const;

export type ApplicationQualificationStatus = (typeof APPLICATION_QUALIFICATION_STATUSES)[number];

export type SimulationApplicationContext = {
  applicationKey: string;
  twinClass?: string;
  assetClass?: string;
  projectPhase?: string;
  geographyScope?: string;
  notes?: string;
};

export type SimulationApplicationQualification = {
  applicationQualificationId: string;
  tenantId: string;
  workspaceId: string;
  methodId: string;
  providerId: string;
  context: SimulationApplicationContext;
  version: number;
  status: ApplicationQualificationStatus;
  claimsUniversalAccuracy: false;
  engineeringApproved: false;
  effectiveFrom: string;
  effectiveTo?: string;
  suspendedAt?: string;
  revokedAt?: string;
  supersededBy?: string;
  reviewSlug: "digital_twin.simulation_application_qualification_review";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export function createSimulationApplicationQualification(input: {
  applicationQualificationId: string;
  tenantId: string;
  workspaceId: string;
  methodId: string;
  providerId: string;
  context: SimulationApplicationContext;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdBy?: string;
  notes?: string;
}): SimulationApplicationQualification {
  const now = new Date().toISOString();
  if (!input.context.applicationKey?.trim()) {
    throw new Error("application_context_key_required");
  }
  return {
    applicationQualificationId: input.applicationQualificationId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    methodId: input.methodId,
    providerId: input.providerId,
    context: { ...input.context },
    version: 1,
    status: "draft",
    claimsUniversalAccuracy: false,
    engineeringApproved: false,
    effectiveFrom: input.effectiveFrom ?? now,
    effectiveTo: input.effectiveTo,
    reviewSlug: "digital_twin.simulation_application_qualification_review",
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
}

export function canTransitionApplicationQualificationStatus(
  from: ApplicationQualificationStatus,
  to: ApplicationQualificationStatus,
): boolean {
  const transitions: Record<ApplicationQualificationStatus, ApplicationQualificationStatus[]> = {
    draft: ["active", "revoked"],
    active: ["suspended", "revoked", "superseded"],
    suspended: ["active", "revoked", "superseded"],
    revoked: [],
    superseded: [],
  };
  return transitions[from].includes(to);
}

export function transitionApplicationQualificationStatus(
  q: SimulationApplicationQualification,
  to: ApplicationQualificationStatus,
  opts?: { supersededBy?: string },
): SimulationApplicationQualification {
  if (!canTransitionApplicationQualificationStatus(q.status, to)) {
    throw new Error(`invalid_application_qualification_transition:${q.status}->${to}`);
  }
  if (q.claimsUniversalAccuracy || q.engineeringApproved) {
    throw new Error("application_qualification_must_not_claim_universal_or_engineering_approval");
  }
  const now = new Date().toISOString();
  const next: SimulationApplicationQualification = {
    ...q,
    status: to,
    updatedAt: now,
    claimsUniversalAccuracy: false,
    engineeringApproved: false,
  };
  if (to === "suspended") next.suspendedAt = now;
  if (to === "revoked") next.revokedAt = now;
  if (to === "superseded") next.supersededBy = opts?.supersededBy;
  return next;
}

export function isApplicationQualificationValidAt(
  q: SimulationApplicationQualification,
  atIso: string,
  methodId: string,
  providerId: string,
  applicationKey: string,
): boolean {
  if (q.methodId !== methodId || q.providerId !== providerId) return false;
  if (q.context.applicationKey !== applicationKey) return false;
  if (q.status === "revoked" || q.status === "superseded" || q.status === "draft") return false;
  if (q.status === "suspended") return false;
  if (q.claimsUniversalAccuracy || q.engineeringApproved) return false;
  const at = Date.parse(atIso);
  if (Number.isNaN(at)) return false;
  if (Date.parse(q.effectiveFrom) > at) return false;
  if (q.effectiveTo && Date.parse(q.effectiveTo) < at) return false;
  return q.status === "active";
}
