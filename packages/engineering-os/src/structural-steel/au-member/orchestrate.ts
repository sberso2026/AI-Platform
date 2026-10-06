import type {
  SteelCapacityEngineInput,
  SteelCheckVerdict,
  SteelDesignCheckOutcome,
  SteelIncompleteReason,
  SteelMemberCompletenessState,
  SteelMemberDesignCheckKind,
  SteelMemberDesignCheckRow,
  SteelMemberDesignFingerprint,
  SteelMemberDesignRecord,
  SteelMemberHumanReviewState,
  SteelMethodMaturity,
  SteelOptimizationCandidate,
  SteelOtherServiceabilityMode,
  SteelServiceabilityContext,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  AI_MEMBER_DESIGN_EXPLANATION_ADVISORY_ONLY,
  AI_SECTION_SELECTION_EQUALS_APPROVAL,
  AU6_AUTOMATIC_APPROVAL,
  AU_MEMBER_PILOT_EXPOSURE,
  AU_STEEL_IMPLEMENTATION_MATURITY,
  CANDIDATE_FULL_DETERMINISTIC_RECHECK_REQUIRED,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  LLM_STEEL_CAPACITY_AUTHORITY,
  MEMBER_CHECK_EQUALS_CONNECTION_CHECK,
  MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL,
  ORCHESTRATION_EQUALS_CODE_CERTIFICATION,
  STEEL_MEMBER_DESIGN_CHECK_KINDS,
  UNIVERSAL_MEMBER_UTILIZATION,
  VIBRATION_DESIGN_IMPLEMENTED,
} from "@rtb/types";
import { IMPLEMENTED_INTERACTION_METHODS } from "../au-combined/registry";
import { AU_BENDING_IMPLEMENTATION_VERSION } from "../au-bending/registry";
import { AU_COMBINED_IMPLEMENTATION_VERSION } from "../au-combined/registry";
import { AU_COMPRESSION_IMPLEMENTATION_VERSION } from "../au-compression/registry";
import { AU_SHEAR_IMPLEMENTATION_VERSION } from "../au-shear/registry";
import { AU_TENSION_IMPLEMENTATION_VERSION } from "../au-tension/registry";
import { assertNotCertified } from "../au-tension/confirmation";
import { assertAuSteelStandardProfile } from "../au-tension/profile";
import { AU_TENSION_GROSS_YIELD_RULE } from "../au-tension/registry";
import {
  assertOptimizationCandidateRecheck,
  orchestrateAuBendingDesignCheck,
  orchestrateAuCombinedActionDesignCheck,
  orchestrateAuCompressionDesignCheck,
  orchestrateAuShearDesignCheck,
  orchestrateAuTensionDesignCheck,
} from "../orchestrate";
import { aggregateCompleteness, aggregateEngineeringCheckState, selectGoverningCheck } from "./aggregate";
import { resolveMemberApplicability } from "./applicability";
import { assertStaleResultsNotReused, invalidationTags, memberDesignFingerprint } from "./invalidation";
import { assertGovernedReportLanguage, checkRowReportLanguage, governedReportLanguage } from "./language";
import { AU_MEMBER_IMPLEMENTATION_VERSION, AU_MEMBER_TOOL_REF } from "./registry";
import { evaluateAuSteelServiceability, type ServiceabilityDemand } from "./serviceability";

export type SteelMemberDesignInput = {
  designRecordId: string;
  createdAt: string;
  version: number;
  capacityInput: SteelCapacityEngineInput;
  serviceability?: {
    context: SteelServiceabilityContext | null;
    demand: ServiceabilityDemand | null;
  } | null;
  otherServiceabilityModes?: readonly SteelOtherServiceabilityMode[];
  previousFingerprint?: SteelMemberDesignFingerprint | null;
  reuseStaleResults?: boolean;
  humanReviewState?: SteelMemberHumanReviewState;
};

