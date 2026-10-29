import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { D1fR2EvaluationInput, D1fR2RawResult, StructuralStandardContext } from "@rtb/types";
import {
  AI_AXIS_MAPPING_AUTHORITY,
  AI_RESULT_NORMALIZATION_AUTHORITY,
  ANALYSIS_RESULT_AUTHORITY_BYPASSES_AUTHORIZATION,
  CROSS_PROJECT_ANALYSIS_RESULT_BINDING_ALLOWED,
  D1F_R2_ABSENT_ACTION_EQUALS_ZERO,
  D1F_R2_AUTOMATIC_AUTHORITY_PROMOTION,
  D1F_R2_AUTOMATIC_ENVELOPE_ENGINE_IMPLEMENTED,
  D1F_R2_BINDING_COMPLETE_EQUALS_DESIGN_PASS,
  D1F_R2_BINDING_COMPLETE_EQUALS_SYSTEM_ADEQUACY,
  D1F_R2_CONCRETE_CHECK_RESULT_COUNT,
  D1F_R2_CONCRETE_DESIGN_EXECUTED,
  D1F_R2_EVENT_EQUALS_ENGINEERING_APPROVAL,
  D1F_R2_MATURITY_STATE,
  D1F_R2_MAX_ABS_AUTOMATICALLY_GOVERNS,
  D1F_R2_MEMBER_DESIGN_EXECUTION_COUNT,
  D1F_R2_MISSING_ACTION_COMPONENT_INVENTED_AS_ZERO,
  D1F_R2_NONCONVERGED_RESULT_CAN_GOVERN,
  D1F_R2_STEEL_CHECK_RESULT_COUNT,
  D1F_R2_STEEL_DESIGN_EXECUTED,
  D1F_R2_STRUCTURAL_ANALYSIS_METHOD_COUNT,
  D1F_R2_SYSTEM_ORCHESTRATOR_COUNT,
  D1F_R2_UNVERIFIED_IMPORTED_RESULT_CAN_GOVERN,
  D1F_R2_VENDOR_NAME_DEFINES_TRUST,
  D1F_R3_REQUIRED_R2_CONTRACTS,
  DESIGN_INPUT_EQUALS_ENGINEERING_ACCEPTANCE,
  GOVERNED_RESULT_EQUALS_DESIGN_INPUT,
  LLM_RESULT_TRANSFORM_AUTHORITY,
  NONLINEAR_ANALYSIS_IMPLEMENTED,
  RAW_PROVIDER_RESULT_EQUALS_GOVERNED_RESULT,
  RESPONSE_SPECTRUM_IMPLEMENTED,
  SOLVER_CONVERGED_EQUALS_ENGINEERING_ACCEPTANCE,
  UI_AXIS_MAPPING_AUTHORITY,
} from "@rtb/types";
import { evaluateAnalysisResultBinding, promoteAnalysisResultAuthority, recordSuccessorAnalysisRun, scanAnalysisFormulaBypass } from "./index";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

const context: StructuralStandardContext = {
  contextId: "ctx-1",
  jurisdictionProfileRef: "profile",
  standardFamily: "steel",
  standardCode: "binding-only",
  edition: "1",
  amendment: null,
  nationalAnnexRef: null,
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
  discipline: "structural",
  materialScope: "steel",
  calculationScope: "demand-binding",
  sourceReference: "r2",
  approvalStatus: "not_approved",
  validationState: "NOT_VALIDATED",
  provenanceRef: {
    sourceEvidence: "prov-run",
    sourceRevision: "1",
    model: null,
    tool: null,
    solver: null,
    version: "1",
    promptOrTemplate: null,
    timestamp: "2026-10-16T00:00:00.000Z",
    jurisdiction: null,
    standard: null,
    calculationMethod: null,
    confidence: null,
    validationState: "NOT_VALIDATED",
    humanReviewer: null,
    approvalState: "not_approved",
  },
  lifecycle: "ACTIVE",
};

