import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ANALYSIS_ELEMENT_EQUALS_DESIGN_MEMBER,
  C10_CERTIFICATION_PROMOTION,
  C10_CONFORMANCE_PROMOTION,
  C10_ENGINEER_VALIDATION_PROMOTION,
  C10_REVIEW_PACK_CONTENT_MODIFIED,
  C10_REVIEW_PACK_FINGERPRINTS_CHANGED,
  C10_VALIDATION_LANE_STATUS,
  D1A_REUSED,
  D1B_REUSED,
  D1C_COMBINATION_ENGINE_REUSED,
  D1C_REUSED,
  D1D_STEEL_REUSED,
  D1E_CONCRETE_REUSED,
  D1F_ACTION_EFFECT_LOCATION_REQUIRED,
  D1F_AUTOMATIC_ENVELOPE_ENGINE_IMPLEMENTED,
  D1F_AUTOMATIC_LOAD_PATH_ANALYSIS_IMPLEMENTED,
  D1F_CONCRETE_VALIDATION_MATURITY_UNCHANGED,
  D1F_CONNECTIVITY_INFERRED_BY_LLM,
  D1F_CONNECTIVITY_INFERRED_FROM_PROXIMITY_ONLY,
  D1F_D1D_STEEL_MEMBER_BINDING_FEASIBLE,
  D1F_D1E_CONCRETE_MEMBER_BINDING_FEASIBLE,
  D1F_EMPTY_REQUIRED_MEMBER_SET_CAN_PASS,
  D1F_EXTERNAL_SOLVER_CONNECTOR_IMPLEMENTED,
  D1F_FORBIDDEN_CLAIMS,
  D1F_MATURITY_STATE,
  D1F_MEMBER_FAILURE_FINDINGS_PRESERVED,
  D1F_MISSING_REQUIRED_ACTION_EFFECT_CAN_PASS,
  D1F_ONE_TO_ONE_MEMBER_MAPPING_ASSUMED,
  D1F_PERMITTED_CLAIM,
  D1F_PHYSICAL_ANALYTICAL_DESIGN_SEPARATION,
  D1F_SOLVER_EXECUTION_IMPLEMENTED,
  D1F_UNCHECKED_REQUIRED_MEMBER_CAN_PASS,
  D1H_CONDITION_ASSESSMENT_IMPLEMENTED,
  D1I_STRUCTURAL_DIGITAL_TWIN_IMPLEMENTED,
  D1M_CAD_BIM_INTELLIGENCE_IMPLEMENTED,
  D1N_CONCEPT_TO_DETAILED_ORCHESTRATOR_IMPLEMENTED,
  GENERATIVE_MODEL_CAN_BYPASS_STRUCTURAL_CHECKS,
  GENERATIVE_MODEL_CAN_CREATE_GOVERNED_ANALYSIS_RESULTS,
  MEMBER_CHECK_EQUALS_SYSTEM_ADEQUACY,
  NEW_RUN_REPLACES_OLD_RESULT_IN_PLACE,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
  PARALLEL_COMBINATION_ENGINE_CREATED,
  PARALLEL_STRUCTURAL_DOMAIN_CREATED,
  PHYSICAL_STRUCTURE_EQUALS_ANALYSIS_MODEL,
  RUNTIME_STRUCTURAL_SYSTEM_ANALYSIS_COUNT,
  RUNTIME_STRUCTURAL_SYSTEM_ORCHESTRATOR_COUNT,
  SCHEMA_CHANGE_REQUIRED,
  SOLVER_CONVERGED_EQUALS_ENGINEERING_ACCEPTANCE,
  STRUCTURAL_SYSTEM_OBJECT_IMPLIES_ANALYSIS_COMPLETE,
  type D1fMemberActionEffect,
  type D1fMemberMapping,
} from "@rtb/types";
import { EU_C10_R3A_ENGINEER_VALIDATED_METHOD_COUNT, EU_C10_R3A_ENGINEER_VALIDATED_ORCHESTRATOR_COUNT } from "../structural-concrete/eu-c10/review-packs";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import {
  aggregateDeclaredSystemScope,
  assertBindingCurrent,
  assertCoordinateTransform,
  assertEntityRolesDistinct,
  assertExplicitUnit,
  assertGovernedActionEffect,
  assertMemberMapping,
  assertResultPromotion,
  assertSignConvention,
  recordSuccessorRun,
} from "./contract";
import { fingerprintStructuralSubject } from "./fingerprint";
import { scanAnalysisFormulaBypass } from "./formula-scan";

