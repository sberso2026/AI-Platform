import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_CAN_SELECT_GOVERNING_CURRENT_STATE,
  ANALYTICAL_STATE_AUTO_GOVERNS,
  CONDITION_STATE_EQUALS_STRUCTURAL_ADEQUACY,
  D1I_0_CONFLICT_RUNTIME_COUNT,
  D1I_0_CURRENT_STATE_SELECTOR_RUNTIME_COUNT,
  D1I_0_MATURITY_STATE,
  D1I_0_MODEL_CALIBRATION_RUNTIME_COUNT,
  D1I_0_NEW_ENGINEERING_FORMULA_COUNT,
  D1I_0_PREDICTION_RUNTIME_COUNT,
  D1I_0_SNAPSHOT_RUNTIME_COUNT,
  D1I_0_STATE_REFERENCE_RUNTIME_COUNT,
  D1I_0_TELEMETRY_RUNTIME_COUNT,
  D1I_0_TWIN_RUNTIME_COUNT,
  D1I_ANALYSIS_REFERENCE_FLOATS_TO_NEW_RUN,
  D1I_AS_OF_EFFECTIVE_EQUALS_AS_KNOWN_AT,
  D1I_AUTOMATIC_MODEL_CALIBRATION_IMPLEMENTED,
  D1I_CAN_DELETE_D1H_OBJECT,
  D1I_CAN_MUTATE_D1H_OBJECT,
  D1I_CANONICAL_NAME,
  D1I_COMPLETE_SNAPSHOT_EQUALS_HEALTHY_STRUCTURE,
  D1I_COMPLETE_SNAPSHOT_EQUALS_STRUCTURAL_ADEQUACY,
  D1I_CONFLICT_AUTO_AVERAGED,
  D1I_CONFLICT_AUTO_RESOLVED,
  D1I_CONFLICT_PRESERVED,
  D1I_CONDITION_STATE_OWNED_BY_D1H,
  D1I_CROSS_PROJECT_REFERENCE_ALLOWED,
  D1I_CROSS_TENANT_REFERENCE_ALLOWED,
  D1I_CURRENT_SNAPSHOT_MUTATED_IN_PLACE,
  D1I_DIGITAL_THREAD_REUSED,
  D1I_DIGITAL_TWIN_EQUALS_3D_MODEL,
  D1I_DIGITAL_TWIN_EQUALS_BIM,
  D1I_DIGITAL_TWIN_EQUALS_HEALTH_SCORE,
  D1I_EFFECTIVE_TIME_EQUALS_RECORDED_TIME,
  D1I_EFFECTIVE_TIME_FROM_CREATED_AT_ONLY,
  D1I_EMPLOYEE_SURVEILLANCE_IMPLEMENTED,
  D1I_FAILED_ANALYSIS_CAN_GOVERN_PHYSICAL_STATE,
  D1I_FLOATING_LATEST_ANALYSIS_REFERENCE_ALLOWED,
  D1I_FLOATING_LATEST_CONDITION_REFERENCE_ALLOWED,
  D1I_FLOATING_SOURCE_REFERENCE_ALLOWED,
  D1I_HISTORICAL_SNAPSHOT_FLOATS_TO_LATEST_SOURCE,
  D1I_INFERRED_STATE_EQUALS_MEASURED_STATE,
  D1I_INVALID_SOURCE_CAN_GOVERN,
  D1I_LATE_DATA_REWRITES_PRIOR_KNOWN_AT_VIEW,
  D1I_LATE_DATA_REWRITES_PRIOR_SNAPSHOT,
  D1I_LATEST_SOLVER_RUN_AUTO_CURRENT,
  D1I_MEASURED_STATE_AUTO_UPDATES_ANALYSIS_MODEL,
  D1I_MISSING_STATE_EQUALS_HEALTHY,
  D1I_MISSING_STATE_EQUALS_ZERO,
  D1I_NEWEST_RECORD_AUTO_CURRENT,
  D1I_ORPHAN_TWIN_ALLOWED,
  D1I_OWNS_UPSTREAM_ENGINEERING_TRUTH,
  D1I_OWNS_TWIN_REFERENCE_COMPOSITION,
  D1I_PARALLEL_CAPABILITY_MANIFEST_CREATED,
  D1I_PERSON_PROFILING_IMPLEMENTED,
  D1I_PERSON_TWIN_IMPLEMENTED,
  D1I_PREDICTED_EQUALS_MEASURED,
  D1I_PREDICTION_ENGINE_IMPLEMENTED,
  D1I_R1_CANONICAL_PHASE,
  D1I_R1_HANDOFF_READY,
  D1I_REFERENCE_PROMOTES_SOURCE_AUTHORITY,
  D1I_REPAIR_DESIGN_IMPLEMENTED,
  D1I_SNAPSHOT_COPIES_SOURCE_BODIES,
  D1I_STATE_AUTO_CHANGES_CAPACITY,
  D1I_STATE_CLASS_EQUALS_AUTHORITY,
  D1I_STATE_CLASS_EQUALS_SOURCE_DOMAIN,
  D1I_STRUCTURAL_ADEQUACY_RUNTIME_IMPLEMENTED,
  D1I_TELEMETRY_RUNTIME_IMPLEMENTED,
  D1I_TWIN_IDENTITY_EQUALS_STRUCTURAL_ASSET_IDENTITY,
  D1I_TWIN_REQUIRES_GOVERNED_STRUCTURAL_TARGET,
  D1I_STRUCTURAL_DIGITAL_TWIN_IMPLEMENTED,
  DIGITAL_THREAD_EQUALS_DIGITAL_TWIN,
  MEASURED_STATE_AUTO_GOVERNS,
  MEASURED_STATE_EQUALS_INFERRED_STATE,
  MEASURED_STATE_EQUALS_PREDICTED_STATE,
  OBSERVED_STATE_AUTO_GOVERNS,
  OBSERVED_STATE_EQUALS_ANALYTICAL_STATE,
  OBSERVED_STATE_EQUALS_MEASURED_STATE,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
} from "@rtb/types";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "./formula-scan";

