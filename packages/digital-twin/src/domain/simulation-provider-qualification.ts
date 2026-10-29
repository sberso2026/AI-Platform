/**
 * Phase 12H — SimulationProviderQualification (layer 2).
 *
 * Method-specific. Does NOT auto-inherit qualification across all methods.
 */

export const PROVIDER_QUALIFICATION_STATUSES = [
  "draft",
  "active",
  "suspended",
  "revoked",
  "superseded",
] as const;

export type ProviderQualificationStatus = (typeof PROVIDER_QUALIFICATION_STATUSES)[number];

export type SimulationProviderQualification = {
  providerQualificationId: string;
  tenantId: string;
  workspaceId: string;
  providerId: string;
  /** Bound to a specific method — no cross-method auto-inherit. */
  methodId: string;
  version: number;
  status: ProviderQualificationStatus;
  autoInheritsAllMethods: false;
  fixtureQualificationOnly: true;
  claimsNativeSolver: false;
  externalSolverAdapterActivated: false;
  effectiveFrom: string;
  effectiveTo?: string;
  suspendedAt?: string;
  revokedAt?: string;
  supersededBy?: string;
  reviewSlug: "digital_twin.simulation_provider_qualification_review";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export function createSimulationProviderQualification(input: {
  providerQualificationId: string;
  tenantId: string;
  workspaceId: string;
  providerId: string;
  methodId: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdBy?: string;
  notes?: string;
}): SimulationProviderQualification {
  const now = new Date().toISOString();
  return {
    providerQualificationId: input.providerQualificationId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    providerId: input.providerId,
    methodId: input.methodId,
    version: 1,
    status: "draft",
    autoInheritsAllMethods: false,
    fixtureQualificationOnly: true,
    claimsNativeSolver: false,
    externalSolverAdapterActivated: false,
    effectiveFrom: input.effectiveFrom ?? now,
    effectiveTo: input.effectiveTo,
    reviewSlug: "digital_twin.simulation_provider_qualification_review",
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
}

export function canTransitionProviderQualificationStatus(
  from: ProviderQualificationStatus,
  to: ProviderQualificationStatus,
): boolean {
  const transitions: Record<ProviderQualificationStatus, ProviderQualificationStatus[]> = {
    draft: ["active", "revoked"],
    active: ["suspended", "revoked", "superseded"],
    suspended: ["active", "revoked", "superseded"],
    revoked: [],
    superseded: [],
  };
  return transitions[from].includes(to);
}

export function transitionProviderQualificationStatus(
  q: SimulationProviderQualification,
  to: ProviderQualificationStatus,
  opts?: { supersededBy?: string },
): SimulationProviderQualification {
  if (!canTransitionProviderQualificationStatus(q.status, to)) {
    throw new Error(`invalid_provider_qualification_transition:${q.status}->${to}`);
  }
  if (q.autoInheritsAllMethods) {
    throw new Error("provider_qualification_must_not_auto_inherit_all_methods");
  }
  if (q.externalSolverAdapterActivated) {
    throw new Error("external_solver_adapter_activation_forbidden");
  }
  const now = new Date().toISOString();
  const next: SimulationProviderQualification = {
    ...q,
    status: to,
    updatedAt: now,
    autoInheritsAllMethods: false,
    claimsNativeSolver: false,
    externalSolverAdapterActivated: false,
    fixtureQualificationOnly: true,
  };
  if (to === "suspended") next.suspendedAt = now;
  if (to === "revoked") next.revokedAt = now;
  if (to === "superseded") next.supersededBy = opts?.supersededBy;
  return next;
}

export function isProviderQualificationValidAt(
  q: SimulationProviderQualification,
  atIso: string,
  methodId: string,
): boolean {
  if (q.methodId !== methodId) return false;
  if (q.autoInheritsAllMethods) return false;
  if (q.status === "revoked" || q.status === "superseded" || q.status === "draft") return false;
  if (q.status === "suspended") return false;
  if (q.claimsNativeSolver || q.externalSolverAdapterActivated) return false;
  const at = Date.parse(atIso);
  if (Number.isNaN(at)) return false;
  if (Date.parse(q.effectiveFrom) > at) return false;
  if (q.effectiveTo && Date.parse(q.effectiveTo) < at) return false;
  return q.status === "active";
}
