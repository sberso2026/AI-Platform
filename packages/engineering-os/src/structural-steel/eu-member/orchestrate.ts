import type {
  EurocodeSteelMemberDesignRecord,
  EurocodeSteelServiceabilityContext,
  EuMechanicsCompletenessState,
  SteelCapacityEngineInput,
  SteelCheckVerdict,
  SteelDesignCheckOutcome,
  SteelIncompleteReason,
  SteelMemberCompletenessState,
  SteelMemberDesignCheckKind,
  SteelMemberDesignCheckRow,
  SteelMemberDesignFingerprint,
  SteelMemberHumanReviewState,
  SteelMethodMaturity,
  SteelOptimizationCandidate,
  SteelOtherServiceabilityMode,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  AI_EUROCODE_CAPACITY_PROMOTION_AUTHORITY,
  AI_MEMBER_DESIGN_EXPLANATION_ADVISORY_ONLY,
  AI_SECTION_SELECTION_EQUALS_APPROVAL,
  AI_SERVICEABILITY_CRITERION_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  CANDIDATE_FULL_DETERMINISTIC_RECHECK_REQUIRED,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  EU6_INTERACTION_LIMITATION_PROPAGATED,
  EU7_AUTOMATIC_APPROVAL,
  EU_MEMBER_PILOT_EXPOSURE,
  EU_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_STEEL_IMPLEMENTATION_MATURITY,
  EU_STEEL_PACK_CERTIFIED,
  EU_STEEL_RELEASE_CLASSIFICATION,
  EU_VIBRATION_DESIGN_IMPLEMENTED,
  GENERAL_EU_MEMBER_CODE_DESIGN_VALIDATED,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  MECHANICS_COMPLETE_EQUALS_CODE_DESIGN_COMPLETE,
  MECHANICS_ONLY_RESULTS_ALLOW_EUROCODE_DESIGN_PASS,
  MEMBER_CHECK_EQUALS_CONNECTION_CHECK,
  MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL,
  MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_STABILITY,
  MISSING_INTERACTION_PREVENTS_EU_CODE_DESIGN_PASS,
  NEW_INTERACTION_METHOD_IMPLEMENTED_IN_EU7,
  PARALLEL_MEMBER_ORCHESTRATION_CREATED,
  REFERENCE_METHOD_CANNOT_COMPLETE_CODE_CHECK,
  SILENT_EU_STANDARD_EDITION_INFERENCE,
  STEEL_MEMBER_DESIGN_CHECK_KINDS,
  UNIVERSAL_MEMBER_UTILIZATION,
} from "@rtb/types";
import { aggregateCompleteness, aggregateEngineeringCheckState, selectGoverningCheck } from "../au-member/aggregate";
import { resolveMemberApplicability } from "../au-member/applicability";
import { assertStaleResultsNotReused, invalidationTags, memberDesignFingerprint } from "../au-member/invalidation";
import { IMPLEMENTED_EU_INTERACTION_METHODS } from "../eu-combined/registry";
import { EU_BENDING_IMPLEMENTATION_VERSION } from "../eu-bending/registry";
import { EU_COMBINED_IMPLEMENTATION_VERSION } from "../eu-combined/registry";
import { EU_COMPRESSION_IMPLEMENTATION_VERSION } from "../eu-compression/registry";
import { assertAust300NotEuDefault } from "../eu-standard/catalogs";
import { denyNationalAnnexFromUserLocation } from "../eu-standard/authority";
import { unknownEditionBlocksConformance } from "../eu-standard/resolver";
import { assertInteractionGenerationCompatible } from "../eu-combined/context";
import { EU_SHEAR_IMPLEMENTATION_VERSION } from "../eu-shear/registry";
import { EU_TENSION_IMPLEMENTATION_VERSION } from "../eu-tension/registry";
import {
  assertOptimizationCandidateRecheck,
  orchestrateEuBendingDesignCheck,
  orchestrateEuCombinedActionDesignCheck,
  orchestrateEuCompressionDesignCheck,
  orchestrateEuShearDesignCheck,
  orchestrateEuTensionDesignCheck,
} from "../orchestrate";
import { assertEuGovernedReportLanguage, euCheckRowReportLanguage, euGovernedReportLanguage } from "./language";
import { EU_MEMBER_IMPLEMENTATION_VERSION, EU_MEMBER_TOOL_REF } from "./registry";
import { evaluateEuSteelServiceability, type ServiceabilityDemand } from "./serviceability";

