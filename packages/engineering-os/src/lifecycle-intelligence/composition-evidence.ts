/**
 * EOS-A15A-V5B-REPORTBIND — explicit cross-Work-Plan governed evidence reference.
 *
 * Reuses V4/V4C composition, source manifests, engineering_object_links, and
 * fingerprint staleness. Consumption is not ownership and is not execution.
 */

import { assertMtoProjectScope, type QuantityScope } from "./quantity-mto";
import { snapshotFromPersisted, type PersistedMtoSnapshot } from "./quantity-mto-persist";

export const A15A_V5B_REPORTBIND = {
  crossWorkPlanCalculationExecutionAllowed: false,
  crossWorkPlanMtoEvidenceReferenceAllowed: "YES_WITH_EXPLICIT_BINDING",
  implicitProjectWideLatestMto: false,
  sourceSelectionPrecedence: "EXPLICIT_BOUND_SOURCE_OVER_PLAN_LOCAL",
  newProvenanceSubsystem: false,
  newGraphStore: false,
  newSchema: false,
} as const;

export const A15A_V5B_REPORTBIND_HARDEN = {
  blockedRunId: "CANONICAL_RANDOM_UUID",
  kgNodeRequiredForV5b: false,
  unverifiedCalculationMutable: true,
  verifiedCalculationImmutable: true,
  sectionAndUnitMassDisplay: "NOT_REQUIRED_BY_CURRENT_TEMPLATE",
} as const;

export const A15A_V5B_PREISSUE_BIND = {
  canonicalSelector: "loadCompositionContext",
  sourceSelectionPrecedence: "EXPLICIT_BOUND_SOURCE_OVER_PLAN_LOCAL",
  silentPlanLocalFallbackWhenExplicitBindingExists: false,
  newSourceSelectorArchitecture: false,
  schemaChange: false,
  rlsChange: false,
  kgNodesAdded: false,
} as const;

export const COMPOSITION_EVIDENCE_RELATIONSHIP = "USES" as const;
export const COMPOSITION_EVIDENCE_FROM_TYPE = "engineering_work_plan" as const;
export const COMPOSITION_EVIDENCE_TO_TYPE = "engineering_mto_snapshot" as const;

export const COMPOSITION_BLOCK_CODES = [
  "COMPOSITION_SOURCE_NOT_AVAILABLE",
  "COMPOSITION_SOURCE_UNAUTHORIZED",
  "CROSS_TENANT",
  "CROSS_WORKSPACE",
  "CROSS_PROJECT_MISMATCH",
  "ENGINEERING_STATE_MISMATCH",
  "SOURCE_SUPERSEDED",
  "CROSS_WORK_PLAN_CALCULATION_EXECUTION_PROHIBITED",
] as const;
export type CompositionBlockCode = (typeof COMPOSITION_BLOCK_CODES)[number];

export type CompositionBindingKind = "EXPLICIT" | "PLAN_LOCAL" | "NONE";

export type CompositionEvidenceLink = {
  tenantId: string;
  fromType: typeof COMPOSITION_EVIDENCE_FROM_TYPE;
  fromId: string;
  toType: typeof COMPOSITION_EVIDENCE_TO_TYPE;
  toId: string;
  relationship: typeof COMPOSITION_EVIDENCE_RELATIONSHIP;
  createdAt: string;
  createdBy: string | null;
};

export type CompositionCalculationRef = {
  id: string;
  workPlanId: string;
  inputFingerprint: string;
  engineId: string | null;
  engineVersion?: string | null;
  method?: string | null;
  reviewStatus: string | null;
};

export type CompositionGenerationBlock = {
  code: CompositionBlockCode;
  explanation: string;
};

export type CompositionContext = {
  current: PersistedMtoSnapshot | null;
  previous: PersistedMtoSnapshot | null;
  bindingKind: CompositionBindingKind;
  selectedFingerprint: string | null;
  producingWorkPlanId: string | null;
  generationBlocked: CompositionGenerationBlock | null;
};

export function emptyCompositionContext(): CompositionContext {
  return {
    current: null,
    previous: null,
    bindingKind: "NONE",
    selectedFingerprint: null,
    producingWorkPlanId: null,
    generationBlocked: null,
  };
}

