/**
 * Phase 13C — Four-layer SPACE GASS qualification records.
 * Semantics follow Digital Twin Simulation*Qualification layers
 * (method → provider → application → execution) without forking meaning.
 *
 * Qualifies adapter contract + mapping + fail-closed path for
 * linear_elastic_static. Does NOT claim spaceGassHostedExecutionCertified.
 */

import {
  SPACEGASS_BOUNDED_METHOD,
  SPACEGASS_PROVIDER_KEY,
} from "./spacegass-version";

export const SPACEGASS_QUALIFICATION_STATUSES = [
  "draft",
  "active",
  "suspended",
  "revoked",
  "superseded",
] as const;

export type SpaceGassQualificationStatus =
  (typeof SPACEGASS_QUALIFICATION_STATUSES)[number];

export type SpaceGassQualificationLayer =
  | "method"
  | "provider"
  | "application"
  | "execution";

export type SpaceGassQualificationRecord = {
  qualificationId: string;
  layer: SpaceGassQualificationLayer;
  providerKey: typeof SPACEGASS_PROVIDER_KEY;
  methodKey: typeof SPACEGASS_BOUNDED_METHOD;
  status: SpaceGassQualificationStatus;
  /** True: fixture/dry-run evidence for adapter gates — not hosted binary certification. */
  fixtureOrDryRunEvidence: true;
  claimsHostedExecutionCertified: false;
  claimsNativeSolverOwnership: false;
  evidenceNotes: string;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
};

export type SpaceGassFourLayerQualificationBundle = {
  method: SpaceGassQualificationRecord;
  provider: SpaceGassQualificationRecord;
  application: SpaceGassQualificationRecord;
  execution: SpaceGassQualificationRecord;
  selectedMethod: typeof SPACEGASS_BOUNDED_METHOD;
  spaceGassHostedExecutionCertified: false;
};

function record(
  layer: SpaceGassQualificationLayer,
  idSuffix: string,
  notes: string,
  now: string,
): SpaceGassQualificationRecord {
  return {
    qualificationId: `sg_qual_${layer}_${idSuffix}`,
    layer,
    providerKey: SPACEGASS_PROVIDER_KEY,
    methodKey: SPACEGASS_BOUNDED_METHOD,
    status: "active",
    fixtureOrDryRunEvidence: true,
    claimsHostedExecutionCertified: false,
    claimsNativeSolverOwnership: false,
    evidenceNotes: notes,
    effectiveFrom: now,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Build the Phase 13C qualification bundle for linear_elastic_static.
 * Execution-layer qualification covers fail-closed / negative benchmarks,
 * not positive hosted process certification.
 */
export function createSpaceGassFourLayerQualificationBundle(input?: {
  evidenceId?: string;
}): SpaceGassFourLayerQualificationBundle {
  const now = new Date().toISOString();
  const id = input?.evidenceId ?? "phase13c";
  return {
    selectedMethod: SPACEGASS_BOUNDED_METHOD,
    spaceGassHostedExecutionCertified: false,
    method: record(
      "method",
      id,
      "Method linear_elastic_static selected; aligns with DT V1 CalculiX capability class.",
      now,
    ),
    provider: record(
      "provider",
      id,
      "SPACE GASS provider adapter contract + probe/license/policy gates recorded.",
      now,
    ),
    application: record(
      "application",
      id,
      "Input/output mappers + projectApprovedProviders abstain path validated.",
      now,
    ),
    execution: record(
      "execution",
      id,
      "Fail-closed execution path + negative benchmarks (unavailable/wrong_version/unapproved). Hosted certified=false.",
      now,
    ),
  };
}

export function assertSpaceGassFourLayerQualification(
  bundle: SpaceGassFourLayerQualificationBundle,
): {
  ok: true;
  SPACEGASSFirstMethodQualified: true;
  SPACEGASSFirstProviderQualified: true;
  SPACEGASSFirstApplicationQualified: true;
  SPACEGASSFirstExecutionQualified: true;
  spaceGassHostedExecutionCertified: false;
} {
  for (const layer of ["method", "provider", "application", "execution"] as const) {
    const r = bundle[layer];
    if (r.status !== "active") {
      throw new Error(`spacegass_${layer}_qualification_inactive`);
    }
    if (r.methodKey !== SPACEGASS_BOUNDED_METHOD) {
      throw new Error(`spacegass_${layer}_method_mismatch`);
    }
    if (r.claimsHostedExecutionCertified) {
      throw new Error("spacegass_must_not_claim_hosted_execution_certified");
    }
    if (!r.fixtureOrDryRunEvidence) {
      throw new Error(`spacegass_${layer}_evidence_required`);
    }
  }
  if (bundle.spaceGassHostedExecutionCertified) {
    throw new Error("spacegass_hosted_execution_certified_must_be_false");
  }
  return {
    ok: true,
    SPACEGASSFirstMethodQualified: true,
    SPACEGASSFirstProviderQualified: true,
    SPACEGASSFirstApplicationQualified: true,
    SPACEGASSFirstExecutionQualified: true,
    spaceGassHostedExecutionCertified: false,
  };
}
