import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { D1I_STRUCTURAL_DIGITAL_TWIN_IMPLEMENTED } from "@rtb/types";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { D1H_R5_FINAL_MATURITY_STATE, D1H_TRACK_STATUS as CLOSED_STATUS } from "./inspection-closeout";
import {
  AI_CAN_RESOLVE_STATE_CONFLICT_AUTOMATICALLY,
  AI_CAN_SELECT_GOVERNING_CURRENT_STATE,
  CANONICAL_NEXT_PHASE,
  CANONICAL_NEXT_PHASE_TYPE,
  CONDITION_STATE_EQUALS_STRUCTURAL_ADEQUACY,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1H_ENGINEER_VALIDATION_PROMOTION,
  D1H_MATURITY,
  D1H_MATURITY_PROMOTED,
  D1H_TRACK_STATUS,
  D1I_ABSORBS_D1M_CAD_BIM,
  D1I_ABSORBS_D1N_CONCEPT_ORCHESTRATION,
  D1I_ANALYSIS_STATE_EQUALS_PHYSICAL_STATE,
  D1I_CAN_MUTATE_D1H_HISTORY,
  D1I_CANONICAL_NAME,
  D1I_CAPABILITY_RUNTIME_PROMOTED,
  D1I_CONFLICT_RUNTIME_IMPLEMENTED,
  D1I_CURRENT_STATE_FROM_LATEST_TIMESTAMP_ONLY,
  D1I_D1H_REFERENCE_ONLY,
  D1I_DIGITAL_TWIN_EQUALS_BIM,
  D1I_EMPLOYEE_SURVEILLANCE_IMPLEMENTED,
  D1I_HISTORICAL_SNAPSHOT_FLOATS_TO_LATEST_SOURCE,
  D1I_INFERRED_STATE_EQUALS_MEASURED_STATE,
  D1I_PERSON_TWIN_IMPLEMENTED,
  D1I_PREDICTED_STATE_EQUALS_OBSERVED_STATE,
  D1I_REAUTHORS_D1G_ANALYSIS_RESULTS,
  D1I_REAUTHORS_D1H_CONDITION_STATES,
  D1I_REAUTHORS_D1H_EVIDENCE,
  D1I_REAUTHORS_D1H_FINDINGS,
  D1I_REAUTHORS_D1H_TEMPORAL_HISTORY,
  D1I_RUNTIME_IMPLEMENTED,
  D1I_RUNTIME_TYPE_COUNT,
  D1I_SHM_RUNTIME_IMPLEMENTED,
  D1I_SNAPSHOT_RUNTIME_IMPLEMENTED,
  D1I_STATE_CONFLICT_AUTO_RESOLVED,
  D1I_TELEMETRY_RUNTIME_IMPLEMENTED,
  D1I_TWIN_STATE_RUNTIME_IMPLEMENTED,
  D1J_STARTED,
  D1K_STARTED,
  D1L_STARTED,
  D2_STARTED_BY_THIS_PHASE,
  D3_STARTED_BY_THIS_PHASE,
  DIGITAL_TWIN_EQUALS_ANALYSIS_MODEL,
  DIGITAL_TWIN_EQUALS_DIGITAL_THREAD,
  DIGITAL_TWIN_EQUALS_INSPECTION_DATABASE,
  DIGITAL_TWIN_EQUALS_LATEST_ANALYSIS_RESULT,
  INFERRED_STATE_EQUALS_MEASURED_STATE,
  MEASURED_STATE_EQUALS_PREDICTED_STATE,
  NEW_D1_SHM_PHASE_CREATED,
  NEW_ENGINEERING_FORMULA_COUNT,
  OBSERVED_STATE_EQUALS_ANALYTICAL_STATE,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
  POST_D1H_NEXT_TRACK,
} from "./post-d1h-roadmap";

const here = dirname(fileURLToPath(import.meta.url));
const roadmap = readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_POST_D1H_CANONICAL_ROADMAP.md"), "utf8");
const historical = readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_POST_D1G_CANONICAL_ROADMAP.md"), "utf8");