export function mtoInputRefs(snapshot: PersistedMtoSnapshot | null | undefined): string[] {
  if (!snapshot) return [];
  return [...new Set(snapshot.items.flatMap((item) => item.basis.inputRefs ?? []).filter(Boolean))];
}

export function mtoSourceCalculationId(snapshot: PersistedMtoSnapshot | null | undefined): string | null {
  if (!snapshot) return null;
  const ref = snapshot.items.map((item) => item.basis.sourceRef).find((value) => Boolean(value));
  return ref ?? null;
}

export function evaluateEngineeringStateCompatibility(input: {
  bindingKind: CompositionBindingKind;
  reportCalculationFingerprint?: string | null;
  mtoInputRefs: string[];
}): { ok: true } | { ok: false; code: "ENGINEERING_STATE_MISMATCH" } {
  const fingerprint = input.reportCalculationFingerprint;
  if (!fingerprint) return { ok: true };
  if (input.bindingKind === "NONE") return { ok: true };
  if (input.mtoInputRefs.includes(fingerprint)) return { ok: true };
  if (input.bindingKind === "PLAN_LOCAL" && input.mtoInputRefs.length === 0) return { ok: true };
  return { ok: false, code: "ENGINEERING_STATE_MISMATCH" };
}

export function assertCompositionEvidenceScope(
  snapshot: PersistedMtoSnapshot,
  scope: QuantityScope,
): "ok" | "CROSS_TENANT" | "CROSS_WORKSPACE" | "CROSS_PROJECT_MISMATCH" {
  return assertMtoProjectScope(snapshotFromPersisted(snapshot), scope);
}

export function compositionBlock(code: CompositionBlockCode, explanation: string): CompositionGenerationBlock {
  return { code, explanation };
}

export function selectExplicitOverPlanLocal(input: {
  explicit: PersistedMtoSnapshot | null;
  planLocal: PersistedMtoSnapshot | null;
}): { snapshot: PersistedMtoSnapshot | null; bindingKind: CompositionBindingKind } {
  if (input.explicit) return { snapshot: input.explicit, bindingKind: "EXPLICIT" };
  if (input.planLocal) return { snapshot: input.planLocal, bindingKind: "PLAN_LOCAL" };
  return { snapshot: null, bindingKind: "NONE" };
}

export type PreIssueQuantityEvidence = {
  items: PersistedMtoSnapshot["items"] | undefined;
  staleness: string | undefined;
  fingerprint: string | null;
  revision: string | null;
  snapshotId: string | null;
  status: string | null;
  verificationState: string | null;
  bindingKind: CompositionBindingKind;
  generationBlocked: CompositionGenerationBlock | null;
  producingWorkPlanId: string | null;
  inputRefs: string[];
};

export function preIssueQuantityEvidenceFromComposition(ctx: CompositionContext): PreIssueQuantityEvidence {
  const current = ctx.generationBlocked ? null : ctx.current;
  return {
    items: current?.items,
    staleness: current?.staleness,
    fingerprint: current?.snapshotFingerprint ?? null,
    revision: current?.revision ?? null,
    snapshotId: current?.id ?? null,
    status: current?.status ?? null,
    verificationState: current?.verificationState ?? null,
    bindingKind: ctx.bindingKind,
    generationBlocked: ctx.generationBlocked,
    producingWorkPlanId: ctx.producingWorkPlanId,
    inputRefs: current ? mtoInputRefs(current) : [],
  };
}

export function selectCurrentGovernedReviewArtifacts<T extends {
  status?: string;
  provenance?: { mtoSnapshotId?: string | null };
}>(input: {
  artifacts: T[];
  bindingKind: CompositionBindingKind;
  explicitMtoSnapshotId?: string | null;
}): T[] {
  const active = input.artifacts.filter((row) => row.status !== "SUPERSEDED");
  if (input.bindingKind === "EXPLICIT" && input.explicitMtoSnapshotId) {
    return active.filter((row) => {
      const bound = row.provenance?.mtoSnapshotId ?? null;
      if (!bound) return true;
      return bound === input.explicitMtoSnapshotId;
    });
  }
  return active;
}
