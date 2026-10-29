/**
 * Phase 12H — SimulationMethodQualification (layer 1).
 *
 * registered ≠ qualified. Fixture qualification proves framework only.
 * Statuses: draft → active → suspended → revoked → superseded.
 */

export const METHOD_QUALIFICATION_STATUSES = [
  "draft",
  "active",
  "suspended",
  "revoked",
  "superseded",
] as const;

export type MethodQualificationStatus = (typeof METHOD_QUALIFICATION_STATUSES)[number];

export const SIMULATION_ARTIFACT_CLASSES = [
  "input_manifest",
  "result_summary",
  "validation_record",
  "review_record",
  "environment_metadata",
  "property_refs",
  "boundary_refs",
  "load_case_refs",
  "discretization_refs",
  "reproducibility_assessment",
] as const;

export type SimulationArtifactClass = (typeof SIMULATION_ARTIFACT_CLASSES)[number];

export type SimulationMethodQualification = {
  methodQualificationId: string;
  tenantId: string;
  workspaceId: string;
  methodId: string;
  version: number;
  status: MethodQualificationStatus;
  /** Fixture-scoped qualification proves assurance framework — not engineering solver quality. */
  fixtureQualificationOnly: true;
  claimsNativeSolver: false;
  claimsUniversalAccuracy: false;
  requiredArtifactClasses: SimulationArtifactClass[];
  effectiveFrom: string;
  effectiveTo?: string;
  suspendedAt?: string;
  revokedAt?: string;
  supersededBy?: string;
  reviewSlug: "digital_twin.simulation_method_qualification_review";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export function createSimulationMethodQualification(input: {
  methodQualificationId: string;
  tenantId: string;
  workspaceId: string;
  methodId: string;
  requiredArtifactClasses?: SimulationArtifactClass[];
  effectiveFrom?: string;
  effectiveTo?: string;
  createdBy?: string;
  notes?: string;
}): SimulationMethodQualification {
  const now = new Date().toISOString();
  return {
    methodQualificationId: input.methodQualificationId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    methodId: input.methodId,
    version: 1,
    status: "draft",
    fixtureQualificationOnly: true,
    claimsNativeSolver: false,
    claimsUniversalAccuracy: false,
    requiredArtifactClasses: input.requiredArtifactClasses ?? [
      "input_manifest",
      "result_summary",
      "validation_record",
      "review_record",
      "environment_metadata",
    ],
    effectiveFrom: input.effectiveFrom ?? now,
    effectiveTo: input.effectiveTo,
    reviewSlug: "digital_twin.simulation_method_qualification_review",
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
}

export function canTransitionMethodQualificationStatus(
  from: MethodQualificationStatus,
  to: MethodQualificationStatus,
): boolean {
  const transitions: Record<MethodQualificationStatus, MethodQualificationStatus[]> = {
    draft: ["active", "revoked"],
    active: ["suspended", "revoked", "superseded"],
    suspended: ["active", "revoked", "superseded"],
    revoked: [],
    superseded: [],
  };
  return transitions[from].includes(to);
}

export function transitionMethodQualificationStatus(
  q: SimulationMethodQualification,
  to: MethodQualificationStatus,
  opts?: { supersededBy?: string },
): SimulationMethodQualification {
  if (!canTransitionMethodQualificationStatus(q.status, to)) {
    throw new Error(`invalid_method_qualification_transition:${q.status}->${to}`);
  }
  if (q.claimsNativeSolver) {
    throw new Error("native_solver_claim_forbidden");
  }
  const now = new Date().toISOString();
  const next: SimulationMethodQualification = {
    ...q,
    status: to,
    updatedAt: now,
    claimsNativeSolver: false,
    claimsUniversalAccuracy: false,
    fixtureQualificationOnly: true,
  };
  if (to === "suspended") next.suspendedAt = now;
  if (to === "revoked") next.revokedAt = now;
  if (to === "superseded") next.supersededBy = opts?.supersededBy;
  return next;
}

export function isMethodQualificationValidAt(
  q: SimulationMethodQualification,
  atIso: string,
): boolean {
  if (q.status === "revoked" || q.status === "superseded" || q.status === "draft") return false;
  if (q.status === "suspended") return false;
  if (q.claimsNativeSolver || q.claimsUniversalAccuracy) return false;
  const at = Date.parse(atIso);
  if (Number.isNaN(at)) return false;
  if (Date.parse(q.effectiveFrom) > at) return false;
  if (q.effectiveTo && Date.parse(q.effectiveTo) < at) return false;
  return q.status === "active";
}
