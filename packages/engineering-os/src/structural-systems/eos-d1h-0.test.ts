import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_CLASSIFICATION_EQUALS_VALIDATED_FINDING,
  AI_CONFIDENCE_EQUALS_ENGINEERING_SEVERITY,
  AI_DETECTION_EQUALS_VALIDATED_FINDING,
  AI_FINDING_CLASSIFICATION_CAN_GOVERN,
  ANALYSIS_RESULT_EQUALS_OBSERVED_CONDITION,
  CONDITION_RATING_EQUALS_MEMBER_CAPACITY,
  CONDITION_RATING_EQUALS_REPAIR_APPROVAL,
  CONDITION_RATING_EQUALS_STRUCTURAL_ADEQUACY,
  D1H_0_CONDITION_ENGINE_RUNTIME_COUNT,
  D1H_0_MATURITY_STATE,
  D1H_0_NEW_ENGINEERING_FORMULA_COUNT,
  D1H_0_STRUCTURAL_INSPECTION_RUNTIME_COUNT,
  D1H_ASSOCIATION_STATES,
  D1H_CANONICAL_NAME,
  D1H_COVERAGE_RESULTS,
  D1H_CROSS_PROJECT_EVIDENCE_BINDING_ALLOWED,
  D1H_CROSS_TENANT_EVIDENCE_BINDING_ALLOWED,
  D1H_DEFAULT_ENGINEERING_SEVERITY_THRESHOLDS_CREATED,
  D1H_FINDING_AUTO_CHANGES_ANALYSIS_MODEL,
  D1H_FINDING_AUTO_CHANGES_CAPACITY,
  D1H_FINDING_CATEGORIES,
  D1H_GEOMETRY_AUTO_MERGES_FINDINGS,
  D1H_IMAGE_AI_AUTO_MERGES_FINDINGS,
  D1H_PROXIMITY_AUTO_MERGES_FINDINGS,
  D1H_R1_CANONICAL_PHASE,
  D1I_STRUCTURAL_DIGITAL_TWIN_IMPLEMENTED,
  GENERIC_INSPECTION_PLATFORM_EQUALS_D1H,
  HUMAN_VALIDATION_EQUALS_STRUCTURAL_CERTIFICATION,
  INSPECTION_EVIDENCE_EQUALS_ENGINEERING_FINDING,
  NEW_CONDITION_STATE_OVERWRITES_PRIOR_STATE,
  NEW_INSPECTION_OVERWRITES_PRIOR_INSPECTION,
  NO_EVIDENCE_EQUALS_HEALTHY,
  NO_FINDING_EQUALS_GOOD_CONDITION,
  NO_FINDING_EQUALS_NO_DEFECT,
  OBSERVATION_EQUALS_ENGINEERING_FINDING,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
  PARALLEL_INSPECTION_PLATFORM_CREATED,
  PARALLEL_STRUCTURAL_OBJECT_MODEL_CREATED,
  D1H_MEASURED_RESPONSE_EQUALS_INFERRED_RESPONSE,
} from "@rtb/types";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";

const here = dirname(fileURLToPath(import.meta.url));
const contractPath = join(here, "../../../types/src/structural-inspection-d1h-0.ts");
const docPath = join(here, "../../../../docs/architecture/engineering-os/EOS_D1H_0_STRUCTURAL_INSPECTION_CONDITION_ARCHITECTURE.md");

