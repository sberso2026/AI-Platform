import type { StructuralEvidenceBinding } from "@rtb/types";
import {
  D1C_TORSIONAL_ACTION_AXIS,
  D1C_TORSIONAL_ACTION_ID,
  D1C_TORSIONAL_ACTION_SIGN_CONVENTION,
  D1C_TORSIONAL_ACTION_TYPE,
  D1C_TORSIONAL_ACTION_UNIT,
  GENERAL_TORSIONAL_ANALYSIS_IMPLEMENTED,
} from "@rtb/types";

export type GovernedTorsionalActionDraft = {
  value?: number;
  unit?: string;
  axis?: string;
  combinationId?: string;
  provenance?: {
    evidenceId?: string;
    sourceDiscipline?: string;
    sourceObjectId?: string;
    revision?: string;
  } | null;
};

export type TransportedTorsionalAction = {
  status: "TRANSPORTED";
  actionId: typeof D1C_TORSIONAL_ACTION_ID;
  actionType: typeof D1C_TORSIONAL_ACTION_TYPE;
  signedValueNm: number;
  unit: typeof D1C_TORSIONAL_ACTION_UNIT;
  axis: typeof D1C_TORSIONAL_ACTION_AXIS;
  signConvention: typeof D1C_TORSIONAL_ACTION_SIGN_CONVENTION;
  combinationId: string;
  provenance: {
    evidenceId: string;
    sourceDiscipline: string;
    sourceObjectId: string;
    revision: string;
  };
  fingerprint: string;
};

function fingerprint(canonical: string): string {
  let hash = 2166136261;
  for (let i = 0; i < canonical.length; i += 1) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fp:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function requiredText(value: string | undefined, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`governed torsional action is missing ${label}`);
  }
  return value;
}

export function transportGovernedTorsionalAction(
  draft: GovernedTorsionalActionDraft,
  context: { combinationId: string | null; evidenceRefs: readonly StructuralEvidenceBinding[] },
): TransportedTorsionalAction {
  if (GENERAL_TORSIONAL_ANALYSIS_IMPLEMENTED) {
    throw new Error("torsional action transport must not calculate torsion");
  }
  if (!draft || typeof draft !== "object") {
    throw new Error("governed torsional action is missing value");
  }
  if (typeof draft.value !== "number") {
    throw new Error("governed torsional action is missing value");
  }
  if (!Number.isFinite(draft.value)) {
    throw new Error("governed torsional action value must be finite");
  }
  if (draft.unit !== "N.m" && draft.unit !== "kN.m") {
    throw new Error("governed torsional action unit is not supported");
  }
  if (draft.axis !== D1C_TORSIONAL_ACTION_AXIS) {
    throw new Error("governed torsional action axis is not supported");
  }
  const combinationId = requiredText(draft.combinationId, "combination provenance");
  if (!context.combinationId || combinationId !== context.combinationId) {
    throw new Error("governed torsional action combination does not match the demand combination");
  }
  const provenance = draft.provenance;
  if (!provenance) throw new Error("governed torsional action is missing provenance");
  const evidenceId = requiredText(provenance.evidenceId, "provenance");
  const sourceDiscipline = requiredText(provenance.sourceDiscipline, "provenance");
  const sourceObjectId = requiredText(provenance.sourceObjectId, "provenance");
  const revision = requiredText(provenance.revision, "provenance");
  if (!context.evidenceRefs.some((row) => row.evidenceId === evidenceId)) {
    throw new Error("governed torsional action provenance is not in the demand evidence set");
  }
  const signedValueNm = draft.unit === "kN.m" ? draft.value * 1000 : draft.value;
  const bound = {
    evidenceId,
    sourceDiscipline,
    sourceObjectId,
    revision,
  };
  return {
    status: "TRANSPORTED",
    actionId: D1C_TORSIONAL_ACTION_ID,
    actionType: D1C_TORSIONAL_ACTION_TYPE,
    signedValueNm,
    unit: D1C_TORSIONAL_ACTION_UNIT,
    axis: D1C_TORSIONAL_ACTION_AXIS,
    signConvention: D1C_TORSIONAL_ACTION_SIGN_CONVENTION,
    combinationId,
    provenance: bound,
    fingerprint: fingerprint(JSON.stringify({
      actionId: D1C_TORSIONAL_ACTION_ID,
      signedValueNm,
      unit: D1C_TORSIONAL_ACTION_UNIT,
      axis: D1C_TORSIONAL_ACTION_AXIS,
      combinationId,
      provenance: bound,
    })),
  };
}