function raw(partial: Partial<D1fR2RawResult> & Pick<D1fR2RawResult, "resultId" | "quantity" | "value">): D1fR2RawResult {
  return {
    analyticalElementId: "ae-1",
    nodeId: null,
    supportId: null,
    category: "MEMBER_ACTION_EFFECT",
    explicitZero: false,
    unit: partial.quantity.startsWith("M") || partial.quantity === "T" ? "kN.m" : "kN",
    coordinateSystemRef: "global",
    signConventionRef: "eos-sign",
    signFactor: 1,
    signConversionsApplied: 0,
    locationKind: "START",
    stationCoordinate: null,
    stationUnit: null,
    stationOrigin: null,
    stationOrientation: null,
    loadCaseId: null,
    combinationId: "ULS-1",
    providerMetadata: "provider-row",
    authority: "VERIFIED_GOVERNED",
    provenanceRef: `prov-${partial.resultId}`,
    projectId: "project-1",
    ...partial,
  };
}

function base(overrides: Partial<D1fR2EvaluationInput> = {}): D1fR2EvaluationInput {
  return {
    structuralSystemId: "ss-1",
    projectId: "project-1",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    analysisModelId: "model-1",
    analysisModelVersion: "1",
    sourceTopologyFingerprint: "topo-1",
    mappingFingerprint: "map-1",
    providerId: "provider-1",
    providerName: "provider-neutral",
    providerVersion: "1.2.3",
    providerType: "GOVERNED_EXTERNAL_SOLVER",
    modelType: "RESULT_IMPORT",
    unitSystemRef: "SI",
    globalCoordinateSystemRef: "global",
    providerCoordinateSystemRef: "global",
    canonicalCoordinateSystemRef: "global",
    signConventionRef: "eos-sign",
    assumptionsRef: "assumptions-1",
    sourceModelRef: "source-model-1",
    modelStatus: "GOVERNED",
    modelAuthority: "VERIFIED_GOVERNED",
    modelValidationEvidenceRef: "validation-1",
    normalizationRuleVersion: "norm-1",
    analysisRunId: "run-1",
    analysisType: "STATIC_RESULT_IMPORT",
    inputFingerprint: "input-1",
    loadCaseIds: ["LC1"],
    combinationIds: ["ULS-1"],
    runStatus: "COMPLETED",
    convergenceStatus: "CONVERGED",
    warnings: ["provider warning"],
    runTimestamp: "2026-10-16T00:00:00.000Z",
    runAuthority: "VERIFIED_GOVERNED",
    runProvenanceRef: "prov-run",
    resultSetId: "set-1",
    rawResults: [
      raw({ resultId: "n", quantity: "N", value: 12 }),
      raw({ resultId: "v", quantity: "V_MAJOR", value: -3 }),
      raw({ resultId: "m", quantity: "M_MAJOR", value: 4 }),
    ],
    transform: null,
    axisMapAuthority: "EXPLICIT_GOVERNED",
    axisMap: { N: "N", V_MAJOR: "V_MAJOR", V_MINOR: "V_MINOR", M_MAJOR: "M_MAJOR", M_MINOR: "M_MINOR", T: "T" },
    elementDirection: "ALIGNED",
    reversal: null,
    cardinality: "ONE_TO_ONE",
    physicalMemberId: "member-1",
    designMemberId: "design-1",
    designTarget: "D1D_STEEL_MEMBER",
    aggregationRuleRef: null,
    declaredQuantities: ["N", "V_MAJOR", "M_MAJOR"],
    automaticEnvelope: false,
    governedEnvelope: null,
    currentTopologyFingerprint: "topo-1",
    currentMappingFingerprint: "map-1",
    currentNormalizationRuleVersion: "norm-1",
    promoteActor: null,
    ...overrides,
  };
}

function codes(input: D1fR2EvaluationInput): string[] {
  return evaluateAnalysisResultBinding(input, context).findings.map((row) => row.code);
}

