import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { D1M_R6_CLOSEOUT_PATH } from "./cad-bim-adapter-boundary";
import { D1M_R7_CLOSEOUT_PATH } from "./cad-bim-change-governance";
import { D1M_R8_CLOSEOUT_PATH } from "./cad-bim-evidence-handoff";
import * as closeout from "./cad-bim-intelligence-closeout";
import { D1M_R3_CLOSEOUT_PATH } from "./cad-bim-model-evidence";
import { D1M_R5_CLOSEOUT_PATH } from "./cad-bim-model-relationship";
import { D1M_R2_CLOSEOUT_PATH } from "./cad-bim-object-mapping";
import { D1M_R4_CLOSEOUT_PATH } from "./cad-bim-reference-context";
import { D1M_R1_CLOSEOUT_PATH } from "./cad-bim-source-revision";
import { scanAnalysisFormulaBypass } from "./formula-scan";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-D1M-R9 CAD or BIM intelligence closeout", () => {
  it("reconciles R1 through R8 evidence without adding runtime", () => {
    for (const path of [
      D1M_R1_CLOSEOUT_PATH,
      D1M_R2_CLOSEOUT_PATH,
      D1M_R3_CLOSEOUT_PATH,
      D1M_R4_CLOSEOUT_PATH,
      D1M_R5_CLOSEOUT_PATH,
      D1M_R6_CLOSEOUT_PATH,
      D1M_R7_CLOSEOUT_PATH,
      D1M_R8_CLOSEOUT_PATH,
      closeout.D1M_R9_CLOSEOUT_PATH,
      closeout.D1M_R9_PARENT_ARCHITECTURE_PATH,
    ]) {
      expect(existsSync(join(root, path)), path).toBe(true);
    }
    expect(closeout.D1M_R9_PHASE).toBe("EOS-D1M-R9-CAD-OR-BIM-INTELLIGENCE-CLOSEOUT");
    expect(closeout.D1M_R9_PHASE_TYPE_REUSED).toBe("CAD_OR_BIM_INTELLIGENCE_CLOSEOUT");
    expect(closeout.D1M_R9_STATUS).toBe("CLOSEOUT_DEFINED");
    expect(closeout.D1M_R9_MATURITY_STATE).toBe("STRUCTURAL_CAD_OR_BIM_INTELLIGENCE_BOUNDED_CLOSEOUT");
    expect(closeout.D1M_R9_SCOPE).toContain("add no new substantive runtime");
    expect(closeout.D1M_R9_PHASES_COHERENT).toBe(true);
    expect(closeout.D1M_R9_READINESS_MATRIX_COHERENT).toBe(true);
    expect(closeout.D1M_R9_RUNTIME_MATRIX_COHERENT).toBe(true);
    expect(closeout.D1M_R9_LIMITS_PRESERVED).toBe(true);
    expect(closeout.D1M_R9_TRACK_COMPLETE).toBe(true);
    expect(closeout.D1M_R9_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(closeout.D1M_R9_ARCHITECTURE_READY).toBe(true);
    expect(closeout.D1M_R9_SOURCE_REFERENCE_RUNTIME_READY).toBe(true);
    expect(closeout.D1M_R9_MODEL_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(closeout.D1M_R9_ADAPTER_BOUNDARY_RUNTIME_READY).toBe(true);
    expect(closeout.D1M_R9_CHANGE_GOVERNANCE_RUNTIME_READY).toBe(true);
    expect(closeout.D1M_R9_EVIDENCE_HANDOFF_RUNTIME_READY).toBe(true);
    expect(closeout.D1M_R9_FORMAT_ADAPTER_RUNTIME_READY).toBe(false);
    expect(closeout.D1M_R9_STRUCTURAL_INTERPRETATION_RUNTIME_READY).toBe(false);
    expect(closeout.D1M_R9_SUPPORTED_FORMAT_COUNT).toBe(0);
    expect(closeout.D1M_R9_NEW_SUBSTANTIVE_RUNTIME_ADDED).toBe(false);
    expect(closeout.D1M_R9_RUNTIME_COUNT).toBe(0);
    expect(closeout.D1M_R9_AGGREGATE_RUNTIME_COUNT).toBe(8);
    expect(closeout.D1M_R9_HISTORICAL_MUTATION_ALLOWED).toBe(false);
    expect(closeout.D1M_R9_HISTORICAL_RECONSTRUCTION_SUPPORTED).toBe(true);
    expect(closeout.D1M_R9_TRACK_COMPLETE_EQUALS_FORMAT_SUPPORT_COMPLETE).toBe(false);
    expect(closeout.D1M_R9_TRACK_COMPLETE_EQUALS_STRUCTURAL_INTERPRETATION_COMPLETE).toBe(false);
    expect(closeout.D1M_R9_TRACK_COMPLETE_EQUALS_ENGINEERING_VALIDATION_COMPLETE).toBe(false);
    expect(closeout.D1M_R9_TRACK_COMPLETE_EQUALS_CERTIFICATION_COMPLETE).toBe(false);
    expect(closeout.D1M_R9_TRACK_COMPLETE_EQUALS_D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(closeout.D1M_R9_TRACK_COMPLETE_EQUALS_GENERAL_AVAILABILITY).toBe(false);
    expect(closeout.D1M_R9_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(closeout.D1M_R9_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(closeout.D1M_R9_D1K_LIMITATIONS_PRESERVED).toBe(true);
    expect(closeout.D1M_R9_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(closeout.D1M_R9_POST_D1J_DEBT_PRESERVED).toContain("NOT_AVAILABLE");
    expect(closeout.D1M_R9_POST_D1J_DEBT_PRESERVED).toContain("Concrete C10 engineer review pending");
    expect(closeout.D1M_R9_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(closeout.D1M_R9_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(closeout.D1M_R9_UNAUTHORIZED_PRODUCT_CLAIM).toBe(false);
    expect(closeout.D1M_R9_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    expect(closeout.D1M_R9_READY_FOR_NEXT_PHASE).toBe(false);
    expect(closeout.D1M_R9_NEXT_PHASE).toBe("NOT_CANONICALIZED");
    expect(closeout.D1M_R9_NEXT_PHASE_TYPE).toBe("NOT_CANONICALIZED");
    expect(closeout.D1M_R9_CANONICAL_NEXT_PHASE).toBe("NOT_CANONICALIZED");
    expect(closeout.D1M_R9_CANONICAL_NEXT_PHASE_SCOPE).toContain("Concept-to-detailed orchestration remains an unimplemented boundary.");
    expect(closeout.D1M_R9_CANONICAL_NEXT_PHASE_SCOPE).toContain("No architecture phase identifier is canonical.");
    const capability = readFileSync(join(root, "packages/engineering-os/src/structural-concrete/capability.ts"), "utf8");
    for (const id of [
      "D1M.0.CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE",
      "D1M.R1.CAD_OR_BIM_ARTIFACT_SOURCE_REVISION",
      "D1M.R2.SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING",
      "D1M.R3.GEOMETRY_SEMANTIC_EVIDENCE",
      "D1M.R4.UNIT_COORDINATE_AXIS_REFERENCE",
      "D1M.R5.MODEL_RELATIONSHIP_EVIDENCE",
      "D1M.R6.FILE_API_ADAPTER_BOUNDARY",
      "D1M.R7.CHANGE_STALENESS_SUPERSESSION",
      "D1M.R8.D1K_D1L_D1N_EVIDENCE_HANDOFF",
      "D1M.R9.CAD_OR_BIM_INTELLIGENCE_CLOSEOUT",
    ]) {
      expect(capability).toContain(id);
    }
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "cad-bim-intelligence-closeout.ts"), "utf8");
    expect(source.includes("export function")).toBe(false);
    expect(source.includes(["from", '"@rtb/engineering-review"'].join(" "))).toBe(false);
    expect(source.includes("fetch(")).toBe(false);
    expect(scanAnalysisFormulaBypass("cad-bim-intelligence-closeout.ts", source)).toEqual([]);
  });
});