describe("EOS-D1H-0 structural inspection architecture", () => {
  it("keeps evidence, findings, ratings, and adequacy separate", () => {
    expect(D1H_CANONICAL_NAME).toBe("STRUCTURAL INSPECTION & CONDITION");
    expect(D1H_0_MATURITY_STATE).toBe("STRUCTURAL_INSPECTION_CONDITION_ARCHITECTURE_DEFINED");
    expect(GENERIC_INSPECTION_PLATFORM_EQUALS_D1H).toBe(false);
    expect(INSPECTION_EVIDENCE_EQUALS_ENGINEERING_FINDING).toBe(false);
    expect(OBSERVATION_EQUALS_ENGINEERING_FINDING).toBe(false);
    expect(CONDITION_RATING_EQUALS_STRUCTURAL_ADEQUACY).toBe(false);
    expect(CONDITION_RATING_EQUALS_MEMBER_CAPACITY).toBe(false);
    expect(CONDITION_RATING_EQUALS_REPAIR_APPROVAL).toBe(false);
    expect(HUMAN_VALIDATION_EQUALS_STRUCTURAL_CERTIFICATION).toBe(false);
    expect(NO_FINDING_EQUALS_GOOD_CONDITION).toBe(false);
    expect(NO_FINDING_EQUALS_NO_DEFECT).toBe(false);
    expect(NO_EVIDENCE_EQUALS_HEALTHY).toBe(false);
    expect(D1H_COVERAGE_RESULTS).toContain("NOT_INSPECTED");
    expect(D1H_COVERAGE_RESULTS).toContain("INSPECTED_NO_FINDING_RECORDED");
    expect(D1H_COVERAGE_RESULTS.indexOf("NOT_INSPECTED")).not.toBe(
      D1H_COVERAGE_RESULTS.indexOf("INSPECTED_NO_FINDING_RECORDED"),
    );
  });

  it("keeps AI, measurements, capacity, history, and twin boundaries closed", () => {
    expect(AI_DETECTION_EQUALS_VALIDATED_FINDING).toBe(false);
    expect(AI_CLASSIFICATION_EQUALS_VALIDATED_FINDING).toBe(false);
    expect(AI_FINDING_CLASSIFICATION_CAN_GOVERN).toBe(false);
    expect(AI_CONFIDENCE_EQUALS_ENGINEERING_SEVERITY).toBe(false);
    expect(D1H_DEFAULT_ENGINEERING_SEVERITY_THRESHOLDS_CREATED).toBe(false);
    expect(D1H_FINDING_AUTO_CHANGES_CAPACITY).toBe(false);
    expect(D1H_FINDING_AUTO_CHANGES_ANALYSIS_MODEL).toBe(false);
    expect(D1H_GEOMETRY_AUTO_MERGES_FINDINGS).toBe(false);
    expect(D1H_IMAGE_AI_AUTO_MERGES_FINDINGS).toBe(false);
    expect(D1H_PROXIMITY_AUTO_MERGES_FINDINGS).toBe(false);
    expect(D1H_ASSOCIATION_STATES).toContain("HUMAN_CONFIRMED_SAME_CONDITION");
    expect(NEW_INSPECTION_OVERWRITES_PRIOR_INSPECTION).toBe(false);
    expect(NEW_CONDITION_STATE_OVERWRITES_PRIOR_STATE).toBe(false);
    expect(ANALYSIS_RESULT_EQUALS_OBSERVED_CONDITION).toBe(false);
    expect(D1H_MEASURED_RESPONSE_EQUALS_INFERRED_RESPONSE).toBe(false);
    expect(D1I_STRUCTURAL_DIGITAL_TWIN_IMPLEMENTED).toBe(false);
    expect(D1H_CROSS_PROJECT_EVIDENCE_BINDING_ALLOWED).toBe(false);
    expect(D1H_CROSS_TENANT_EVIDENCE_BINDING_ALLOWED).toBe(false);
    expect(PARALLEL_INSPECTION_PLATFORM_CREATED).toBe(false);
    expect(PARALLEL_STRUCTURAL_OBJECT_MODEL_CREATED).toBe(false);
    expect(PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(D1H_0_STRUCTURAL_INSPECTION_RUNTIME_COUNT).toBe(0);
    expect(D1H_0_CONDITION_ENGINE_RUNTIME_COUNT).toBe(0);
    expect(D1H_0_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1H_R1_CANONICAL_PHASE).toBe("EOS-D1H-R1-STRUCTURAL-INSPECTION-EVIDENCE-FOUNDATION");
    expect(D1H_FINDING_CATEGORIES).toEqual([
      "CRACKING",
      "CORROSION",
      "SECTION_LOSS",
      "DEFORMATION",
      "FATIGUE_INDICATOR",
      "CONNECTION_DISTRESS",
      "FOUNDATION_MOVEMENT",
      "VIBRATION_EVIDENCE",
      "OTHER",
    ]);
  });

  it("reuses the existing capability manifest and does not duplicate platform domains", () => {
    const architecture = STRUCTURAL_CAPABILITY_MANIFEST.find(
      (row) => row.capabilityId === "D1H.0.STRUCTURAL_INSPECTION_CONDITION_ARCHITECTURE",
    );
    const runtime = STRUCTURAL_CAPABILITY_MANIFEST.find(
      (row) => row.capabilityId === "D1H.STRUCTURAL_INSPECTION_CONDITION_RUNTIME",
    );
    expect(architecture?.implementationState).toBe("ARCHITECTURE_DEFINED");
    expect(architecture?.validationState).toBe("NOT_VALIDATED");
    expect(runtime?.implementationState).toBe("NOT_IMPLEMENTED");
    const source = readFileSync(contractPath, "utf8");
    expect(source).not.toMatch(/export type InspectionSessionState/);
    expect(source).not.toMatch(/export type ConditionRatingScheme/);
    expect(source).not.toMatch(/export type StructuralSystem /);
    expect(source).not.toMatch(/export type InspectionDefect/);
    expect(source).not.toMatch(/\bfunction\b/);
    expect(source).not.toMatch(/child_process|spawn\(/);
  });

  it("contains no engineering threshold or prediction formula", () => {
    const corpus = `${readFileSync(contractPath, "utf8")}\n${readFileSync(docPath, "utf8")}`;
    expect(corpus).not.toMatch(/crack width\s*[<>]=?\s*\d/i);
    expect(corpus).not.toMatch(/section loss\s*[<>]=?\s*\d/i);
    expect(corpus).not.toMatch(/corrosion rate\s*=/i);
    expect(corpus).not.toMatch(/remaining life\s*=/i);
    expect(corpus).not.toMatch(/fatigue damage\s*=/i);
    expect(corpus).not.toMatch(/capacity reduction\s*=/i);
  });
});