describe("EOS-D1F-R2 analysis result binding", () => {
  it("binds a verified result without executing design", () => {
    const before = base().rawResults.map((row) => row.value);
    const result = evaluateAnalysisResultBinding(base(), context);
    expect(result.completenessState).toBe("BINDING_COMPLETE_FOR_DECLARED_SCOPE");
    expect(result.canGovern).toBe(true);
    expect(result.designPass).toBe(false);
    expect(result.systemAdequacy).toBe(false);
    expect(result.steelChecksExecuted).toBe(0);
    expect(result.concreteChecksExecuted).toBe(0);
    expect(result.steelDemand?.axial).toEqual({ valueN: 12000, unit: "N", method: "AXIAL_DIRECT" });
    expect(result.steelDemand?.capacityPresent).toBe(false);
    expect(result.steelDemand?.shear.signed).toBe(-3000);
    expect(result.warnings).toEqual(["provider warning"]);
    expect(result.rawResults.map((row) => row.value)).toEqual(before);
    expect(result.events).toContain("RESULT_NORMALIZED");
    expect(result.events).not.toContain("APPROVED" as never);
    expect(result.provenance.map((row) => row.stage)).toEqual(expect.arrayContaining(["RAW_RESULT", "NORMALIZED_RESULT", "PHYSICAL_MEMBER", "DESIGN_MEMBER", "ACTION_BINDING"]));
    expect(D1F_R3_REQUIRED_R2_CONTRACTS).toContain("memberActionBinding");
    expect(D1F_R2_MATURITY_STATE).toBe("ANALYSIS_RESULT_AND_ACTION_BINDING_RUNTIME_IMPLEMENTED");
    expect(RAW_PROVIDER_RESULT_EQUALS_GOVERNED_RESULT).toBe(false);
    expect(GOVERNED_RESULT_EQUALS_DESIGN_INPUT).toBe(false);
    expect(DESIGN_INPUT_EQUALS_ENGINEERING_ACCEPTANCE).toBe(false);
    expect(SOLVER_CONVERGED_EQUALS_ENGINEERING_ACCEPTANCE).toBe(false);
  });

  it("fails closed on identity, authority, units, axes, and cases", () => {
    expect(evaluateAnalysisResultBinding(base({ structuralSystemId: "" }), context).completenessState).toBe("BINDING_UNDETERMINED");
    expect(codes(base({ sourceTopologyFingerprint: "" }))).toContain("MISSING_TOPOLOGY_BINDING");
    expect(codes(base({ currentTopologyFingerprint: "topo-2" }))).toContain("STALE_UPSTREAM");
    expect(evaluateAnalysisResultBinding(base({ currentTopologyFingerprint: "topo-2" }), context).canGovern).toBe(false);
    expect(codes(base({ providerId: "", providerVersion: "" }))).toEqual(expect.arrayContaining(["MISSING_PROVIDER_IDENTITY", "MISSING_PROVIDER_VERSION"]));
    expect(codes(base({ providerType: "IMPORTED_UNVERIFIED_RESULT" }))).toContain("UNVERIFIED_PROVIDER");
    expect(codes(base({ runStatus: "FAILED", convergenceStatus: "CONVERGED" }))).toContain("FAILED_ANALYSIS");
    expect(codes(base({ runStatus: "NONCONVERGED", convergenceStatus: "NOT_CONVERGED" }))).toContain("NONCONVERGED");
    expect(codes(base({ rawResults: [raw({ resultId: "n", quantity: "N", value: 1, unit: "kip" })], declaredQuantities: ["N"], designTarget: null }))).toContain("UNKNOWN_UNIT");
    expect(codes(base({ rawResults: [raw({ resultId: "m", quantity: "M_MAJOR", value: 1, unit: "kN" })], declaredQuantities: ["M_MAJOR"], designTarget: null }))).toContain("DIMENSION_MISMATCH");
    expect(codes(base({ rawResults: [raw({ resultId: "n", quantity: "N", value: 1, locationKind: null })], declaredQuantities: ["N"], designTarget: null }))).toContain("MISSING_LOCATION");
    expect(codes(base({ rawResults: [raw({ resultId: "n", quantity: "N", value: 1, combinationId: "ULTIMATE" })], declaredQuantities: ["N"], designTarget: null }))).toContain("GENERIC_LOAD_LABEL");
    expect(codes(base({ rawResults: [raw({ resultId: "n", quantity: "N", value: 1, projectId: "other" })], declaredQuantities: ["N"], designTarget: null }))).toContain("CROSS_PROJECT_BINDING");
    expect(codes(base({ axisMapAuthority: "AI" }))).toContain("AXIS_AUTHORITY");
    expect(codes(base({ axisMapAuthority: "UI" }))).toContain("AXIS_AUTHORITY");
    expect(codes(base({ signConventionRef: "provider-neutral" }))).toContain("PROVIDER_SIGN_ASSUMED");
    expect(codes(base({ automaticEnvelope: true }))).toContain("AUTOMATIC_ENVELOPE");
    expect(D1F_R2_UNVERIFIED_IMPORTED_RESULT_CAN_GOVERN).toBe(false);
    expect(D1F_R2_NONCONVERGED_RESULT_CAN_GOVERN).toBe(false);
    expect(D1F_R2_VENDOR_NAME_DEFINES_TRUST).toBe(false);
    expect(CROSS_PROJECT_ANALYSIS_RESULT_BINDING_ALLOWED).toBe(false);
    expect(ANALYSIS_RESULT_AUTHORITY_BYPASSES_AUTHORIZATION).toBe(false);
    expect(AI_AXIS_MAPPING_AUTHORITY).toBe(false);
    expect(UI_AXIS_MAPPING_AUTHORITY).toBe(false);
  });

  it("normalizes units and sign once and keeps the raw value", () => {
    const input = base({
      providerCoordinateSystemRef: "provider-local",
      transform: {
        transformId: "xf-1",
        fromSystem: "provider-local",
        toSystem: "global",
        methodRef: "EXPLICIT_COMPONENT_MAP",
        version: "xf-v1",
        componentMap: { N: "N", V_MAJOR: "V_MAJOR", M_MAJOR: "M_MAJOR" },
        authority: "HUMAN_AUTHORED",
        provenanceRef: "prov-xf",
      },
      rawResults: [raw({ resultId: "n", quantity: "N", value: 2, signFactor: -1 })],
      declaredQuantities: ["N"],
      designTarget: null,
    });
    const result = evaluateAnalysisResultBinding(input, context);
    expect(result.canonicalActions[0]?.value).toBe(-2000);
    expect(result.canonicalActions[0]?.normalizationChain).toEqual(["UNIT", "SIGN"]);
    expect(input.rawResults[0]?.value).toBe(2);
    expect(codes(base({
      providerCoordinateSystemRef: "provider-local",
      transform: null,
      declaredQuantities: ["N"],
      designTarget: null,
      rawResults: [raw({ resultId: "n", quantity: "N", value: 1 })],
    }))).toContain("MISSING_TRANSFORM");
    expect(codes(base({
      rawResults: [raw({ resultId: "n", quantity: "N", value: 1, signConversionsApplied: 1 })],
      declaredQuantities: ["N"],
      designTarget: null,
    }))).toContain("DOUBLE_SIGN_CONVERSION");
    expect(codes(base({
      elementDirection: "REVERSED",
      reversal: null,
      declaredQuantities: ["N"],
      designTarget: null,
      rawResults: [raw({ resultId: "n", quantity: "N", value: 1 })],
    }))).toContain("REVERSAL_NOT_EXPLICIT");
    const reversed = evaluateAnalysisResultBinding(base({
      elementDirection: "REVERSED",
      reversal: { explicit: true, endMap: { MEMBER_START: "MEMBER_END" } },
      rawResults: [raw({ resultId: "n", quantity: "N", value: 1 })],
      declaredQuantities: ["N"],
      designTarget: null,
    }), context);
    expect(reversed.canonicalActions[0]?.locationKind).toBe("MEMBER_END");
    expect(AI_RESULT_NORMALIZATION_AUTHORITY).toBe(false);
    expect(LLM_RESULT_TRANSFORM_AUTHORITY).toBe(false);
  });

  it("keeps pending, stale, invalid, and failed authority from governing", () => {
    for (const authority of ["IMPORTED_PENDING_VERIFICATION", "STALE", "INVALID", "FAILED_ANALYSIS"] as const) {
      const result = evaluateAnalysisResultBinding(base({
        rawResults: [raw({ resultId: "n", quantity: "N", value: 1, authority })],
        declaredQuantities: ["N"],
        designTarget: null,
      }), context);
      expect(result.canGovern).toBe(false);
    }
    expect(promoteAnalysisResultAuthority({ actor: "AI", explicit: true, evidenceId: "e", from: "IMPORTED_PENDING_VERIFICATION" }).ok).toBe(false);
    expect(promoteAnalysisResultAuthority({ actor: "AUTOMATIC", explicit: true, evidenceId: "e", from: "IMPORTED_PENDING_VERIFICATION" }).ok).toBe(false);
    expect(promoteAnalysisResultAuthority({ actor: "HUMAN", explicit: true, evidenceId: null, from: "IMPORTED_PENDING_VERIFICATION" }).ok).toBe(false);
    expect(promoteAnalysisResultAuthority({ actor: "HUMAN", explicit: true, evidenceId: "evidence", from: "IMPORTED_PENDING_VERIFICATION" }).ok).toBe(true);
    expect(D1F_R2_AUTOMATIC_AUTHORITY_PROMOTION).toBe(false);
  });

  it("builds concrete section actions without treating absence as zero", () => {
    const bending = evaluateAnalysisResultBinding(base({
      designTarget: "D1E_CONCRETE_MEMBER",
      rawResults: [raw({ resultId: "m", quantity: "M_MAJOR", value: 5 })],
      declaredQuantities: ["M_MAJOR"],
    }), context);
    expect(bending.concreteSectionActions).toEqual({
      axial: { status: "NO_AXIAL_COMPONENTS", valueN: 0 },
      majorMoment: { status: "PRESENT", signedNm: 5000 },
      minorMoment: { status: "ABSENT" },
    });
    const axial = evaluateAnalysisResultBinding(base({
      designTarget: "D1E_CONCRETE_MEMBER",
      rawResults: [
        raw({ resultId: "n", quantity: "N", value: 8 }),
        raw({ resultId: "m", quantity: "M_MAJOR", value: 5 }),
      ],
      declaredQuantities: ["N", "M_MAJOR"],
    }), context);
    expect(axial.concreteSectionActions?.axial).toEqual({ status: "AXIAL_DIRECT", valueN: 8000 });
    expect(axial.concreteSectionActions?.minorMoment).toEqual({ status: "ABSENT" });
    const biaxial = evaluateAnalysisResultBinding(base({
      designTarget: "D1E_CONCRETE_MEMBER",
      rawResults: [
        raw({ resultId: "n", quantity: "N", value: 0, explicitZero: true }),
        raw({ resultId: "maj", quantity: "M_MAJOR", value: 5 }),
        raw({ resultId: "min", quantity: "M_MINOR", value: -2 }),
      ],
      declaredQuantities: ["N", "M_MAJOR", "M_MINOR"],
    }), context);
    expect(biaxial.concreteSectionActions?.axial).toEqual({ status: "AXIAL_DIRECT", valueN: 0 });
    expect(biaxial.concreteSectionActions?.minorMoment).toEqual({ status: "PRESENT", signedNm: -2000 });
    expect(biaxial.concreteChecksExecuted).toBe(0);
    expect(D1F_R2_CONCRETE_DESIGN_EXECUTED).toBe(false);
    expect(D1F_R2_STEEL_DESIGN_EXECUTED).toBe(false);
    expect(D1F_R2_ABSENT_ACTION_EQUALS_ZERO).toBe(false);
    expect(D1F_R2_MISSING_ACTION_COMPONENT_INVENTED_AS_ZERO).toBe(false);
    expect(D1F_R2_STEEL_CHECK_RESULT_COUNT).toBe(0);
    expect(D1F_R2_CONCRETE_CHECK_RESULT_COUNT).toBe(0);
  });

  it("preserves distinct analytical elements and rejects automatic envelopes", () => {
    const many = evaluateAnalysisResultBinding(base({
      cardinality: "MANY_TO_ONE",
      aggregationRuleRef: null,
      designTarget: "D1E_CONCRETE_MEMBER",
      declaredQuantities: ["M_MAJOR"],
      rawResults: [
        raw({ resultId: "a", quantity: "M_MAJOR", value: 5, analyticalElementId: "ae-1", locationKind: "START" }),
        raw({ resultId: "b", quantity: "M_MAJOR", value: 9, analyticalElementId: "ae-2", locationKind: "END", combinationId: "ULS-1" }),
      ],
    }), context);
    expect(many.canonicalActions).toHaveLength(2);
    expect(many.concreteSectionActions).toBeNull();
    expect(many.canGovern).toBe(false);
    expect(many.findings.map((row) => row.code)).toContain("AGGREGATION_UNRESOLVED");
    expect(codes(base({
      governedEnvelope: {
        envelopeId: "env",
        sourceResultIds: ["m"],
        selectionRule: "MAX_ABS",
        quantity: "M_MAJOR",
        locationKind: "START",
        governingCaseId: "ULS-1",
        governingValue: 4,
        authority: "HUMAN_AUTHORED",
        provenanceRef: "prov-env",
      },
    }))).toContain("MAX_ABS_ENVELOPE");
    expect(D1F_R2_MAX_ABS_AUTOMATICALLY_GOVERNS).toBe(false);
    expect(D1F_R2_AUTOMATIC_ENVELOPE_ENGINE_IMPLEMENTED).toBe(false);
    expect(D1F_R2_BINDING_COMPLETE_EQUALS_DESIGN_PASS).toBe(false);
    expect(D1F_R2_BINDING_COMPLETE_EQUALS_SYSTEM_ADEQUACY).toBe(false);
  });

  it("fingerprints deterministically and invalidates stale upstream identity", () => {
    const first = evaluateAnalysisResultBinding(base(), context);
    const reordered = evaluateAnalysisResultBinding(base({
      rawResults: [...base().rawResults].reverse(),
    }), context);
    expect(reordered.resultSetFingerprint).toBe(first.resultSetFingerprint);
    expect(reordered.bindingFingerprint).toBe(first.bindingFingerprint);
    expect(evaluateAnalysisResultBinding(base(), context).findings).toEqual(first.findings);
    const changedValue = evaluateAnalysisResultBinding(base({
      rawResults: [
        raw({ resultId: "n", quantity: "N", value: 13 }),
        raw({ resultId: "v", quantity: "V_MAJOR", value: -3 }),
        raw({ resultId: "m", quantity: "M_MAJOR", value: 4 }),
      ],
    }), context);
    const changedSign = evaluateAnalysisResultBinding(base({ signConventionRef: "eos-sign-b" }), context);
    const changedCase = evaluateAnalysisResultBinding(base({
      combinationIds: ["ULS-2"],
      rawResults: base().rawResults.map((row) => ({ ...row, combinationId: "ULS-2" })),
    }), context);
    const changedLocation = evaluateAnalysisResultBinding(base({
      rawResults: base().rawResults.map((row) => ({ ...row, locationKind: "END" })),
    }), context);
    expect(changedValue.resultSetFingerprint).not.toBe(first.resultSetFingerprint);
    expect(changedSign.resultSetFingerprint).not.toBe(first.resultSetFingerprint);
    expect(changedCase.resultSetFingerprint).not.toBe(first.resultSetFingerprint);
    expect(changedLocation.bindingFingerprint).not.toBe(first.bindingFingerprint);
    const revised = recordSuccessorAnalysisRun(first, base({ currentTopologyFingerprint: "topo-2" }), context);
    expect(first.authority).toBe("VERIFIED_GOVERNED");
    expect(revised.prior.authority).toBe("STALE");
    expect(revised.history).toHaveLength(2);
    expect(revised.current.canGovern).toBe(false);
    expect(revised.current.events).toEqual(expect.arrayContaining(["RESULT_MARKED_STALE", "ACTION_BINDING_INVALIDATED"]));
    expect(evaluateAnalysisResultBinding(base({ currentMappingFingerprint: "map-2" }), context).completenessState).toBe("STALE");
    expect(evaluateAnalysisResultBinding(base({ currentNormalizationRuleVersion: "norm-2" }), context).completenessState).toBe("STALE");
    expect(D1F_R2_EVENT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(RESPONSE_SPECTRUM_IMPLEMENTED).toBe(false);
    expect(NONLINEAR_ANALYSIS_IMPLEMENTED).toBe(false);
    expect(D1F_R2_STRUCTURAL_ANALYSIS_METHOD_COUNT).toBe(0);
    expect(D1F_R2_MEMBER_DESIGN_EXECUTION_COUNT).toBe(0);
    expect(D1F_R2_SYSTEM_ORCHESTRATOR_COUNT).toBe(0);
  });

  it("does not introduce analysis formulas in the result runtime", () => {
    const folder = join(ROOT, "packages/engineering-os/src/structural-systems");
    const files = readdirSync(folder)
      .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
      .map((name) => join(folder, name));
    files.push(join(ROOT, "packages/types/src/structural-systems-r2.ts"));
    files.push(join(ROOT, "docs/architecture/engineering-os/EOS_D1F_R2_ANALYSIS_RESULT_CONTRACT_MEMBER_ACTION_BINDING.md"));
    const hits = files.flatMap((file) => scanAnalysisFormulaBypass(file, readFileSync(file, "utf8")));
    expect(hits).toEqual([]);
  });
});