const D1F_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(D1F_DIR, "../../../..");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const governedEffect = (): D1fMemberActionEffect => ({
  actionEffectId: "ae-1",
  memberId: "m-1",
  quantity: "N",
  value: 1200,
  unit: "N",
  location: { kind: "MEMBER_START", stationRef: null },
  signConventionRef: "sign-1",
  coordinateTransformRef: "xf-1",
  provenanceRef: "prov-1",
  sourceResultId: "result-1",
  sourceAuthorityState: "VERIFIED_GOVERNED",
  invented: false,
});

const mapping = (): D1fMemberMapping => ({
  mappingId: "map-1",
  physicalMemberIds: ["p-1", "p-2"],
  analyticalElementIds: ["a-1"],
  designMemberIds: ["d-1"],
  cardinality: "MANY_TO_ONE",
  authority: "HUMAN_CONFIRMED",
  exclusiveOneToOneAssumed: false,
  designBindingTarget: "D1D_STEEL_MEMBER",
});

describe("EOS-D1F-0 structural systems architecture", () => {
  it("reuses D1A-D1E and keeps C10 validation pending", () => {
    expect(D1A_REUSED && D1B_REUSED && D1C_REUSED && D1D_STEEL_REUSED && D1E_CONCRETE_REUSED).toBe(true);
    expect(PARALLEL_STRUCTURAL_DOMAIN_CREATED || PARALLEL_COMBINATION_ENGINE_CREATED || PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(D1C_COMBINATION_ENGINE_REUSED).toBe(true);
    expect(C10_VALIDATION_LANE_STATUS).toBe("PENDING_QUALIFIED_HUMAN_REVIEW");
    expect(C10_REVIEW_PACK_CONTENT_MODIFIED || C10_REVIEW_PACK_FINGERPRINTS_CHANGED).toBe(false);
    expect(C10_ENGINEER_VALIDATION_PROMOTION || C10_CONFORMANCE_PROMOTION || C10_CERTIFICATION_PROMOTION).toBe(false);
    expect(EU_C10_R3A_ENGINEER_VALIDATED_METHOD_COUNT).toBe(0);
    expect(EU_C10_R3A_ENGINEER_VALIDATED_ORCHESTRATOR_COUNT).toBe(0);
    expect(D1F_CONCRETE_VALIDATION_MATURITY_UNCHANGED).toBe(true);
    expect(SCHEMA_CHANGE_REQUIRED).toBe(false);
    expect(D1F_MATURITY_STATE).toBe("ARCHITECTURE_DEFINED");
    expect(RUNTIME_STRUCTURAL_SYSTEM_ANALYSIS_COUNT).toBe(0);
    expect(RUNTIME_STRUCTURAL_SYSTEM_ORCHESTRATOR_COUNT).toBe(0);
    expect(D1F_PERMITTED_CLAIM).toBe("STRUCTURAL_SYSTEMS_FOUNDATION");
    expect(D1F_FORBIDDEN_CLAIMS).toContain("FEA");
    expect(STRUCTURAL_SYSTEM_OBJECT_IMPLIES_ANALYSIS_COMPLETE).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1F.STRUCTURAL_SYSTEMS.ARCHITECTURE")?.implementationState).toBe("ARCHITECTURE_DEFINED");
  });

  it("separates physical, analytical, and design identities", () => {
    expect(PHYSICAL_STRUCTURE_EQUALS_ANALYSIS_MODEL).toBe(false);
    expect(ANALYSIS_ELEMENT_EQUALS_DESIGN_MEMBER).toBe(false);
    expect(D1F_PHYSICAL_ANALYTICAL_DESIGN_SEPARATION).toBe(true);
    expect(D1F_ONE_TO_ONE_MEMBER_MAPPING_ASSUMED).toBe(false);
    expect(() => assertEntityRolesDistinct([
      { entityId: "same", role: "PHYSICAL_MEMBER", structuralSystemId: "sys", tenantId: "t", workspaceId: "w", projectId: "p" },
      { entityId: "same", role: "ANALYTICAL_ELEMENT", structuralSystemId: "sys", tenantId: "t", workspaceId: "w", projectId: "p" },
    ])).toThrow(/not interchangeable/);
    expect(() => assertMemberMapping(mapping())).not.toThrow();
    expect(() => assertMemberMapping({ ...mapping(), authority: "UNCONFIRMED_CANDIDATE" })).toThrow(/authoritative/);
    expect(() => assertMemberMapping({ ...mapping(), designBindingTarget: null })).toThrow(/unsupported member mapping/);
    expect(D1F_CONNECTIVITY_INFERRED_BY_LLM).toBe(false);
    expect(D1F_CONNECTIVITY_INFERRED_FROM_PROXIMITY_ONLY).toBe(false);
  });

  it("fails closed without transform, units, sign, location, or provenance", () => {
    expect(() => assertCoordinateTransform(null)).toThrow(/coordinate transform/);
    expect(() => assertExplicitUnit(null)).toThrow(/units/);
    expect(() => assertExplicitUnit("SOLVER_DEFAULT")).toThrow(/units/);
    expect(() => assertSignConvention(null)).toThrow(/sign convention/);
    const effect = governedEffect();
    expect(() => assertGovernedActionEffect(effect)).not.toThrow();
    expect(() => assertGovernedActionEffect({ ...effect, location: null })).toThrow(/location/);
    expect(() => assertGovernedActionEffect({ ...effect, provenanceRef: null })).toThrow(/provenance/);
    expect(() => assertGovernedActionEffect({ ...effect, unit: null })).toThrow(/units/);
    expect(() => assertGovernedActionEffect({ ...effect, signConventionRef: null })).toThrow(/sign convention/);
    expect(D1F_ACTION_EFFECT_LOCATION_REQUIRED).toBe(true);
  });

  it("rejects stale bindings and unverified or candidate authority", () => {
    expect(() => assertBindingCurrent({
      revisionState: "STALE",
      analysisFingerprint: "a",
      boundFingerprint: "a",
    })).toThrow(/stale/);
    expect(() => assertBindingCurrent({
      revisionState: "CURRENT",
      analysisFingerprint: "a",
      boundFingerprint: "b",
    })).toThrow(/stale/);
    expect(() => assertResultPromotion({
      from: "IMPORTED_PENDING_VERIFICATION",
      humanVerificationEvidenceId: null,
    })).toThrow(/governed silently/);
    expect(SOLVER_CONVERGED_EQUALS_ENGINEERING_ACCEPTANCE).toBe(false);
  });

  it("keeps historical runs immutable and fails closed on incomplete scope", () => {
    const prior = { analysisRunId: "run-1", revisionState: "CURRENT", resultSetFingerprint: "fp-1" };
    const recorded = recordSuccessorRun(prior, {
      analysisRunId: "run-2",
      revisionState: "CURRENT",
      resultSetFingerprint: "fp-2",
    });
    expect(prior.revisionState).toBe("CURRENT");
    expect(recorded.prior.revisionState).toBe("SUPERSEDED");
    expect(recorded.current.analysisRunId).not.toBe(prior.analysisRunId);
    expect(NEW_RUN_REPLACES_OLD_RESULT_IN_PLACE).toBe(false);
    expect(() => recordSuccessorRun(prior, prior)).toThrow(/in place/);

    const empty = aggregateDeclaredSystemScope([], []);
    expect(empty.state).not.toBe("SYSTEM_EVALUATION_COMPLETE_FOR_DECLARED_SCOPE");
    expect(D1F_EMPTY_REQUIRED_MEMBER_SET_CAN_PASS).toBe(false);

    const unchecked = aggregateDeclaredSystemScope(["m-1"], [{ memberId: "m-1", disposition: "UNCHECKED", findings: [] }]);
    expect(unchecked.state).toBe("SYSTEM_EVALUATION_INCOMPLETE");
    expect(D1F_UNCHECKED_REQUIRED_MEMBER_CAN_PASS).toBe(false);

    const missing = aggregateDeclaredSystemScope(["m-1"], [{
      memberId: "m-1",
      disposition: "MISSING_REQUIRED_ACTION",
      findings: ["N missing"],
    }]);
    expect(missing.state).toBe("SYSTEM_EVALUATION_INCOMPLETE");
    expect(D1F_MISSING_REQUIRED_ACTION_EFFECT_CAN_PASS).toBe(false);

    const failed = aggregateDeclaredSystemScope(["m-1"], [{
      memberId: "m-1",
      disposition: "CHECKED_FAIL",
      findings: ["shear utilization above the governed limit"],
    }]);
    expect(failed.state).toBe("SYSTEM_NOT_SATISFIED");
    expect(failed.findings).toContain("shear utilization above the governed limit");
    expect(failed.systemAdequacyClaimed).toBe(false);
    expect(D1F_MEMBER_FAILURE_FINDINGS_PRESERVED).toBe(true);
    expect(MEMBER_CHECK_EQUALS_SYSTEM_ADEQUACY).toBe(false);
  });

  it("binds steel and concrete only through existing member identities", () => {
    expect(D1F_D1D_STEEL_MEMBER_BINDING_FEASIBLE).toBe(true);
    expect(D1F_D1E_CONCRETE_MEMBER_BINDING_FEASIBLE).toBe(true);
    expect(D1F_EXTERNAL_SOLVER_CONNECTOR_IMPLEMENTED).toBe(false);
    expect(D1F_SOLVER_EXECUTION_IMPLEMENTED).toBe(false);
    expect(D1F_AUTOMATIC_LOAD_PATH_ANALYSIS_IMPLEMENTED).toBe(false);
    expect(D1F_AUTOMATIC_ENVELOPE_ENGINE_IMPLEMENTED).toBe(false);
    expect(D1H_CONDITION_ASSESSMENT_IMPLEMENTED).toBe(false);
    expect(D1I_STRUCTURAL_DIGITAL_TWIN_IMPLEMENTED).toBe(false);
    expect(D1M_CAD_BIM_INTELLIGENCE_IMPLEMENTED).toBe(false);
    expect(D1N_CONCEPT_TO_DETAILED_ORCHESTRATOR_IMPLEMENTED).toBe(false);
    expect(GENERATIVE_MODEL_CAN_CREATE_GOVERNED_ANALYSIS_RESULTS).toBe(false);
    expect(GENERATIVE_MODEL_CAN_BYPASS_STRUCTURAL_CHECKS).toBe(false);
    const left = fingerprintStructuralSubject("ANALYSIS_RUN", { analysisRunId: "run-1" });
    const right = fingerprintStructuralSubject("ANALYSIS_RUN", { analysisRunId: "run-2" });
    expect(left).not.toBe(right);
  });

  it("finds no analysis or resistance implementation in D1F sources", () => {
    const files = [
      ...walk(D1F_DIR).filter((path) => path.endsWith(".ts") && !path.endsWith(".test.ts")),
      join(ROOT, "packages/types/src/structural-systems.ts"),
      join(ROOT, "docs/architecture/engineering-os/EOS_D1F_0_STRUCTURAL_SYSTEMS_ARCHITECTURE.md"),
    ];
    const hits = files.flatMap((path) => scanAnalysisFormulaBypass(path, readFileSync(path, "utf8")));
    expect(hits).toEqual([]);
    expect(scanAnalysisFormulaBypass("synthetic.ts", "const stiffnessMatrix = [[1,0],[0,1]];")).toContain("synthetic.ts:stiffnessMatrix");
  });
});