export type EuSteelMemberDesignInput = {
  designRecordId: string;
  createdAt: string;
  version: number;
  capacityInput: SteelCapacityEngineInput;
  serviceability?: {
    context: EurocodeSteelServiceabilityContext | null;
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
    authority: "CODE_PROFILE",
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
  authority?: SteelMemberDesignCheckRow["authority"];
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
    reportLanguage: euCheckRowReportLanguage(input.kind, input.state, input.reason),
    methodMaturity: input.maturity,
    authority: input.authority ?? "CODE_PROFILE",
  };
}

function codeUnavailableFromMechanics(
  kind: SteelMemberDesignCheckKind,
  outcome: SteelDesignCheckOutcome,
  checkRef: string,
): SteelMemberDesignCheckRow {
  if (MECHANICS_ONLY_RESULTS_ALLOW_EUROCODE_DESIGN_PASS || !REFERENCE_METHOD_CANNOT_COMPLETE_CODE_CHECK) {
    throw new Error("mechanics-only results must not allow a Eurocode design pass");
  }
  return row({
    kind,
    state: "CHECK_UNDETERMINED",
    completeness: "INCOMPLETE_METHOD_UNAVAILABLE",
    reason: "CODE_METHOD_UNAVAILABLE",
    checkRef: outcome.designCheck.designCheckId ?? checkRef,
    utilization: outcome.utilization?.ratio ?? null,
    maturity: "IMPLEMENTED",
    authority: "MECHANICS_REFERENCE",
  });
}

function missingInput(kind: SteelMemberDesignCheckKind, checkRef: string): SteelMemberDesignCheckRow {
  return row({
    kind,
    state: "CHECK_UNDETERMINED",
    completeness: "INCOMPLETE_REQUIRED_INPUT",
    reason: "MISSING_INPUT",
    checkRef,
    utilization: null,
    maturity: "IMPLEMENTED",
    authority: "MECHANICS_REFERENCE",
  });
}

function withLimit(input: SteelCapacityEngineInput, limitState: SteelCapacityEngineInput["limitState"], requiredProperties: string[]): SteelCapacityEngineInput {
  return { ...input, limitState, requiredProperties };
}

function assertBoundaries(): void {
  if (PARALLEL_MEMBER_ORCHESTRATION_CREATED) throw new Error("a parallel member orchestration framework must not be created");
  if (SILENT_EU_STANDARD_EDITION_INFERENCE) throw new Error("silent Eurocode edition inference is forbidden");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL || EU7_AUTOMATIC_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (EU_MEMBER_PILOT_EXPOSURE) throw new Error("EU member orchestration must not be exposed to Profile A");
  if (UNIVERSAL_MEMBER_UTILIZATION) throw new Error("universal member utilization is forbidden");
  if (GENERAL_EU_MEMBER_CODE_DESIGN_VALIDATED) throw new Error("general EU member code design is not validated");
  if (EU_STEEL_PACK_CERTIFIED) throw new Error("EU steel pack is not certified");
  if (GENERAL_FEA_CAPABILITY_CLAIMED) throw new Error("general FEA capability must not be claimed");
  if (MEMBER_CHECK_EQUALS_CONNECTION_CHECK || MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL || MEMBER_INTERACTION_EQUALS_GLOBAL_FRAME_STABILITY) {
    throw new Error("member check must not imply connection, foundation, or global frame stability");
  }
  if (EU_VIBRATION_DESIGN_IMPLEMENTED) throw new Error("vibration design must not be implemented in EU-7");
  if (NEW_INTERACTION_METHOD_IMPLEMENTED_IN_EU7) throw new Error("EU-7 must not implement interaction equations");
  if (!EU6_INTERACTION_LIMITATION_PROPAGATED) throw new Error("EU-6 interaction limitation must be propagated");
  if (AI_EUROCODE_CAPACITY_PROMOTION_AUTHORITY) throw new Error("AI cannot promote mechanics reference to Eurocode capacity");
  if (AI_SERVICEABILITY_CRITERION_AUTHORITY) throw new Error("AI cannot invent a serviceability criterion");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI cannot claim Eurocode conformance");
  if (MECHANICS_COMPLETE_EQUALS_CODE_DESIGN_COMPLETE) throw new Error("mechanics completeness must not equal code-design completeness");
}