function naRow(kind: SteelMemberDesignCheckKind): SteelMemberDesignCheckRow {
  return {
    checkKind: kind,
    applicable: false,
    state: null,
    completeness: "NOT_APPLICABLE",
    incompleteReason: "NOT_APPLICABLE",
    checkRef: null,
    utilization: null,
    utilizationComparable: false,
    reportLanguage: "not applicable",
    methodMaturity: null,
  };
}

function row(input: {
  kind: SteelMemberDesignCheckKind;
  state: SteelCheckVerdict;
  completeness: SteelMemberCompletenessState;
  reason: SteelIncompleteReason | null;
  checkRef: string | null;
  utilization: number | null;
  maturity: SteelMethodMaturity | null;
}): SteelMemberDesignCheckRow {
  return {
    checkKind: input.kind,
    applicable: true,
    state: input.state,
    completeness: input.completeness,
    incompleteReason: input.reason,
    checkRef: input.checkRef,
    utilization: input.utilization,
    utilizationComparable: input.utilization != null,
    reportLanguage: checkRowReportLanguage(input.kind, input.state, input.reason),
    methodMaturity: input.maturity,
  };
}

function fromOutcome(
  kind: SteelMemberDesignCheckKind,
  outcome: SteelDesignCheckOutcome,
  completeness: SteelMemberCompletenessState,
  reason: SteelIncompleteReason | null,
): SteelMemberDesignCheckRow {
  return row({
    kind,
    state: outcome.verdict,
    completeness: outcome.verdict === "CHECK_UNDETERMINED" && completeness === "COMPLETE" ? "INCOMPLETE_VALIDATION_REQUIRED" : completeness,
    reason: outcome.verdict === "CHECK_UNDETERMINED" ? (reason ?? "VALIDATION_REQUIRED") : reason,
    checkRef: outcome.designCheck.designCheckId,
    utilization: outcome.utilization?.ratio ?? null,
    maturity: typeof outcome.designCheck.validationState === "string" ? outcome.designCheck.validationState as SteelMethodMaturity : null,
  });
}

function withLimit(input: SteelCapacityEngineInput, limitState: SteelCapacityEngineInput["limitState"]): SteelCapacityEngineInput {
  return { ...input, limitState };
}

function assertBoundaries(): void {
  if (LLM_STEEL_CAPACITY_AUTHORITY) throw new Error("LLM must not originate steel capacity");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL || AU6_AUTOMATIC_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (AU_MEMBER_PILOT_EXPOSURE) throw new Error("AU member orchestration must not be exposed to Profile A");
  if (UNIVERSAL_MEMBER_UTILIZATION) throw new Error("universal member utilization is forbidden");
  if (ORCHESTRATION_EQUALS_CODE_CERTIFICATION) throw new Error("orchestration must not equal code certification");
  if (GENERAL_FEA_CAPABILITY_CLAIMED) throw new Error("general FEA capability must not be claimed");
  if (MEMBER_CHECK_EQUALS_CONNECTION_CHECK || MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL) {
    throw new Error("member check must not imply connection or foundation approval");
  }
  if (VIBRATION_DESIGN_IMPLEMENTED) throw new Error("vibration design must not be implemented in AU-6");
}

