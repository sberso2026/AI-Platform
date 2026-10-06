import type {
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
  USSteelDesignContext,
  USSteelMemberDesignRecord,
  USSteelServiceabilityContext,
  UsBuildingCodeComplianceState,
  UsMechanicsCompletenessState,
} from "@rtb/types";
import {
  AI_AISC_STRENGTH_PROMOTION_AUTHORITY,
  AI_BUILDING_CODE_COMPLIANCE_AUTHORITY,
  AI_DESIGN_METHOD_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_MEMBER_DESIGN_EXPLANATION_ADVISORY_ONLY,
  AI_SECTION_SELECTION_EQUALS_APPROVAL_US7,
  AI_SERVICEABILITY_CRITERION_AUTHORITY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AI_STABILITY_METHOD_AUTHORITY,
  AISC_MEMBER_CHECK_EQUALS_BUILDING_CODE_COMPLIANCE,
  AISC_UNKNOWN_EDITION_TOKEN,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  COMPONENT_CHECKS_CAN_SUBSTITUTE_FOR_US_INTERACTION,
  CANDIDATE_FULL_DETERMINISTIC_RECHECK_REQUIRED,
  DEFAULT_K_FACTOR,
  DEFAULT_LRFD_OR_ASD,
  DIRECT_CONTRACT_AISC_EQUALS_BUILDING_CODE_COMPLIANCE,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  GENERAL_US_MEMBER_CODE_DESIGN_VALIDATED,
  MECHANICS_COMPLETE_EQUALS_AISC_DESIGN_COMPLETE,
  MECHANICS_ONLY_RESULTS_ALLOW_AISC_DESIGN_PASS,
  MISSING_INTERACTION_PREVENTS_AISC_CODE_DESIGN_PASS,
  MIXED_LRFD_ASD_MEMBER_DESIGN_ALLOWED,
  NEW_INTERACTION_METHOD_IMPLEMENTED_IN_US7,
  PARALLEL_US_MEMBER_ORCHESTRATION_CREATED,
  REFERENCE_METHOD_CANNOT_COMPLETE_CODE_CHECK,
  SILENT_AISC_EDITION_INFERENCE,
  STEEL_MEMBER_DESIGN_CHECK_KINDS,
  US6_INTERACTION_LIMITATION_PROPAGATED,
  US7_AUTOMATIC_APPROVAL,
  US_CANDIDATE_FULL_DETERMINISTIC_RECHECK_REQUIRED,
  US_CONNECTION_DESIGN_VALIDATED,
  US_MEMBER_CHECK_EQUALS_CONNECTION_CHECK,
  US_MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL,
  US_MEMBER_CHECK_EQUALS_GLOBAL_FRAME_STABILITY,
  US_MEMBER_CLASSIFICATION_GUESSED,
  US_MEMBER_MOMENT_AMPLIFICATION_GUESSED,
  US_MEMBER_PILOT_EXPOSURE,
  US_MEMBER_SEISMIC_DESIGN_VALIDATED,
  US_MEMBER_STABILITY_METHOD_MIXING_ALLOWED,
  US_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  US_STEEL_IMPLEMENTATION_MATURITY,
  US_STEEL_PACK_CERTIFIED,
  US_STEEL_RELEASE_CLASSIFICATION,
  US_UNIVERSAL_MEMBER_UTILIZATION,
  US_VIBRATION_DESIGN_IMPLEMENTED,
} from "@rtb/types";
import { aggregateCompleteness, aggregateEngineeringCheckState, selectGoverningCheck } from "../au-member/aggregate";
import { resolveMemberApplicability } from "../au-member/applicability";
import { assertStaleResultsNotReused, invalidationTags, memberDesignFingerprint } from "../au-member/invalidation";
import { IMPLEMENTED_US_INTERACTION_METHODS } from "../us-combined/registry";
import { assertUsMixedLrfdAsdComponents } from "../us-combined/authority";
import { assertUsStabilityMethodNotMixed } from "../us-combined/context";
import { US_BENDING_IMPLEMENTATION_VERSION } from "../us-bending/registry";
import { US_COMBINED_IMPLEMENTATION_VERSION } from "../us-combined/registry";
import { US_COMPRESSION_IMPLEMENTATION_VERSION } from "../us-compression/registry";
import { usElementClassificationState } from "../us-compression/classification";
import { assertAust300NotUsDefault } from "../us-standard/catalogs";
import { assertNoUsCrossEditionMixing, unknownEditionBlocksUsConformance } from "../us-standard/resolver";
import { US_SHEAR_IMPLEMENTATION_VERSION } from "../us-shear/registry";
import { US_TENSION_IMPLEMENTATION_VERSION } from "../us-tension/registry";
import {
  assertOptimizationCandidateRecheck,
  orchestrateUsBendingDesignCheck,
  orchestrateUsCombinedActionDesignCheck,
  orchestrateUsCompressionDesignCheck,
  orchestrateUsShearDesignCheck,
  orchestrateUsTensionDesignCheck,
} from "../orchestrate";
import { assertAiscMemberEditionIsolation } from "./classification";
import { assertUsGovernedReportLanguage, usCheckRowReportLanguage, usGovernedReportLanguage } from "./language";
import { US_MEMBER_IMPLEMENTATION_VERSION, US_MEMBER_TOOL_REF } from "./registry";
import { evaluateUsSteelServiceability, type ServiceabilityDemand } from "./serviceability";