const here = dirname(fileURLToPath(import.meta.url));
const contractPath = join(here, "../../../types/src/structural-digital-twin-d1i-0.ts");
const docPath = join(here, "../../../../docs/architecture/engineering-os/EOS_D1I_0_STRUCTURAL_DIGITAL_TWIN_ARCHITECTURE.md");

describe("EOS-D1I-0 structural digital twin architecture", () => {
  it("defines a reference composition and not a second source of engineering truth", () => {
    expect(D1I_CANONICAL_NAME).toBe("STRUCTURAL DIGITAL TWIN");
    expect(D1I_0_MATURITY_STATE).toBe("STRUCTURAL_DIGITAL_TWIN_ARCHITECTURE_DEFINED");
    expect(D1I_OWNS_UPSTREAM_ENGINEERING_TRUTH).toBe(false);
    expect(D1I_OWNS_TWIN_REFERENCE_COMPOSITION).toBe(true);
    expect(D1I_STRUCTURAL_DIGITAL_TWIN_IMPLEMENTED).toBe(false);
    expect(DIGITAL_THREAD_EQUALS_DIGITAL_TWIN).toBe(false);
    expect(D1I_DIGITAL_THREAD_REUSED).toBe(true);
    expect(D1I_DIGITAL_TWIN_EQUALS_BIM).toBe(false);
    expect(D1I_DIGITAL_TWIN_EQUALS_3D_MODEL).toBe(false);
    expect(D1I_DIGITAL_TWIN_EQUALS_HEALTH_SCORE).toBe(false);
    expect(D1I_TWIN_IDENTITY_EQUALS_STRUCTURAL_ASSET_IDENTITY).toBe(false);
    expect(D1I_TWIN_REQUIRES_GOVERNED_STRUCTURAL_TARGET).toBe(true);
    expect(D1I_ORPHAN_TWIN_ALLOWED).toBe(false);
    expect(D1I_STATE_CLASS_EQUALS_SOURCE_DOMAIN).toBe(false);
    expect(D1I_STATE_CLASS_EQUALS_AUTHORITY).toBe(false);
    expect(MEASURED_STATE_AUTO_GOVERNS).toBe(false);
    expect(ANALYTICAL_STATE_AUTO_GOVERNS).toBe(false);
    expect(OBSERVED_STATE_AUTO_GOVERNS).toBe(false);
    expect(OBSERVED_STATE_EQUALS_MEASURED_STATE).toBe(false);
    expect(OBSERVED_STATE_EQUALS_ANALYTICAL_STATE).toBe(false);
    expect(MEASURED_STATE_EQUALS_PREDICTED_STATE).toBe(false);
    expect(MEASURED_STATE_EQUALS_INFERRED_STATE).toBe(false);
    expect(D1I_INFERRED_STATE_EQUALS_MEASURED_STATE).toBe(false);
    expect(D1I_PREDICTED_EQUALS_MEASURED).toBe(false);
    expect(CONDITION_STATE_EQUALS_STRUCTURAL_ADEQUACY).toBe(false);
    expect(D1I_CONDITION_STATE_OWNED_BY_D1H).toBe(true);
    expect(D1I_FLOATING_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D1I_FLOATING_LATEST_CONDITION_REFERENCE_ALLOWED).toBe(false);
    expect(D1I_FLOATING_LATEST_ANALYSIS_REFERENCE_ALLOWED).toBe(false);
    expect(D1I_ANALYSIS_REFERENCE_FLOATS_TO_NEW_RUN).toBe(false);
    expect(D1I_EFFECTIVE_TIME_EQUALS_RECORDED_TIME).toBe(false);
    expect(D1I_EFFECTIVE_TIME_FROM_CREATED_AT_ONLY).toBe(false);
    expect(D1I_AS_OF_EFFECTIVE_EQUALS_AS_KNOWN_AT).toBe(false);
    expect(D1I_NEWEST_RECORD_AUTO_CURRENT).toBe(false);
    expect(D1I_LATEST_SOLVER_RUN_AUTO_CURRENT).toBe(false);
    expect(D1I_SNAPSHOT_COPIES_SOURCE_BODIES).toBe(false);
    expect(D1I_HISTORICAL_SNAPSHOT_FLOATS_TO_LATEST_SOURCE).toBe(false);
    expect(D1I_CURRENT_SNAPSHOT_MUTATED_IN_PLACE).toBe(false);
    expect(D1I_MISSING_STATE_EQUALS_ZERO).toBe(false);
    expect(D1I_MISSING_STATE_EQUALS_HEALTHY).toBe(false);
    expect(D1I_COMPLETE_SNAPSHOT_EQUALS_HEALTHY_STRUCTURE).toBe(false);
    expect(D1I_COMPLETE_SNAPSHOT_EQUALS_STRUCTURAL_ADEQUACY).toBe(false);
    expect(D1I_CONFLICT_PRESERVED).toBe(true);
    expect(D1I_CONFLICT_AUTO_RESOLVED).toBe(false);
    expect(D1I_CONFLICT_AUTO_AVERAGED).toBe(false);
    expect(AI_CAN_SELECT_GOVERNING_CURRENT_STATE).toBe(false);
    expect(D1I_CAN_MUTATE_D1H_OBJECT).toBe(false);
    expect(D1I_CAN_DELETE_D1H_OBJECT).toBe(false);
    expect(D1I_REFERENCE_PROMOTES_SOURCE_AUTHORITY).toBe(false);
    expect(D1I_FAILED_ANALYSIS_CAN_GOVERN_PHYSICAL_STATE).toBe(false);
    expect(D1I_INVALID_SOURCE_CAN_GOVERN).toBe(false);
    expect(D1I_AUTOMATIC_MODEL_CALIBRATION_IMPLEMENTED).toBe(false);
    expect(D1I_MEASURED_STATE_AUTO_UPDATES_ANALYSIS_MODEL).toBe(false);
    expect(D1I_STATE_AUTO_CHANGES_CAPACITY).toBe(false);
    expect(D1I_STRUCTURAL_ADEQUACY_RUNTIME_IMPLEMENTED).toBe(false);
    expect(D1I_PREDICTION_ENGINE_IMPLEMENTED).toBe(false);
    expect(D1I_REPAIR_DESIGN_IMPLEMENTED).toBe(false);
    expect(D1I_TELEMETRY_RUNTIME_IMPLEMENTED).toBe(false);
    expect(D1I_PERSON_TWIN_IMPLEMENTED).toBe(false);
    expect(D1I_EMPLOYEE_SURVEILLANCE_IMPLEMENTED).toBe(false);
    expect(D1I_PERSON_PROFILING_IMPLEMENTED).toBe(false);
    expect(D1I_LATE_DATA_REWRITES_PRIOR_SNAPSHOT).toBe(false);
    expect(D1I_LATE_DATA_REWRITES_PRIOR_KNOWN_AT_VIEW).toBe(false);
    expect(D1I_CROSS_PROJECT_REFERENCE_ALLOWED).toBe(false);
    expect(D1I_CROSS_TENANT_REFERENCE_ALLOWED).toBe(false);
    expect(D1I_R1_HANDOFF_READY).toBe(true);
    expect(D1I_R1_CANONICAL_PHASE).toBe("EOS-D1I-R1-TWIN-IDENTITY-STATE-REFERENCE-FOUNDATION");
    expect(D1I_0_TWIN_RUNTIME_COUNT).toBe(0);
    expect(D1I_0_STATE_REFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1I_0_SNAPSHOT_RUNTIME_COUNT).toBe(0);
    expect(D1I_0_CURRENT_STATE_SELECTOR_RUNTIME_COUNT).toBe(0);
    expect(D1I_0_CONFLICT_RUNTIME_COUNT).toBe(0);
    expect(D1I_0_TELEMETRY_RUNTIME_COUNT).toBe(0);
    expect(D1I_0_MODEL_CALIBRATION_RUNTIME_COUNT).toBe(0);
    expect(D1I_0_PREDICTION_RUNTIME_COUNT).toBe(0);
    expect(D1I_0_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
  });

  it("reuses the capability manifest and does not add a twin runtime or a copied source store", () => {
    const architecture = STRUCTURAL_CAPABILITY_MANIFEST.find(
      (row) => row.capabilityId === "D1I.0.STRUCTURAL_DIGITAL_TWIN_ARCHITECTURE",
    );
    const runtime = STRUCTURAL_CAPABILITY_MANIFEST.find(
      (row) => row.capabilityId === "D1I.STRUCTURAL_DIGITAL_TWIN_RUNTIME",
    );
    expect(architecture?.implementationState).toBe("ARCHITECTURE_DEFINED");
    expect(architecture?.validationState).toBe("NOT_VALIDATED");
    expect(runtime?.implementationState).toBe("NOT_IMPLEMENTED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_DIGITAL_TWIN")?.implementationState).toBe(
      "NOT_IMPLEMENTED",
    );
    expect(D1I_PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    const source = readFileSync(contractPath, "utf8");
    expect(source).not.toMatch(/\bfunction\b/);
    expect(source).not.toMatch(/child_process|spawn\(|new Function|eval\(/);
    expect(source).not.toMatch(/export type StructuralSystem /);
    expect(source).not.toMatch(/export type InspectionEvidence/);
    expect(source).not.toMatch(/export type ConditionState /);
    expect(source).not.toMatch(/from ["'].*digital-thread/);
  });

  it("documents the thread, time, and conflict boundaries without an engineering formula", () => {
    const doc = readFileSync(docPath, "utf8");
    expect(doc).toContain("who did what, when, why");
    expect(doc).toContain("effective time");
    expect(doc).toContain("known-at time");
    expect(doc).toContain("EOS-D1I-R1-TWIN-IDENTITY-STATE-REFERENCE-FOUNDATION");
    expect(doc).not.toMatch(/```/);
    const contract = readFileSync(contractPath, "utf8");
    expect(scanAnalysisFormulaBypass(docPath, doc)).toEqual([]);
    expect(scanAnalysisFormulaBypass(contractPath, contract)).toEqual([]);
    const corpus = `${contract}\n${doc}`;
    expect(corpus).not.toMatch(/corrosion rate\s*=/i);
    expect(corpus).not.toMatch(/crack growth\s*=/i);
    expect(corpus).not.toMatch(/fatigue life\s*=/i);
    expect(corpus).not.toMatch(/remaining life\s*=/i);
    expect(corpus).not.toMatch(/capacity reduction\s*=/i);
    expect(corpus).not.toMatch(/stiffnessMatrix|assembleStiffness|pDelta|eigenvalue/);
  });
});