export function orchestrateAuSteelMemberDesign(input: SteelMemberDesignInput): SteelMemberDesignRecord {
  assertBoundaries();
  const cap = input.capacityInput;
  if (cap.adapterId !== "AU_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  assertAuSteelStandardProfile(cap.standardContext);
  if (!cap.demand.resultId) throw new Error("steel design fail closed: demand missing");
  if (cap.demand.capacityPresent) throw new Error("D1C demand must not contain capacity");
  if (!cap.section.sectionFamily?.trim() || cap.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  if (!cap.material.materialRef?.trim()) throw new Error("steel design fail closed: missing material");
  assertNotCertified(AU_TENSION_GROSS_YIELD_RULE, cap.designContext.validationState);
  const serviceabilityRequested = Boolean(input.serviceability?.context || input.serviceability?.demand);
  const otherModes = input.otherServiceabilityModes ?? [];
  const applicability = resolveMemberApplicability({
    capacityInput: cap,
    serviceabilityRequested,
    otherServiceabilityRequested: otherModes.length > 0,
  });
  const dc = cap.designContext;
  const rows: SteelMemberDesignCheckRow[] = [];

  if (applicability.TENSION) {
    const outcome = orchestrateAuTensionDesignCheck({
      designCheckId: `${input.designRecordId}:TENSION`,
      designContext: dc,
      capacityInput: withLimit(cap, "TENSION"),
    });
    const complete = outcome.verdict === "CHECK_SATISFIED" || outcome.verdict === "CHECK_NOT_SATISFIED";
    rows.push(fromOutcome("TENSION", outcome, complete ? "COMPLETE" : "INCOMPLETE_VALIDATION_REQUIRED", complete ? null : "VALIDATION_REQUIRED"));
  } else rows.push(naRow("TENSION"));

  if (applicability.COMPRESSION) {
    if (!cap.stability) {
      rows.push(row({
        kind: "COMPRESSION",
        state: "CHECK_UNDETERMINED",
        completeness: "INCOMPLETE_REQUIRED_INPUT",
        reason: "MISSING_INPUT",
        checkRef: `${input.designRecordId}:COMPRESSION`,
        utilization: null,
        maturity: "IMPLEMENTED",
      }));
    } else {
      const outcome = orchestrateAuCompressionDesignCheck({
        designCheckId: `${input.designRecordId}:COMPRESSION`,
        designContext: dc,
        capacityInput: withLimit(cap, "COMPRESSION"),
      });
      rows.push(fromOutcome("COMPRESSION", outcome, "INCOMPLETE_VALIDATION_REQUIRED", "VALIDATION_REQUIRED"));
    }
  } else rows.push(naRow("COMPRESSION"));

  if (applicability.STABILITY_COMPRESSION) {
    if (!cap.stability) {
      rows.push(row({
        kind: "STABILITY_COMPRESSION",
        state: "CHECK_UNDETERMINED",
        completeness: "INCOMPLETE_REQUIRED_INPUT",
        reason: "MISSING_INPUT",
        checkRef: `${input.designRecordId}:STABILITY_COMPRESSION`,
        utilization: null,
        maturity: "IMPLEMENTED",
      }));
    } else {
      const outcome = orchestrateAuCompressionDesignCheck({
        designCheckId: `${input.designRecordId}:STABILITY_COMPRESSION`,
        designContext: dc,
        capacityInput: withLimit(cap, "MEMBER_STABILITY"),
      });
      rows.push(fromOutcome("STABILITY_COMPRESSION", outcome, "INCOMPLETE_VALIDATION_REQUIRED", "VALIDATION_REQUIRED"));
    }
  } else rows.push(naRow("STABILITY_COMPRESSION"));

  if (applicability.BENDING_MAJOR) {
    const outcome = orchestrateAuBendingDesignCheck({
      designCheckId: `${input.designRecordId}:BENDING_MAJOR`,
      designContext: dc,
      capacityInput: withLimit(cap, "BENDING_MAJOR"),
    });
    rows.push(fromOutcome("BENDING_MAJOR", outcome, "INCOMPLETE_VALIDATION_REQUIRED", "VALIDATION_REQUIRED"));
  } else rows.push(naRow("BENDING_MAJOR"));

  if (applicability.BENDING_MINOR) {
    const extra = cap.combined?.componentDemands?.find((item) => item.kind === "MOMENT_MINOR");
    const minorInput = extra
      ? {
        ...cap,
        limitState: "BENDING_MINOR" as const,
        demand: {
          ...cap.demand,
          moment: { value: Math.abs(extra.value), unit: extra.unit, locationM: cap.demand.moment.locationM, signed: extra.signed },
        },
      }
      : withLimit(cap, "BENDING_MINOR");
    const outcome = orchestrateAuBendingDesignCheck({
      designCheckId: `${input.designRecordId}:BENDING_MINOR`,
      designContext: dc,
      capacityInput: minorInput,
    });
    rows.push(fromOutcome("BENDING_MINOR", outcome, "INCOMPLETE_VALIDATION_REQUIRED", "VALIDATION_REQUIRED"));
  } else rows.push(naRow("BENDING_MINOR"));

  if (applicability.STABILITY_LTB) {
    const outcome = orchestrateAuBendingDesignCheck({
      designCheckId: `${input.designRecordId}:STABILITY_LTB`,
      designContext: dc,
      capacityInput: withLimit(cap, applicability.BENDING_MINOR && !applicability.BENDING_MAJOR ? "BENDING_MINOR" : "BENDING_MAJOR"),
    });
    rows.push(fromOutcome("STABILITY_LTB", outcome, "INCOMPLETE_VALIDATION_REQUIRED", "VALIDATION_REQUIRED"));
  } else rows.push(naRow("STABILITY_LTB"));

  if (applicability.SHEAR_MAJOR) {
    const outcome = orchestrateAuShearDesignCheck({
      designCheckId: `${input.designRecordId}:SHEAR_MAJOR`,
      designContext: dc,
      capacityInput: withLimit({ ...cap, shear: cap.shear ?? { shearAxis: "MAJOR_SHEAR", stiffenerState: "UNSTIFFENED" } }, "SHEAR_MAJOR"),
    });
    rows.push(fromOutcome("SHEAR_MAJOR", outcome, "INCOMPLETE_VALIDATION_REQUIRED", "VALIDATION_REQUIRED"));
  } else rows.push(naRow("SHEAR_MAJOR"));

  if (applicability.SHEAR_MINOR) {
    const outcome = orchestrateAuShearDesignCheck({
      designCheckId: `${input.designRecordId}:SHEAR_MINOR`,
      designContext: dc,
      capacityInput: withLimit({ ...cap, shear: cap.shear ?? { shearAxis: "MINOR_SHEAR", stiffenerState: "UNSTIFFENED" } }, "SHEAR_MINOR"),
    });
    rows.push(fromOutcome("SHEAR_MINOR", outcome, "INCOMPLETE_VALIDATION_REQUIRED", "VALIDATION_REQUIRED"));
  } else rows.push(naRow("SHEAR_MINOR"));

  if (applicability.COMBINED_ACTION) {
    if (IMPLEMENTED_INTERACTION_METHODS.length !== 0) {
      throw new Error("AU-6 must propagate AU-5 interaction limitation");
    }
    const outcome = orchestrateAuCombinedActionDesignCheck({
      designCheckId: `${input.designRecordId}:COMBINED_ACTION`,
      designContext: dc,
      capacityInput: withLimit(cap, "COMBINED_ACTION"),
    });
    rows.push(fromOutcome("COMBINED_ACTION", outcome, "INCOMPLETE_INTERACTION", "INTERACTION_RULE_VALIDATION_REQUIRED"));
  } else rows.push(naRow("COMBINED_ACTION"));

  const serviceability = evaluateAuSteelServiceability({
    memberRef: dc.memberRef,
    standardProfileRef: cap.standardContext.contextId,
    context: input.serviceability?.context ?? null,
    demand: input.serviceability?.demand ?? null,
  });
  if (applicability.DEFLECTION) {
    const reason: SteelIncompleteReason | null = serviceability?.reason === "SERVICEABILITY_CRITERION_REQUIRED"
      ? "SERVICEABILITY_CRITERION_REQUIRED"
      : serviceability?.checkState === "CHECK_UNDETERMINED"
        ? "MISSING_INPUT"
        : null;
    const completeness: SteelMemberCompletenessState = serviceability?.checkState === "CHECK_SATISFIED" || serviceability?.checkState === "CHECK_NOT_SATISFIED"
      ? "COMPLETE"
      : serviceability?.reason === "SERVICEABILITY_CRITERION_REQUIRED"
        ? "INCOMPLETE_REQUIRED_INPUT"
        : "INCOMPLETE_REQUIRED_INPUT";
    rows.push(row({
      kind: "DEFLECTION",
      state: serviceability?.checkState ?? "CHECK_UNDETERMINED",
      completeness,
      reason,
      checkRef: serviceability?.resultId ?? `${input.designRecordId}:DEFLECTION`,
      utilization: serviceability?.ratio ?? null,
      maturity: "IMPLEMENTED",
    }));
  } else rows.push(naRow("DEFLECTION"));

  if (applicability.OTHER_SERVICEABILITY) {
    rows.push(row({
      kind: "OTHER_SERVICEABILITY",
      state: "CHECK_UNDETERMINED",
      completeness: "INCOMPLETE_METHOD_UNAVAILABLE",
      reason: "METHOD_NOT_IMPLEMENTED",
      checkRef: `${input.designRecordId}:OTHER_SERVICEABILITY`,
      utilization: null,
      maturity: "FRAMEWORK_ONLY",
    }));
  } else rows.push(naRow("OTHER_SERVICEABILITY"));

  const ordered = STEEL_MEMBER_DESIGN_CHECK_KINDS.map((kind) => rows.find((item) => item.checkKind === kind)!);
  const overall = aggregateEngineeringCheckState(ordered);
  const completeness = aggregateCompleteness(ordered);
  const governing = selectGoverningCheck(ordered);
  const fingerprint = memberDesignFingerprint({
    sectionRef: cap.section.sectionRef,
    materialRef: cap.material.materialRef,
    demandResultId: cap.demand.resultId,
    combinationId: cap.demand.combinationId ?? null,
    effectiveLengthMajorM: cap.stability?.effectiveLengthMajorM ?? cap.stability?.effectiveLengthM ?? null,
    effectiveLengthMinorM: cap.stability?.effectiveLengthMinorM ?? null,
    unbracedLengthM: cap.stability?.unbracedLengthM ?? null,
    standardContextId: cap.standardContext.contextId,
    criterionRef: input.serviceability?.context?.criterionRef ?? null,
    methodVersions: {
      tension: AU_TENSION_IMPLEMENTATION_VERSION,
      compression: AU_COMPRESSION_IMPLEMENTATION_VERSION,
      bending: AU_BENDING_IMPLEMENTATION_VERSION,
      shear: AU_SHEAR_IMPLEMENTATION_VERSION,
      combined: AU_COMBINED_IMPLEMENTATION_VERSION,
      member: AU_MEMBER_IMPLEMENTATION_VERSION,
    },
  });
  const tags = invalidationTags(input.previousFingerprint, fingerprint);
  assertStaleResultsNotReused(tags, input.reuseStaleResults === true);
  const reportLanguage = governedReportLanguage({
    overall,
    completeness,
    incompleteReason: governing?.incompleteReason ?? null,
    interactionRequired: applicability.COMBINED_ACTION,
  });
  assertGovernedReportLanguage(reportLanguage);
  const applicable = ordered.filter((item) => item.applicable).map((item) => item.checkKind);
  const refs = (kinds: SteelMemberDesignCheckKind[]) =>
    ordered.filter((item) => kinds.includes(item.checkKind) && item.checkRef).map((item) => item.checkRef!);
  const combinations = [cap.demand.combinationId, input.serviceability?.demand?.combinationId, input.serviceability?.context?.loadCaseOrCombinationRef]
    .filter((value): value is string => Boolean(value?.trim()));
  return {
    designRecordId: input.designRecordId,
    memberRef: dc.memberRef,
    sectionRef: cap.section.sectionRef,
    materialRef: cap.material.materialRef,
    standardProfileRef: cap.standardContext.contextId,
    demandSetRef: cap.demand.resultId,
    loadCombinationRefs: [...new Set(combinations)],
    strengthCheckRefs: refs(["TENSION", "COMPRESSION", "BENDING_MAJOR", "BENDING_MINOR", "SHEAR_MAJOR", "SHEAR_MINOR"]),
    stabilityCheckRefs: refs(["STABILITY_COMPRESSION", "STABILITY_LTB"]),
    interactionCheckRefs: refs(["COMBINED_ACTION"]),
    serviceabilityCheckRefs: refs(["DEFLECTION", "OTHER_SERVICEABILITY"]),
    applicableCheckRegistry: applicable,
    completenessMatrix: ordered,
    governingCheckRef: governing?.checkRef ?? null,
    governingCheckKind: governing?.checkKind ?? null,
    completenessState: completeness,
    engineeringCheckState: overall,
    standardConformanceState: "INTENDED_PROFILE",
    implementationMaturity: AU_STEEL_IMPLEMENTATION_MATURITY,
    humanReviewState: input.humanReviewState ?? "NOT_REVIEWED",
    approvalState: "not_approved",
    evidenceRefs: dc.evidenceRefs,
    provenanceRef: {
      ...dc.provenanceRef,
      tool: AU_MEMBER_TOOL_REF,
      version: AU_MEMBER_IMPLEMENTATION_VERSION,
      calculationMethod: "AU_MEMBER_DESIGN",
    },
    createdAt: input.createdAt,
    version: input.version,
    fingerprint,
    invalidationTags: tags,
    serviceabilityResult: serviceability,
    optimizationHandoff: {
      satisfiedChecks: ordered.filter((item) => item.applicable && item.state === "CHECK_SATISFIED").map((item) => item.checkKind),
      failedChecks: ordered.filter((item) => item.applicable && item.state === "CHECK_NOT_SATISFIED").map((item) => item.checkKind),
      undeterminedChecks: ordered.filter((item) => item.applicable && item.state === "CHECK_UNDETERMINED").map((item) => item.checkKind),
      governingCheckKind: governing?.checkKind ?? null,
      sectionRef: cap.section.sectionRef,
      materialRef: cap.material.materialRef,
      serviceabilityState: serviceability?.checkState ?? null,
      interactionCompleteness: ordered.find((item) => item.checkKind === "COMBINED_ACTION")?.completeness ?? "NOT_APPLICABLE",
      validationState: completeness,
      optimizationImplemented: false,
    },
    connectionDesignInScope: false,
    foundationAdequacyInScope: false,
    generalFeaClaimed: false,
    as4100CompliantClaim: false,
    reportLanguage,
  };
}

export function explainMemberDesign(record: SteelMemberDesignRecord): { advisoryOnly: true; text: string } {
  if (!AI_MEMBER_DESIGN_EXPLANATION_ADVISORY_ONLY) throw new Error("AI member design explanation must be advisory only");
  const missing = record.completenessMatrix
    .filter((row) => row.applicable && row.completeness !== "COMPLETE")
    .map((row) => `${row.checkKind}:${row.incompleteReason ?? row.completeness}`);
  return {
    advisoryOnly: true,
    text: `${record.reportLanguage}; governing=${record.governingCheckKind ?? "none"}; missing=${missing.join(",") || "none"}`,
  };
}

export function assertAiCannotApprove(proposedBy: "AI" | "OPTIMIZER" | "HUMAN", approvalState: string): void {
  if (AI_SECTION_SELECTION_EQUALS_APPROVAL) throw new Error("AI section selection must not equal approval");
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && approvalState === "approved") {
    throw new Error("AI cannot promote result to approval");
  }
}

export function assertCandidateFullMemberRecheck(candidate: SteelOptimizationCandidate): void {
  if (!CANDIDATE_FULL_DETERMINISTIC_RECHECK_REQUIRED) throw new Error("candidate must be fully rechecked deterministically");
  assertOptimizationCandidateRecheck(candidate);
  if (candidate.memberCheckState === "CHECK_UNDETERMINED" || candidate.interactionCheckState === "CHECK_UNDETERMINED") {
    throw new Error("optimizer cannot accept undetermined interaction as pass");
  }
  if (candidate.memberCheckState == null) throw new Error("candidate optimization section requires deterministic recheck");
}