export type UsSteelMemberDesignInput = {
  designRecordId: string;
  createdAt: string;
  version: number;
  capacityInput: SteelCapacityEngineInput;
  serviceability?: {
    context: USSteelServiceabilityContext | null;
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
    reportLanguage: usCheckRowReportLanguage(input.kind, input.state, input.reason),
    methodMaturity: input.maturity,
    authority: input.authority ?? "CODE_PROFILE",
  };
}

function codeUnavailableFromMechanics(
  kind: SteelMemberDesignCheckKind,
  outcome: SteelDesignCheckOutcome,
  checkRef: string,
): SteelMemberDesignCheckRow {
  if (MECHANICS_ONLY_RESULTS_ALLOW_AISC_DESIGN_PASS || !REFERENCE_METHOD_CANNOT_COMPLETE_CODE_CHECK) {
    throw new Error("mechanics-only results must not allow an AISC design pass");
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

function missingInput(kind: SteelMemberDesignCheckKind, checkRef: string, reason: SteelIncompleteReason = "MISSING_INPUT"): SteelMemberDesignCheckRow {
  return row({
    kind,
    state: "CHECK_UNDETERMINED",
    completeness: "INCOMPLETE_REQUIRED_INPUT",
    reason,
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
  if (PARALLEL_US_MEMBER_ORCHESTRATION_CREATED) throw new Error("a parallel US member orchestration framework must not be created");
  if (SILENT_AISC_EDITION_INFERENCE) throw new Error("silent AISC edition inference is forbidden");
  if (DEFAULT_LRFD_OR_ASD) throw new Error("LRFD/ASD must not be defaulted");
  if (MIXED_LRFD_ASD_MEMBER_DESIGN_ALLOWED) throw new Error("mixed LRFD/ASD member design must not be allowed");
  if (DEFAULT_K_FACTOR) throw new Error("K must not be defaulted");
  if (US_MEMBER_MOMENT_AMPLIFICATION_GUESSED) throw new Error("moment amplification must not be guessed");
  if (US_MEMBER_CLASSIFICATION_GUESSED) throw new Error("element classification must not be guessed");
  if (US_MEMBER_STABILITY_METHOD_MIXING_ALLOWED) throw new Error("stability-analysis methods must not mix");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL || US7_AUTOMATIC_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (US_MEMBER_PILOT_EXPOSURE) throw new Error("US member orchestration must not be exposed to Profile A");
  if (US_UNIVERSAL_MEMBER_UTILIZATION) throw new Error("universal member utilization is forbidden");
  if (GENERAL_US_MEMBER_CODE_DESIGN_VALIDATED) throw new Error("general US member code design is not validated");
  if (US_STEEL_PACK_CERTIFIED) throw new Error("US steel pack is not certified");
  if (GENERAL_FEA_CAPABILITY_CLAIMED) throw new Error("general FEA capability must not be claimed");
  if (US_MEMBER_CHECK_EQUALS_CONNECTION_CHECK || US_MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL || US_MEMBER_CHECK_EQUALS_GLOBAL_FRAME_STABILITY) {
    throw new Error("member check must not imply connection, foundation, or global frame stability");
  }
  if (US_VIBRATION_DESIGN_IMPLEMENTED) throw new Error("vibration design must not be implemented in US-7");
  if (NEW_INTERACTION_METHOD_IMPLEMENTED_IN_US7) throw new Error("US-7 must not implement interaction equations");
  if (!US6_INTERACTION_LIMITATION_PROPAGATED) throw new Error("US-6 interaction limitation must be propagated");
  if (COMPONENT_CHECKS_CAN_SUBSTITUTE_FOR_US_INTERACTION) throw new Error("component checks cannot substitute for US interaction");
  if (AI_AISC_STRENGTH_PROMOTION_AUTHORITY) throw new Error("AI cannot promote mechanics reference to AISC strength");
  if (AI_DESIGN_METHOD_AUTHORITY) throw new Error("AI cannot choose LRFD or ASD");
  if (AI_STABILITY_METHOD_AUTHORITY) throw new Error("AI cannot choose a stability method");
  if (AI_SERVICEABILITY_CRITERION_AUTHORITY) throw new Error("AI cannot invent a serviceability criterion");
  if (AI_BUILDING_CODE_COMPLIANCE_AUTHORITY) throw new Error("AI cannot claim building-code compliance");
  if (AI_STANDARD_CONFORMANCE_AUTHORITY) throw new Error("AI cannot claim AISC conformance");
  if (MECHANICS_COMPLETE_EQUALS_AISC_DESIGN_COMPLETE) throw new Error("mechanics completeness must not equal AISC code-design completeness");
  if (AISC_MEMBER_CHECK_EQUALS_BUILDING_CODE_COMPLIANCE || DIRECT_CONTRACT_AISC_EQUALS_BUILDING_CODE_COMPLIANCE) {
    throw new Error("AISC member check must not equal building-code compliance");
  }
  if (US_MEMBER_SEISMIC_DESIGN_VALIDATED || US_CONNECTION_DESIGN_VALIDATED) {
    throw new Error("seismic and connection design remain unvalidated");
  }
}

function runSafe<T>(fn: () => T): { ok: true; value: T } | { ok: false; missing: boolean } {
  try {
    return { ok: true, value: fn() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, missing: /missing |demand missing|stability|effective length|invalid units|stiffener|DESIGN_METHOD_REQUIRED|LOAD_BASIS/i.test(message) };
  }
}

function assertUsMemberStandardContext(cap: SteelCapacityEngineInput): USSteelDesignContext {
  if (!cap.usSteelContext) throw new Error("steel design fail closed: missing AISC context");
  if (cap.standardContext.standardCode !== "AISC 360") throw new Error("steel design fail closed: unsupported standard profile");
  if (!cap.usSteelContext.designMethod) throw new Error("steel design fail closed: DESIGN_METHOD_REQUIRED");
  unknownEditionBlocksUsConformance(cap.usSteelContext);
  assertNoUsCrossEditionMixing(cap.usSteelContext.edition, cap.standardContext.edition);
  assertAiscMemberEditionIsolation(cap.usSteelContext.edition, cap.standardContext.edition);
  assertUsStabilityMethodNotMixed(cap);
  if (cap.usStabilityContext?.mixedMethods) {
    throw new Error("steel design fail closed: stability-analysis methods cannot mix");
  }
  const capacities = cap.combined?.componentCapacities ?? [];
  assertUsMixedLrfdAsdComponents(cap.usSteelContext.designMethod, capacities);
  const loadBasis = cap.usSteelContext.loadStandard?.combinationBasis;
  if (loadBasis === "STRENGTH" && cap.usSteelContext.designMethod === "ASD") {
    throw new Error("steel design fail closed: LOAD_BASIS_INCOMPATIBLE");
  }
  if (loadBasis === "ALLOWABLE" && cap.usSteelContext.designMethod === "LRFD") {
    throw new Error("steel design fail closed: LOAD_BASIS_INCOMPATIBLE");
  }
  return cap.usSteelContext;
}

function resolveBuildingCodeCompliance(us: USSteelDesignContext): UsBuildingCodeComplianceState {
  if (us.directContractProfile) return "NOT_APPLICABLE";
  if (!us.buildingCodeAdoption) return "CONTEXT_INCOMPLETE";
  return "COMPLIANCE_NOT_VALIDATED";
}

export function orchestrateUsSteelMemberDesign(input: UsSteelMemberDesignInput): USSteelMemberDesignRecord {
  assertBoundaries();
  const cap = input.capacityInput;
  if (cap.adapterId !== "US_STEEL") throw new Error("steel design fail closed: unsupported jurisdiction adapter");
  if (!cap.demand.resultId) throw new Error("steel design fail closed: demand missing");
  if (cap.demand.capacityPresent) throw new Error("D1C demand must not contain capacity");
  if (!cap.section.sectionFamily?.trim() || cap.section.sectionFamily === "unknown") {
    throw new Error("steel design fail closed: unsupported section type");
  }
  if (!cap.material.materialRef?.trim()) throw new Error("steel design fail closed: missing material");
  assertAust300NotUsDefault(cap.section.catalogSource);
  const us = assertUsMemberStandardContext(cap);
  if (IMPLEMENTED_US_INTERACTION_METHODS.length !== 0) {
    throw new Error("US-7 must propagate US-6 interaction limitation");
  }
  const classification = usElementClassificationState();
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
    const ran = runSafe(() => orchestrateUsTensionDesignCheck({
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
    if (!cap.stability) rows.push(missingInput("COMPRESSION", `${input.designRecordId}:COMPRESSION`, "EFFECTIVE_LENGTH_REQUIRED"));
    else if (!cap.usStabilityContext) rows.push(missingInput("COMPRESSION", `${input.designRecordId}:COMPRESSION`, "STABILITY_METHOD_REQUIRED"));
    else {
      const ran = runSafe(() => orchestrateUsCompressionDesignCheck({
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
    if (!cap.stability) rows.push(missingInput("STABILITY_COMPRESSION", `${input.designRecordId}:STABILITY_COMPRESSION`, "EFFECTIVE_LENGTH_REQUIRED"));
    else if (!cap.usStabilityContext) rows.push(missingInput("STABILITY_COMPRESSION", `${input.designRecordId}:STABILITY_COMPRESSION`, "STABILITY_METHOD_REQUIRED"));
    else {
      const ran = runSafe(() => orchestrateUsCompressionDesignCheck({
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
    const ran = runSafe(() => orchestrateUsBendingDesignCheck({
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
    const ran = runSafe(() => orchestrateUsBendingDesignCheck({
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
      const ran = runSafe(() => orchestrateUsBendingDesignCheck({
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
    if (!cap.shear) rows.push(missingInput("SHEAR_MAJOR", `${input.designRecordId}:SHEAR_MAJOR`));
    else {
      const ran = runSafe(() => orchestrateUsShearDesignCheck({
        designCheckId: `${input.designRecordId}:SHEAR_MAJOR`,
        designContext: dc,
        capacityInput: withLimit(cap, "SHEAR_MAJOR", ["material.yieldStrength", "section.shearArea"]),
      }));
      if (!ran.ok) rows.push(missingInput("SHEAR_MAJOR", `${input.designRecordId}:SHEAR_MAJOR`));
      else {
        mechanicsRefs.push(ran.value.designCheck.capacityRef ?? ran.value.designCheck.designCheckId);
        rows.push(codeUnavailableFromMechanics("SHEAR_MAJOR", ran.value, `${input.designRecordId}:SHEAR_MAJOR`));
      }
    }
  } else rows.push(naRow("SHEAR_MAJOR"));

  if (applicability.SHEAR_MINOR) {
    if (!cap.shear) rows.push(missingInput("SHEAR_MINOR", `${input.designRecordId}:SHEAR_MINOR`));
    else {
      const ran = runSafe(() => orchestrateUsShearDesignCheck({
        designCheckId: `${input.designRecordId}:SHEAR_MINOR`,
        designContext: dc,
        capacityInput: withLimit(cap, "SHEAR_MINOR", ["material.yieldStrength", "section.shearArea"]),
      }));
      if (!ran.ok) rows.push(missingInput("SHEAR_MINOR", `${input.designRecordId}:SHEAR_MINOR`));
      else {
        mechanicsRefs.push(ran.value.designCheck.capacityRef ?? ran.value.designCheck.designCheckId);
        rows.push(codeUnavailableFromMechanics("SHEAR_MINOR", ran.value, `${input.designRecordId}:SHEAR_MINOR`));
      }
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
    if (!MISSING_INTERACTION_PREVENTS_AISC_CODE_DESIGN_PASS) throw new Error("missing interaction must prevent AISC code-design pass");
    const ran = runSafe(() => orchestrateUsCombinedActionDesignCheck({
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

  const serviceability = evaluateUsSteelServiceability({
    memberRef: dc.memberRef,
    standardProfileRef: cap.standardContext.contextId,
    context: input.serviceability?.context ?? null,
    demand: input.serviceability?.demand ?? null,
    directContractProfile: us.directContractProfile,
  });
  if (applicability.DEFLECTION) {
    const slsReason = serviceability?.reason;
    const mapped: SteelIncompleteReason | null = slsReason === "SERVICEABILITY_CRITERION_REQUIRED"
      ? "SERVICEABILITY_CRITERION_REQUIRED"
      : slsReason === "LOCAL_AMENDMENT_REQUIRED"
        ? "LOCAL_AMENDMENT_REQUIRED"
        : slsReason === "BUILDING_CODE_CONTEXT_REQUIRED"
          ? "BUILDING_CODE_CONTEXT_REQUIRED"
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
      tension: US_TENSION_IMPLEMENTATION_VERSION,
      compression: US_COMPRESSION_IMPLEMENTATION_VERSION,
      bending: US_BENDING_IMPLEMENTATION_VERSION,
      shear: US_SHEAR_IMPLEMENTATION_VERSION,
      combined: US_COMBINED_IMPLEMENTATION_VERSION,
      member: US_MEMBER_IMPLEMENTATION_VERSION,
    },
    edition: us.edition,
    aiscEdition: us.edition,
    restraintDescription: cap.stability?.restraintDescription ?? null,
    designMethod: us.designMethod,
    stabilityMethod: cap.usStabilityContext?.method ?? null,
    classificationState: classification,
    buildingCodeEdition: us.buildingCodeAdoption?.buildingCodeEdition ?? null,
    localAmendmentSetRef: us.localAmendmentSetRef,
  });
  const tags = invalidationTags(input.previousFingerprint, fingerprint);
  assertStaleResultsNotReused(tags, input.reuseStaleResults === true);
  const reportLanguage = usGovernedReportLanguage({
    overall,
    incompleteReason: governing?.incompleteReason ?? null,
    interactionRequired: applicability.COMBINED_ACTION,
  });
  assertUsGovernedReportLanguage(reportLanguage);
  const applicable = ordered.filter((item) => item.applicable).map((item) => item.checkKind);
  const refs = (kinds: SteelMemberDesignCheckKind[]) =>
    ordered.filter((item) => kinds.includes(item.checkKind) && item.checkRef).map((item) => item.checkRef!);
  const combinations = [cap.demand.combinationId, input.serviceability?.demand?.combinationId, input.serviceability?.context?.loadCaseOrCombinationRef]
    .filter((value): value is string => Boolean(value?.trim()));
  const mechanicsKinds: SteelMemberDesignCheckKind[] = ["TENSION", "COMPRESSION", "STABILITY_COMPRESSION", "BENDING_MAJOR", "BENDING_MINOR", "STABILITY_LTB", "SHEAR_MAJOR", "SHEAR_MINOR"];
  const mechanicsRows = ordered.filter((item) => item.applicable && mechanicsKinds.includes(item.checkKind));
  const mechanicsEvaluationState: UsMechanicsCompletenessState = mechanicsRows.length === 0
    ? "NOT_APPLICABLE"
    : mechanicsRows.some((item) => item.incompleteReason === "MISSING_INPUT" || item.incompleteReason === "EFFECTIVE_LENGTH_REQUIRED" || item.incompleteReason === "STABILITY_METHOD_REQUIRED")
      ? "INCOMPLETE_MECHANICS_INPUT"
      : "COMPLETE_FOR_AVAILABLE_MECHANICS";
  const validatedGoverning = ordered.find((item) => item.applicable && item.state === "CHECK_SATISFIED" && item.authority === "GOVERNED") ?? null;
  const buildingCodeComplianceState = resolveBuildingCodeCompliance(us);
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
    implementationMaturity: US_STEEL_IMPLEMENTATION_MATURITY,
    humanReviewState: input.humanReviewState ?? "NOT_REVIEWED",
    approvalState: "not_approved",
    evidenceRefs: dc.evidenceRefs,
    provenanceRef: {
      ...dc.provenanceRef,
      tool: US_MEMBER_TOOL_REF,
      version: US_MEMBER_IMPLEMENTATION_VERSION,
      calculationMethod: "US_MEMBER_DESIGN",
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
    buildingCodeContextRef: us.buildingCodeAdoptionRef,
    directContractProfileRef: us.directContractProfile ? us.contextId : null,
    loadStandardContextRef: us.loadStandard?.standardId ?? null,
    localAmendmentSetRef: us.localAmendmentSetRef,
    designMethod: us.designMethod,
    unitSystem: us.unitSystem,
    stabilityAnalysisContextRef: cap.usStabilityContext?.method ?? null,
    mechanicsResultRefs: mechanicsRefs.filter(Boolean),
    codeProfileStrengthRefs: [],
    classificationRefs: [classification],
    localBucklingRefs: [],
    mechanicsEvaluationState,
    codeDesignCheckState: overall,
    buildingCodeComplianceState,
    overallEngineeringCheckState: overall,
    governingIssueRef: governing?.checkRef ?? null,
    governingValidatedCheckRef: validatedGoverning?.checkRef ?? null,
    numericalValidationState: "VALIDATION_REQUIRED",
    engineeringValidationState: "VALIDATION_REQUIRED",
    aiscCompliantClaim: false,
    buildingCodeCompliantClaim: false,
    edition: us.edition || AISC_UNKNOWN_EDITION_TOKEN,
    aiscAmendmentState: us.amendmentErrataState || AISC_UNKNOWN_EDITION_TOKEN,
    releaseClassification: US_STEEL_RELEASE_CLASSIFICATION,
  };
}

export function explainUsMemberDesign(record: USSteelMemberDesignRecord): { advisoryOnly: true; text: string } {
  if (!AI_MEMBER_DESIGN_EXPLANATION_ADVISORY_ONLY) throw new Error("AI member design explanation must be advisory only");
  const missing = record.completenessMatrix
    .filter((item) => item.applicable && item.completeness !== "COMPLETE")
    .map((item) => `${item.checkKind}:${item.incompleteReason ?? item.completeness}`);
  return {
    advisoryOnly: true,
    text: `${record.reportLanguage}; governing=${record.governingCheckKind ?? "none"}; missing=${missing.join(",") || "none"}`,
  };
}

export function assertAiCannotApproveUsMember(proposedBy: "AI" | "OPTIMIZER" | "HUMAN", approvalState: string): void {
  if (AI_SECTION_SELECTION_EQUALS_APPROVAL_US7) throw new Error("AI section selection must not equal approval");
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && approvalState === "approved") {
    throw new Error("AI cannot promote result to approval");
  }
}

export function assertCandidateFullUsMemberRecheck(candidate: SteelOptimizationCandidate): void {
  if (!CANDIDATE_FULL_DETERMINISTIC_RECHECK_REQUIRED || !US_CANDIDATE_FULL_DETERMINISTIC_RECHECK_REQUIRED) {
    throw new Error("candidate must be fully rechecked deterministically");
  }
  if (US_OPTIMIZATION_ACCEPTS_UNDETERMINED) throw new Error("optimizer cannot accept undetermined as pass");
  assertOptimizationCandidateRecheck(candidate);
  if (candidate.memberCheckState === "CHECK_UNDETERMINED" || candidate.interactionCheckState === "CHECK_UNDETERMINED") {
    throw new Error("optimizer cannot accept undetermined interaction as pass");
  }
  if (candidate.memberCheckState == null) throw new Error("candidate optimization section requires deterministic recheck");
}
