/**
 * Phase 12J — SolverCapabilityQualification.
 *
 * Capability qualification NEVER implies whole-solver qualification.
 * Does not auto-qualify reserved capabilities. Historic records are immutable.
 */

import type {
  CapabilityQualificationStatus,
  EngineeringSolverCapability,
} from "./engineering-solver-capability-registry";
import { CALCULIX_LINEAR_STATIC_CAPABILITY_ID } from "./engineering-solver-capability-registry";
import { LINEAR_ELASTIC_STATIC_METHOD_KEY } from "./solver-mappers";

export type SolverCapabilityQualification = {
  capabilityQualificationId: string;
  capabilityId: string;
  capabilityVersionId: string;
  solverId: string;
  status: CapabilityQualificationStatus;
  /** Explicit firewall — capability qual ≠ solver-wide qual. */
  impliesWholeSolverQualification: false;
  /** Link to method/provider/application/execution layers when applicable. */
  methodKeyRef?: string;
  providerIdRef?: string;
  applicationKeyRef?: string;
  executionQualificationRef?: string;
  reviewedBy?: string;
  decidedAt?: string;
  notes: string;
  historicImmutable: true;
  createdAt: string;
  updatedAt: string;
};

export function createCapabilityQualification(input: {
  capabilityQualificationId: string;
  capabilityId: string;
  capabilityVersionId: string;
  solverId: string;
  status: CapabilityQualificationStatus;
  methodKeyRef?: string;
  providerIdRef?: string;
  applicationKeyRef?: string;
  executionQualificationRef?: string;
  notes?: string;
}): SolverCapabilityQualification {
  if (input.status === "qualified" && input.capabilityId !== CALCULIX_LINEAR_STATIC_CAPABILITY_ID) {
    throw new Error(`capability_auto_qualify_forbidden:${input.capabilityId}`);
  }
  const now = new Date().toISOString();
  return {
    capabilityQualificationId: input.capabilityQualificationId,
    capabilityId: input.capabilityId,
    capabilityVersionId: input.capabilityVersionId,
    solverId: input.solverId,
    status: input.status,
    impliesWholeSolverQualification: false,
    methodKeyRef: input.methodKeyRef,
    providerIdRef: input.providerIdRef,
    applicationKeyRef: input.applicationKeyRef,
    executionQualificationRef: input.executionQualificationRef,
    notes: input.notes ?? "",
    historicImmutable: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function assertCapabilityDoesNotQualifySolver(
  qualification: SolverCapabilityQualification,
): { ok: true } {
  if (qualification.impliesWholeSolverQualification !== false) {
    throw new Error("capability_qualification_must_not_imply_whole_solver");
  }
  return { ok: true };
}

export function assertFourLayerSeparation(input: {
  capability: EngineeringSolverCapability;
  methodKey?: string;
  providerId?: string;
  applicationKey?: string;
  executionId?: string;
}): { ok: true; layersDistinct: true } {
  // Four-layer: capability ≠ method ≠ provider ≠ application ≠ execution
  const ids = [
    input.capability.capabilityId,
    input.methodKey,
    input.providerId,
    input.applicationKey,
    input.executionId,
  ].filter(Boolean) as string[];
  if (new Set(ids).size !== ids.length) {
    throw new Error("four_layer_qualification_ids_must_remain_distinct");
  }
  if (
    input.capability.qualificationStatus === "qualified" &&
    input.capability.capabilityId === CALCULIX_LINEAR_STATIC_CAPABILITY_ID &&
    input.methodKey &&
    input.methodKey !== LINEAR_ELASTIC_STATIC_METHOD_KEY
  ) {
    throw new Error("qualified_calculix_capability_must_link_linear_elastic_static");
  }
  return { ok: true, layersDistinct: true };
}

/** Historic qualifications cannot be mutated in place — revoke + new record only. */
export function revokeCapabilityQualification(
  prior: SolverCapabilityQualification,
  revokedBy: string,
  notes?: string,
): SolverCapabilityQualification {
  if (!prior.historicImmutable) {
    throw new Error("historic_qualification_must_be_immutable");
  }
  if (!revokedBy || revokedBy === "ai" || revokedBy === "system_auto") {
    throw new Error("automatic_or_ai_self_approval_forbidden");
  }
  const now = new Date().toISOString();
  return {
    ...prior,
    capabilityQualificationId: `${prior.capabilityQualificationId}:revoked:${now}`,
    status: "revoked",
    reviewedBy: revokedBy,
    decidedAt: now,
    notes: notes ?? prior.notes,
    updatedAt: now,
    historicImmutable: true,
    impliesWholeSolverQualification: false,
  };
}

export function seedCalculiXLinearStaticQualification(): SolverCapabilityQualification {
  return createCapabilityQualification({
    capabilityQualificationId: "cq-calculix-linear-elastic-static-12i",
    capabilityId: CALCULIX_LINEAR_STATIC_CAPABILITY_ID,
    capabilityVersionId: `${CALCULIX_LINEAR_STATIC_CAPABILITY_ID}@1.0.0`,
    solverId: "calculix",
    status: "qualified",
    methodKeyRef: LINEAR_ELASTIC_STATIC_METHOD_KEY,
    providerIdRef: "calculix",
    notes: "Phase 12I certified method linked as Phase 12J qualified capability.",
  });
}