function runSafe<T>(fn: () => T): { ok: true; value: T } | { ok: false; missing: boolean } {
  try {
    return { ok: true, value: fn() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, missing: /missing |demand missing|stability context|effective length|invalid units/i.test(message) };
  }
}

export function orchestrateEuSteelMemberDesign(input: EuSteelMemberDesignInput): EurocodeSteelMemberDesignRecord {
  assertBoundaries();
  const cap = input.capacityInput;
  if (cap.adapterId !== "EU_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (cap.standardContext.standardCode !== "EN 1993-1-1") throw new Error("steel design fail closed: unsupported standard part");
  if (!cap.demand.resultId) throw new Error("steel design fail closed: demand missing");
  if (cap.demand.capacityPresent) throw new Error("D1C demand must not contain capacity");
  if (!cap.section.sectionFamily?.trim() || cap.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  if (!cap.material.materialRef?.trim()) throw new Error("steel design fail closed: missing material");
  assertAust300NotEuDefault(cap.section.catalogSource);
  denyNationalAnnexFromUserLocation("explicit");
  if (cap.eurocodeContext) {
    unknownEditionBlocksConformance(cap.eurocodeContext);
    assertInteractionGenerationCompatible(cap.eurocodeContext.version.generationFamily);
  }
  if (IMPLEMENTED_EU_INTERACTION_METHODS.length !== 0) {
    throw new Error("EU-7 must propagate EU-6 interaction limitation");
  }
  const serviceabilityRequested = Boolean(input.serviceability?.context || input.serviceability?.demand);
  const otherModes = input.otherServiceabilityModes ?? [];
  const applicability = resolveMemberApplicability({
    capacityInput: cap,
    serviceabilityRequested,
    otherServiceabilityRequested: otherModes.length > 0,
  });
  const vPresent = applicability.SHEAR_MAJOR || applicability.SHEAR_MINOR;
  applicability.WEB_STABILITY = vPresent;
  const dc = cap.designContext;
  const rows: SteelMemberDesignCheckRow[] = [];
  const mechanicsRefs: string[] = [];

  if (applicability.TENSION) {
    const ran = runSafe(() => orchestrateEuTensionDesignCheck({
      designCheckId: `${input.designRecordId}:TENSION`,
      designContext: dc,
      capacityInput: withLimit(cap, "TENSION", ["material.yieldStrength", "section.area"]),
    }));
    if (!ran.ok) rows.push(missingInput("TENSION", `${input.designRecordId}:TENSION`));
    else {
      mechanicsRefs.push(ran.value.designCheck.capacityRef ?? ran.value.designCheck.designCheckId);
      rows.push(codeUnavailableFromMechanics("TENSION", ran.value, `${input.designRecordId}:TENSION`));
    }
  } else rows.push(naRow("TENSION"));

  if (applicability.COMPRESSION) {
    if (!cap.stability) rows.push(missingInput("COMPRESSION", `${input.designRecordId}:COMPRESSION`));
    else {
      const ran = runSafe(() => orchestrateEuCompressionDesignCheck({
        designCheckId: `${input.designRecordId}:COMPRESSION`,
        designContext: dc,
        capacityInput: withLimit(cap, "COMPRESSION", ["material.yieldStrength", "material.elasticModulus", "section.area", "section.Iyy", "section.Izz"]),
      }));
      if (!ran.ok) rows.push(missingInput("COMPRESSION", `${input.designRecordId}:COMPRESSION`));
      else {
        mechanicsRefs.push(ran.value.designCheck.capacityRef ?? ran.value.designCheck.designCheckId);
        rows.push(codeUnavailableFromMechanics("COMPRESSION", ran.value, `${input.designRecordId}:COMPRESSION`));
      }
    }
  } else rows.push(naRow("COMPRESSION"));

  if (applicability.STABILITY_COMPRESSION) {
    if (!cap.stability) rows.push(missingInput("STABILITY_COMPRESSION", `${input.designRecordId}:STABILITY_COMPRESSION`));
    else {
      const ran = runSafe(() => orchestrateEuCompressionDesignCheck({
        designCheckId: `${input.designRecordId}:STABILITY_COMPRESSION`,
        designContext: dc,
        capacityInput: withLimit(cap, "MEMBER_STABILITY", ["material.yieldStrength", "material.elasticModulus", "section.area", "section.Iyy", "section.Izz"]),
      }));
      if (!ran.ok) rows.push(missingInput("STABILITY_COMPRESSION", `${input.designRecordId}:STABILITY_COMPRESSION`));
      else {
        mechanicsRefs.push(ran.value.designCheck.capacityRef ?? ran.value.designCheck.designCheckId);
        rows.push(codeUnavailableFromMechanics("STABILITY_COMPRESSION", ran.value, `${input.designRecordId}:STABILITY_COMPRESSION`));
      }
    }
  } else rows.push(naRow("STABILITY_COMPRESSION"));

  if (applicability.BENDING_MAJOR) {
    const ran = runSafe(() => orchestrateEuBendingDesignCheck({
      designCheckId: `${input.designRecordId}:BENDING_MAJOR`,
      designContext: dc,
      capacityInput: withLimit(cap, "BENDING_MAJOR", ["material.yieldStrength", "section.sectionModulusYy"]),
    }));
    if (!ran.ok) rows.push(missingInput("BENDING_MAJOR", `${input.designRecordId}:BENDING_MAJOR`));
    else {
      mechanicsRefs.push(ran.value.designCheck.capacityRef ?? ran.value.designCheck.designCheckId);
      rows.push(codeUnavailableFromMechanics("BENDING_MAJOR", ran.value, `${input.designRecordId}:BENDING_MAJOR`));
    }
  } else rows.push(naRow("BENDING_MAJOR"));

  if (applicability.BENDING_MINOR) {
    const extra = cap.combined?.componentDemands?.find((item) => item.kind === "MOMENT_MINOR");
    const minorInput = extra
      ? {
        ...withLimit(cap, "BENDING_MINOR", ["material.yieldStrength", "section.sectionModulusZz"]),
        demand: {
          ...cap.demand,
          moment: { value: Math.abs(extra.value), unit: extra.unit, locationM: cap.demand.moment.locationM, signed: extra.signed },
        },
      }
      : withLimit(cap, "BENDING_MINOR", ["material.yieldStrength", "section.sectionModulusZz"]);
    const ran = runSafe(() => orchestrateEuBendingDesignCheck({
      designCheckId: `${input.designRecordId}:BENDING_MINOR`,
      designContext: dc,
      capacityInput: minorInput,
    }));
    if (!ran.ok) rows.push(missingInput("BENDING_MINOR", `${input.designRecordId}:BENDING_MINOR`));
    else {
      mechanicsRefs.push(ran.value.designCheck.capacityRef ?? ran.value.designCheck.designCheckId);
      rows.push(codeUnavailableFromMechanics("BENDING_MINOR", ran.value, `${input.designRecordId}:BENDING_MINOR`));
    }
  } else rows.push(naRow("BENDING_MINOR"));

  if (applicability.STABILITY_LTB) {
    const axis = applicability.BENDING_MINOR && !applicability.BENDING_MAJOR ? "BENDING_MINOR" : "BENDING_MAJOR";
    const required = axis === "BENDING_MINOR"
      ? ["material.yieldStrength", "section.sectionModulusZz"]
      : ["material.yieldStrength", "section.sectionModulusYy"];
    if (!cap.stability?.unbracedLengthM) rows.push(missingInput("STABILITY_LTB", `${input.designRecordId}:STABILITY_LTB`));
    else {
      const ran = runSafe(() => orchestrateEuBendingDesignCheck({
        designCheckId: `${input.designRecordId}:STABILITY_LTB`,
        designContext: dc,
        capacityInput: withLimit(cap, axis, required),
      }));
      if (!ran.ok) rows.push(missingInput("STABILITY_LTB", `${input.designRecordId}:STABILITY_LTB`));
      else {
        mechanicsRefs.push(ran.value.designCheck.capacityRef ?? ran.value.designCheck.designCheckId);
        rows.push(codeUnavailableFromMechanics("STABILITY_LTB", ran.value, `${input.designRecordId}:STABILITY_LTB`));
      }
    }
  } else rows.push(naRow("STABILITY_LTB"));

  if (applicability.SHEAR_MAJOR) {
    const ran = runSafe(() => orchestrateEuShearDesignCheck({
      designCheckId: `${input.designRecordId}:SHEAR_MAJOR`,
      designContext: dc,
      capacityInput: withLimit({ ...cap, shear: cap.shear ?? { shearAxis: "MAJOR_SHEAR", stiffenerState: "UNSTIFFENED" } }, "SHEAR_MAJOR", ["material.yieldStrength", "section.shearArea"]),
    }));
    if (!ran.ok) rows.push(missingInput("SHEAR_MAJOR", `${input.designRecordId}:SHEAR_MAJOR`));
    else {
      mechanicsRefs.push(ran.value.designCheck.capacityRef ?? ran.value.designCheck.designCheckId);
      rows.push(codeUnavailableFromMechanics("SHEAR_MAJOR", ran.value, `${input.designRecordId}:SHEAR_MAJOR`));
    }
  } else rows.push(naRow("SHEAR_MAJOR"));

  if (applicability.SHEAR_MINOR) {
    const ran = runSafe(() => orchestrateEuShearDesignCheck({
      designCheckId: `${input.designRecordId}:SHEAR_MINOR`,
      designContext: dc,
      capacityInput: withLimit({ ...cap, shear: cap.shear ?? { shearAxis: "MINOR_SHEAR", stiffenerState: "UNSTIFFENED" } }, "SHEAR_MINOR", ["material.yieldStrength", "section.shearArea"]),
    }));
    if (!ran.ok) rows.push(missingInput("SHEAR_MINOR", `${input.designRecordId}:SHEAR_MINOR`));
    else {
      mechanicsRefs.push(ran.value.designCheck.capacityRef ?? ran.value.designCheck.designCheckId);
      rows.push(codeUnavailableFromMechanics("SHEAR_MINOR", ran.value, `${input.designRecordId}:SHEAR_MINOR`));
    }
  } else rows.push(naRow("SHEAR_MINOR"));

  if (applicability.WEB_STABILITY) {
    rows.push(row({
      kind: "WEB_STABILITY",
      state: "CHECK_UNDETERMINED",
      completeness: "INCOMPLETE_METHOD_UNAVAILABLE",
      reason: "CODE_METHOD_UNAVAILABLE",
      checkRef: `${input.designRecordId}:WEB_STABILITY`,
      utilization: null,
      maturity: "FRAMEWORK_ONLY",
      authority: "CODE_PROFILE",
    }));
  } else rows.push(naRow("WEB_STABILITY"));

  if (applicability.COMBINED_ACTION) {
    if (!MISSING_INTERACTION_PREVENTS_EU_CODE_DESIGN_PASS) throw new Error("missing interaction must prevent EU code-design pass");
    const ran = runSafe(() => orchestrateEuCombinedActionDesignCheck({
      designCheckId: `${input.designRecordId}:COMBINED_ACTION`,
      designContext: dc,
      capacityInput: withLimit(cap, "COMBINED_ACTION", []),
    }));
    if (!ran.ok) rows.push(missingInput("COMBINED_ACTION", `${input.designRecordId}:COMBINED_ACTION`));
    else {
      rows.push(row({
        kind: "COMBINED_ACTION",
        state: "CHECK_UNDETERMINED",
        completeness: "INCOMPLETE_INTERACTION",
        reason: "INTERACTION_METHOD_UNAVAILABLE",
        checkRef: ran.value.designCheck.designCheckId,
        utilization: null,
        maturity: "IMPLEMENTED",
        authority: "CODE_PROFILE",
      }));
    }
  } else rows.push(naRow("COMBINED_ACTION"));

  const serviceability = evaluateEuSteelServiceability({
    memberRef: dc.memberRef,
    standardProfileRef: cap.standardContext.contextId,
    context: input.serviceability?.context ?? null,
    demand: input.serviceability?.demand ?? null,
  });
  if (applicability.DEFLECTION) {
    const slsReason = serviceability?.reason;
    const mapped: SteelIncompleteReason | null = slsReason === "SERVICEABILITY_CRITERION_REQUIRED"
      ? "SERVICEABILITY_CRITERION_REQUIRED"
      : slsReason === "NATIONAL_ANNEX_REQUIRED"
        ? "NATIONAL_ANNEX_REQUIRED"
        : slsReason === "NDP_REQUIRED"
          ? "NDP_REQUIRED"
          : serviceability?.checkState === "CHECK_UNDETERMINED"
            ? "MISSING_INPUT"
            : null;
    const completeness: SteelMemberCompletenessState = serviceability?.checkState === "CHECK_SATISFIED" || serviceability?.checkState === "CHECK_NOT_SATISFIED"
      ? "COMPLETE"
      : "INCOMPLETE_REQUIRED_INPUT";
    rows.push(row({
      kind: "DEFLECTION",
      state: serviceability?.checkState ?? "CHECK_UNDETERMINED",
      completeness,
      reason: mapped,
      checkRef: serviceability?.resultId ?? `${input.designRecordId}:DEFLECTION`,
      utilization: serviceability?.ratio ?? null,
      maturity: "IMPLEMENTED",
      authority: "GOVERNED",
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
      authority: "GOVERNED",
    }));
  } else rows.push(naRow("OTHER_SERVICEABILITY"));

  const ordered = STEEL_MEMBER_DESIGN_CHECK_KINDS.map((kind) => rows.find((item) => item.checkKind === kind)!);
  const overall = aggregateEngineeringCheckState(ordered);
  const completeness = aggregateCompleteness(ordered);
  const governing = selectGoverningCheck(ordered);
  const euro = cap.eurocodeContext ?? null;
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
      tension: EU_TENSION_IMPLEMENTATION_VERSION,
      compression: EU_COMPRESSION_IMPLEMENTATION_VERSION,
      bending: EU_BENDING_IMPLEMENTATION_VERSION,
      shear: EU_SHEAR_IMPLEMENTATION_VERSION,
      combined: EU_COMBINED_IMPLEMENTATION_VERSION,
      member: EU_MEMBER_IMPLEMENTATION_VERSION,
    },
    nationalAnnexId: euro?.nationalAnnex?.nationalAnnexId ?? cap.standardContext.nationalAnnexRef?.annexId ?? null,
    ndpSetRef: euro?.nationalAnnex?.nationalParameterSetRef ?? null,
    edition: euro?.version.edition ?? cap.standardContext.edition,
    generationFamily: euro?.version.generationFamily ?? null,
    restraintDescription: cap.stability?.restraintDescription ?? null,
  });
  const tags = invalidationTags(input.previousFingerprint, fingerprint);
  assertStaleResultsNotReused(tags, input.reuseStaleResults === true);
  const reportLanguage = euGovernedReportLanguage({
    overall,
    incompleteReason: governing?.incompleteReason ?? null,
    interactionRequired: applicability.COMBINED_ACTION,
  });
  assertEuGovernedReportLanguage(reportLanguage);
  const applicable = ordered.filter((item) => item.applicable).map((item) => item.checkKind);
  const refs = (kinds: SteelMemberDesignCheckKind[]) =>
    ordered.filter((item) => kinds.includes(item.checkKind) && item.checkRef).map((item) => item.checkRef!);
  const combinations = [cap.demand.combinationId, input.serviceability?.demand?.combinationId, input.serviceability?.context?.loadCaseOrCombinationRef]
    .filter((value): value is string => Boolean(value?.trim()));
  const mechanicsKinds: SteelMemberDesignCheckKind[] = ["TENSION", "COMPRESSION", "STABILITY_COMPRESSION", "BENDING_MAJOR", "BENDING_MINOR", "STABILITY_LTB", "SHEAR_MAJOR", "SHEAR_MINOR"];
  const mechanicsRows = ordered.filter((item) => item.applicable && mechanicsKinds.includes(item.checkKind));
  const mechanicsEvaluationState: EuMechanicsCompletenessState = mechanicsRows.length === 0
    ? "NOT_APPLICABLE"
    : mechanicsRows.some((item) => item.incompleteReason === "MISSING_INPUT")
      ? "INCOMPLETE_MECHANICS_INPUT"
      : "COMPLETE_FOR_AVAILABLE_MECHANICS";
  const validatedGoverning = ordered.find((item) => item.applicable && item.state === "CHECK_SATISFIED" && item.authority === "GOVERNED") ?? null;
  return {
    designRecordId: input.designRecordId,
    memberRef: dc.memberRef,
    sectionRef: cap.section.sectionRef,
    materialRef: cap.material.materialRef,
    standardProfileRef: cap.standardContext.contextId,
    demandSetRef: cap.demand.resultId,
    loadCombinationRefs: [...new Set(combinations)],
    strengthCheckRefs: refs(["TENSION", "COMPRESSION", "BENDING_MAJOR", "BENDING_MINOR", "SHEAR_MAJOR", "SHEAR_MINOR"]),
    stabilityCheckRefs: refs(["STABILITY_COMPRESSION", "STABILITY_LTB", "WEB_STABILITY"]),
    interactionCheckRefs: refs(["COMBINED_ACTION"]),
    serviceabilityCheckRefs: refs(["DEFLECTION", "OTHER_SERVICEABILITY"]),
    applicableCheckRegistry: applicable,
    completenessMatrix: ordered,
    governingCheckRef: governing?.checkRef ?? null,
    governingCheckKind: governing?.checkKind ?? null,
    completenessState: completeness,
    engineeringCheckState: overall,
    standardConformanceState: "INTENDED_PROFILE",
    implementationMaturity: EU_STEEL_IMPLEMENTATION_MATURITY,
    humanReviewState: input.humanReviewState ?? "NOT_REVIEWED",
    approvalState: "not_approved",
    evidenceRefs: dc.evidenceRefs,
    provenanceRef: {
      ...dc.provenanceRef,
      tool: EU_MEMBER_TOOL_REF,
      version: EU_MEMBER_IMPLEMENTATION_VERSION,
      calculationMethod: "EU_MEMBER_DESIGN",
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
    standardContextRef: cap.standardContext.contextId,
    mechanicsResultRefs: mechanicsRefs.filter(Boolean),
    codeProfileCapacityRefs: [],
    mechanicsEvaluationState,
    codeDesignCheckState: overall,
    overallEngineeringCheckState: overall,
    governingIssueRef: governing?.checkRef ?? null,
    governingValidatedCheckRef: validatedGoverning?.checkRef ?? null,
    numericalValidationState: "VALIDATION_REQUIRED",
    engineeringValidationState: "VALIDATION_REQUIRED",
    eurocodeCompliantClaim: false,
    nationalAnnexRef: fingerprint.nationalAnnexId ?? null,
    ndpSetRef: fingerprint.ndpSetRef ?? null,
    standardPartRefs: ["EN_1993_1_1", "EN_1993_1_5"],
    edition: fingerprint.edition ?? cap.standardContext.edition,
    generationFamily: fingerprint.generationFamily ?? null,
    releaseClassification: EU_STEEL_RELEASE_CLASSIFICATION,
  };
}

