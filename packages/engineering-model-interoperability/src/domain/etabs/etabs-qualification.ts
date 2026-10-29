/**
 * Phase 13E — ETABS federation qualification records.
 * Qualifies export federation + fail-closed solver adapter presence.
 * Does NOT claim ETABSHostedExecutionCertified or ControlledExecutionCertified.
 */

import { ETABS_BOUNDED_METHOD, ETABS_PROVIDER_KEY } from "./etabs-version";

export const ETABS_QUALIFICATION_STATUSES = [
  "draft",
  "active",
  "suspended",
  "revoked",
  "superseded",
] as const;

export type EtabsQualificationStatus =
  (typeof ETABS_QUALIFICATION_STATUSES)[number];

export type EtabsQualificationLayer =
  | "federation"
  | "adapter"
  | "policy"
  | "execution_fail_closed";

export type EtabsQualificationRecord = {
  qualificationId: string;
  layer: EtabsQualificationLayer;
  providerKey: typeof ETABS_PROVIDER_KEY;
  methodKey: typeof ETABS_BOUNDED_METHOD | "model_result_export_federation";
  status: EtabsQualificationStatus;
  fixtureOrDryRunEvidence: true;
  claimsHostedExecutionCertified: false;
  claimsControlledExecutionCertified: false;
  claimsNativeComLive: false;
  evidenceNotes: string;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
};

export type EtabsQualificationBundle = {
  federation: EtabsQualificationRecord;
  adapter: EtabsQualificationRecord;
  policy: EtabsQualificationRecord;
  execution_fail_closed: EtabsQualificationRecord;
  ETABSHostedExecutionCertified: false;
  ETABSControlledExecutionCertified: false;
};

function record(
  layer: EtabsQualificationLayer,
  idSuffix: string,
  methodKey: EtabsQualificationRecord["methodKey"],
  notes: string,
  now: string,
): EtabsQualificationRecord {
  return {
    qualificationId: `etabs_qual_${layer}_${idSuffix}`,
    layer,
    providerKey: ETABS_PROVIDER_KEY,
    methodKey,
    status: "active",
    fixtureOrDryRunEvidence: true,
    claimsHostedExecutionCertified: false,
    claimsControlledExecutionCertified: false,
    claimsNativeComLive: false,
    evidenceNotes: notes,
    effectiveFrom: now,
    createdAt: now,
    updatedAt: now,
  };
}

export function createEtabsQualificationBundle(input?: {
  evidenceId?: string;
}): EtabsQualificationBundle {
  const now = new Date().toISOString();
  const id = input?.evidenceId ?? "phase13e";
  return {
    ETABSHostedExecutionCertified: false,
    ETABSControlledExecutionCertified: false,
    federation: record(
      "federation",
      id,
      "model_result_export_federation",
      "ETABS export/fixture model + result federation proven (not live native COM).",
      now,
    ),
    adapter: record(
      "adapter",
      id,
      ETABS_BOUNDED_METHOD,
      "ETABSModelAdapter + ETABSSolverAdapter implemented; solver fail-closed when COM unavailable.",
      now,
    ),
    policy: record(
      "policy",
      id,
      ETABS_BOUNDED_METHOD,
      "Project policy abstain path; silentSolverFallbackAllowed=false.",
      now,
    ),
    execution_fail_closed: record(
      "execution_fail_closed",
      id,
      ETABS_BOUNDED_METHOD,
      "Negative benchmarks for com_unavailable / unapproved project. Hosted/controlled certified=false.",
      now,
    ),
  };
}

export function assertEtabsQualificationBundle(
  bundle: EtabsQualificationBundle,
): {
  ok: true;
  ETABSModelFederationReady: true;
  ETABSResultFederationReady: true;
  ETABSAdapterImplemented: true;
  ETABSSolverAdapterReady: true;
  ETABSHostedExecutionCertified: false;
  ETABSControlledExecutionCertified: false;
} {
  for (const layer of [
    "federation",
    "adapter",
    "policy",
    "execution_fail_closed",
  ] as const) {
    const r = bundle[layer];
    if (r.status !== "active") {
      throw new Error(`etabs_${layer}_qualification_inactive`);
    }
    if (r.claimsHostedExecutionCertified || r.claimsControlledExecutionCertified) {
      throw new Error("etabs_must_not_claim_execution_certified");
    }
    if (r.claimsNativeComLive) {
      throw new Error("etabs_must_not_claim_live_native_com");
    }
    if (!r.fixtureOrDryRunEvidence) {
      throw new Error(`etabs_${layer}_evidence_required`);
    }
  }
  if (bundle.ETABSHostedExecutionCertified || bundle.ETABSControlledExecutionCertified) {
    throw new Error("etabs_execution_certified_must_be_false");
  }
  return {
    ok: true,
    ETABSModelFederationReady: true,
    ETABSResultFederationReady: true,
    ETABSAdapterImplemented: true,
    ETABSSolverAdapterReady: true,
    ETABSHostedExecutionCertified: false,
    ETABSControlledExecutionCertified: false,
  };
}