describe("EOS post-D1H roadmap governance", () => {
  it("keeps D1H closed and selects D1I architecture without a runtime", () => {
    expect(D1H_TRACK_STATUS).toBe(CLOSED_STATUS);
    expect(D1H_MATURITY).toBe(D1H_R5_FINAL_MATURITY_STATE);
    expect(D1H_MATURITY_PROMOTED).toBe(false);
    expect(D1H_ENGINEER_VALIDATION_PROMOTION).toBe(false);
    expect(D1I_CANONICAL_NAME).toBe("STRUCTURAL DIGITAL TWIN");
    expect(POST_D1H_NEXT_TRACK).toBe("D1I_STRUCTURAL_DIGITAL_TWIN");
    expect(CANONICAL_NEXT_PHASE).toBe("EOS-D1I-0-STRUCTURAL-DIGITAL-TWIN-ARCHITECTURE");
    expect(CANONICAL_NEXT_PHASE_TYPE).toBe("STRUCTURAL_DIGITAL_TWIN_ARCHITECTURE");
    expect(roadmap).toContain("did not exist in the repository before this decision");
    expect(roadmap).toContain("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(roadmap).toContain("STRUCTURAL_INSPECTION_CONDITION_BOUNDED_RUNTIME_IMPLEMENTED");
    expect(historical).toContain("EOS_POST_D1H_CANONICAL_ROADMAP.md");
    expect(historical).toContain("does not define an exact implementation phase identifier");
  });

  it("keeps the twin distinct from thread, model, inspection records, and health scores", () => {
    expect(DIGITAL_TWIN_EQUALS_DIGITAL_THREAD).toBe(false);
    expect(DIGITAL_TWIN_EQUALS_ANALYSIS_MODEL).toBe(false);
    expect(DIGITAL_TWIN_EQUALS_INSPECTION_DATABASE).toBe(false);
    expect(DIGITAL_TWIN_EQUALS_LATEST_ANALYSIS_RESULT).toBe(false);
    expect(D1I_DIGITAL_TWIN_EQUALS_BIM).toBe(false);
    expect(D1I_ANALYSIS_STATE_EQUALS_PHYSICAL_STATE).toBe(false);
    expect(OBSERVED_STATE_EQUALS_ANALYTICAL_STATE).toBe(false);
    expect(MEASURED_STATE_EQUALS_PREDICTED_STATE).toBe(false);
    expect(INFERRED_STATE_EQUALS_MEASURED_STATE).toBe(false);
    expect(D1I_INFERRED_STATE_EQUALS_MEASURED_STATE).toBe(false);
    expect(D1I_PREDICTED_STATE_EQUALS_OBSERVED_STATE).toBe(false);
    expect(CONDITION_STATE_EQUALS_STRUCTURAL_ADEQUACY).toBe(false);
    expect(roadmap).toContain("not a 3D model");
    expect(roadmap).toContain("not identical");
  });

  it("keeps upstream history reference-only and conflicts unresolved", () => {
    expect(D1I_D1H_REFERENCE_ONLY).toBe(true);
    expect(D1I_CAN_MUTATE_D1H_HISTORY).toBe(false);
    expect(D1I_REAUTHORS_D1H_EVIDENCE).toBe(false);
    expect(D1I_REAUTHORS_D1H_FINDINGS).toBe(false);
    expect(D1I_REAUTHORS_D1H_CONDITION_STATES).toBe(false);
    expect(D1I_REAUTHORS_D1H_TEMPORAL_HISTORY).toBe(false);
    expect(D1I_REAUTHORS_D1G_ANALYSIS_RESULTS).toBe(false);
    expect(D1I_HISTORICAL_SNAPSHOT_FLOATS_TO_LATEST_SOURCE).toBe(false);
    expect(D1I_CURRENT_STATE_FROM_LATEST_TIMESTAMP_ONLY).toBe(false);
    expect(D1I_STATE_CONFLICT_AUTO_RESOLVED).toBe(false);
    expect(AI_CAN_RESOLVE_STATE_CONFLICT_AUTOMATICALLY).toBe(false);
    expect(AI_CAN_SELECT_GOVERNING_CURRENT_STATE).toBe(false);
    expect(roadmap).toContain("cannot mutate D1H history");
    expect(roadmap).toContain("not automatically reconciled");
    expect(roadmap).toContain("AI may not select governing physical truth");
  });

  it("implements no twin, telemetry, person twin, or later-pack runtime", () => {
    expect(D1I_RUNTIME_IMPLEMENTED).toBe(false);
    expect(D1I_TWIN_STATE_RUNTIME_IMPLEMENTED).toBe(false);
    expect(D1I_SNAPSHOT_RUNTIME_IMPLEMENTED).toBe(false);
    expect(D1I_CONFLICT_RUNTIME_IMPLEMENTED).toBe(false);
    expect(D1I_TELEMETRY_RUNTIME_IMPLEMENTED).toBe(false);
    expect(D1I_SHM_RUNTIME_IMPLEMENTED).toBe(false);
    expect(D1I_RUNTIME_TYPE_COUNT).toBe(0);
    expect(D1I_STRUCTURAL_DIGITAL_TWIN_IMPLEMENTED).toBe(false);
    expect(NEW_D1_SHM_PHASE_CREATED).toBe(false);
    expect(D1I_PERSON_TWIN_IMPLEMENTED).toBe(false);
    expect(D1I_EMPLOYEE_SURVEILLANCE_IMPLEMENTED).toBe(false);
    expect(D1J_STARTED).toBe(false);
    expect(D1K_STARTED).toBe(false);
    expect(D1L_STARTED).toBe(false);
    expect(D1I_ABSORBS_D1M_CAD_BIM).toBe(false);
    expect(D1I_ABSORBS_D1N_CONCEPT_ORCHESTRATION).toBe(false);
    expect(D2_STARTED_BY_THIS_PHASE).toBe(false);
    expect(D3_STARTED_BY_THIS_PHASE).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1I_CAPABILITY_RUNTIME_PROMOTED).toBe(false);
    expect(PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_DIGITAL_TWIN")?.implementationState).toBe("NOT_IMPLEMENTED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.filter((row) => row.capabilityId.startsWith("D1H.")).every((row) => row.validationState === "NOT_VALIDATED")).toBe(true);
    const names = readdirSync(here);
    expect(names.filter((name) => /digital-twin|d1i-/i.test(name))).toEqual([]);
    expect(roadmap).not.toMatch(/face recognition|person tracking|employee scoring|worker productivity/i);
    expect(scanAnalysisFormulaBypass(join(here, "../../../../docs/architecture/engineering-os/EOS_POST_D1H_CANONICAL_ROADMAP.md"), roadmap)).toEqual([]);
  });
});