export function explainEuMemberDesign(record: EurocodeSteelMemberDesignRecord): { advisoryOnly: true; text: string } {
  if (!AI_MEMBER_DESIGN_EXPLANATION_ADVISORY_ONLY) throw new Error("AI member design explanation must be advisory only");
  const missing = record.completenessMatrix
    .filter((row) => row.applicable && row.completeness !== "COMPLETE")
    .map((row) => `${row.checkKind}:${row.incompleteReason ?? row.completeness}`);
  return {
    advisoryOnly: true,
    text: `${record.reportLanguage}; governing=${record.governingCheckKind ?? "none"}; missing=${missing.join(",") || "none"}`,
  };
}

export function assertAiCannotApproveEuMember(proposedBy: "AI" | "OPTIMIZER" | "HUMAN", approvalState: string): void {
  if (AI_SECTION_SELECTION_EQUALS_APPROVAL) throw new Error("AI section selection must not equal approval");
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && approvalState === "approved") {
    throw new Error("AI cannot promote result to approval");
  }
}

export function assertCandidateFullEuMemberRecheck(candidate: SteelOptimizationCandidate): void {
  if (!CANDIDATE_FULL_DETERMINISTIC_RECHECK_REQUIRED) throw new Error("candidate must be fully rechecked deterministically");
  if (EU_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("optimizer cannot accept undetermined as pass");
  assertOptimizationCandidateRecheck(candidate);
  if (candidate.memberCheckState === "CHECK_UNDETERMINED" || candidate.interactionCheckState === "CHECK_UNDETERMINED") {
    throw new Error("optimizer cannot accept undetermined interaction as pass");
  }
  if (candidate.memberCheckState == null) throw new Error("candidate optimization section requires deterministic recheck");
}
