import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { CANONICAL_NEXT_PHASE as POST_D1H_CANONICAL_NEXT_PHASE, D1I_RUNTIME_IMPLEMENTED, D1J_STARTED, D1K_STARTED, D2_STARTED_BY_THIS_PHASE as D2_FROM_POST_D1H } from "./post-d1h-roadmap";
import { CANONICAL_NEXT_PHASE as D1I_R5_NEXT_PHASE, D1I_R5_FINAL_MATURITY_STATE, D1I_TRACK_STATUS as D1I_R5_TRACK_STATUS } from "./twin-closeout";
import {
  CANONICAL_NEXT_PHASE,
  D1G_CERTIFIED_SOLVER_STATUS,
  D1G_CERTIFICATION_PHASE_INVENTED_WITHOUT_AUTHORITY,
  D1G_OFFLINE_CONFORMANCE_EQUALS_CERTIFIED_LIVE_SOLVER,
  D1I_MATURITY,
  D1I_MATURITY_PROMOTION,
  D1I_NEW_RUNTIME_FEATURE_ADDED,
  D1J_0_ARCHITECTURE_AUTHORIZED,
  D1J_0_OPTIMIZATION_RUNTIME_COUNT,
  D1J_0_SOLVER_EXECUTION_COUNT,
  D1J_AI_CAN_APPROVE_OPTIMIZED_DESIGN,
  D1J_ARCHITECTURE_READINESS_EQUALS_RUNTIME_READINESS,
  D1J_ARCHITECTURE_REQUIRES_CERTIFIED_SOLVER_TO_BE_DEFINED,
  D1J_ARCHITECTURE_SEPARABLE_FROM_RUNTIME,
  D1J_CURRENT_STATUS,
  D1J_DEFAULT_OBJECTIVE_WEIGHTS_CREATED,
  D1J_MULTI_OBJECTIVE_ARCHITECTURE_REQUIRED,
  D1J_OPTIMIZATION_CANDIDATE_EQUALS_APPROVED_DESIGN,
  D1J_PILOT_OPTIMIZATION_CURRENTLY_AUTHORIZED,
  D1J_RUNTIME_CAPABILITY_PROMOTED,
  D1J_RUNTIME_OPTIMIZATION_AUTHORIZED,
  D1J_SYNTHETIC_OPTIMIZATION_CURRENTLY_AUTHORIZED,
  D1J_UNAUTHORIZED_PRODUCT_CLAIM,
  D1J_UNIVERSAL_BEST_DESIGN_SCORE_CREATED,
  D1K_STARTED_BY_POST_D1I_CANONICALIZATION,
  D1L_STARTED,
  D1_STRUCTURAL_PACK_COMPLETE,
  D2_STARTED_BY_THIS_PHASE,
  D3_STARTED_BY_THIS_PHASE,
  NEW_ENGINEERING_FORMULA_COUNT,
  NEXT_PHASE_TYPE,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
  SPACE_GASS_CERTIFIED_FOR_D1J_OPTIMIZATION,
  SPACE_GASS_LIVE_VALIDATED,
} from "./roadmap-after-twin-closeout";

const here = dirname(fileURLToPath(import.meta.url));

describe("EOS roadmap after structural digital twin closeout", () => {
  it("keeps D1I closed and separates D1J architecture from runtime", () => {
    expect(D1I_R5_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1I_R5_FINAL_MATURITY_STATE).toBe(D1I_MATURITY);
    expect(D1I_MATURITY_PROMOTION).toBe(false);
    expect(D1I_NEW_RUNTIME_FEATURE_ADDED).toBe(false);
    expect(D1I_RUNTIME_IMPLEMENTED).toBe(false);
    expect(D1I_R5_NEXT_PHASE).toBe("EOS-ROADMAP-POST-D1I-CANONICALIZATION");
    expect(POST_D1H_CANONICAL_NEXT_PHASE).toBe("EOS-D1I-0-STRUCTURAL-DIGITAL-TWIN-ARCHITECTURE");
    expect(D1J_STARTED).toBe(false);
    expect(D1J_CURRENT_STATUS).toBe("NOT_STARTED");
    expect(D1J_0_ARCHITECTURE_AUTHORIZED).toBe(true);
    expect(D1J_ARCHITECTURE_SEPARABLE_FROM_RUNTIME).toBe(true);
    expect(D1J_ARCHITECTURE_REQUIRES_CERTIFIED_SOLVER_TO_BE_DEFINED).toBe(false);
    expect(D1J_ARCHITECTURE_READINESS_EQUALS_RUNTIME_READINESS).toBe(false);
    expect(D1J_RUNTIME_OPTIMIZATION_AUTHORIZED).toBe(false);
    expect(D1J_0_OPTIMIZATION_RUNTIME_COUNT).toBe(0);
    expect(D1J_0_SOLVER_EXECUTION_COUNT).toBe(0);
    expect(CANONICAL_NEXT_PHASE).toBe("EOS-D1J-0-STRUCTURAL-OPTIMIZATION-CERTIFICATION-ARCHITECTURE");
    expect(NEXT_PHASE_TYPE).toBe("STRUCTURAL_OPTIMIZATION_CERTIFICATION_ARCHITECTURE");
  });

  it("keeps solver certification, approval, and neighbouring tracks closed", () => {
    expect(D1G_CERTIFIED_SOLVER_STATUS).toBe("NOT_CERTIFIED");
    expect(D1G_OFFLINE_CONFORMANCE_EQUALS_CERTIFIED_LIVE_SOLVER).toBe(false);
    expect(D1G_CERTIFICATION_PHASE_INVENTED_WITHOUT_AUTHORITY).toBe(false);
    expect(SPACE_GASS_LIVE_VALIDATED).toBe(false);
    expect(SPACE_GASS_CERTIFIED_FOR_D1J_OPTIMIZATION).toBe(false);
    expect(D1J_SYNTHETIC_OPTIMIZATION_CURRENTLY_AUTHORIZED).toBe(false);
    expect(D1J_PILOT_OPTIMIZATION_CURRENTLY_AUTHORIZED).toBe(false);
    expect(D1J_OPTIMIZATION_CANDIDATE_EQUALS_APPROVED_DESIGN).toBe(false);
    expect(D1J_AI_CAN_APPROVE_OPTIMIZED_DESIGN).toBe(false);
    expect(D1J_MULTI_OBJECTIVE_ARCHITECTURE_REQUIRED).toBe(true);
    expect(D1J_UNIVERSAL_BEST_DESIGN_SCORE_CREATED).toBe(false);
    expect(D1J_DEFAULT_OBJECTIVE_WEIGHTS_CREATED).toBe(false);
    expect(D1J_UNAUTHORIZED_PRODUCT_CLAIM).toBe(false);
    expect(D1K_STARTED).toBe(false);
    expect(D1K_STARTED_BY_POST_D1I_CANONICALIZATION).toBe(false);
    expect(D1L_STARTED).toBe(false);
    expect(D1L_STARTED).toBe(false);
    expect(D2_FROM_POST_D1H).toBe(false);
    expect(D2_STARTED_BY_THIS_PHASE).toBe(false);
    expect(D3_STARTED_BY_THIS_PHASE).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1J_RUNTIME_CAPABILITY_PROMOTED).toBe(false);
    expect(PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    const source = readFileSync(join(here, "roadmap-after-twin-closeout.ts"), "utf8");
    const doc = readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_POST_D1I_CANONICAL_ROADMAP.md"), "utf8");
    expect(source).not.toMatch(/\bfetch\(|mqtt|opcua|modbus|WebSocket|fft\(|child_process|eval\(|new Function/);
    expect(doc).toContain("does not authorize D1J optimization runtime");
    expect(scanAnalysisFormulaBypass(join(here, "roadmap-after-twin-closeout.ts"), source)).toEqual([]);
    expect(scanAnalysisFormulaBypass(join(here, "../../../../docs/architecture/engineering-os/EOS_POST_D1I_CANONICAL_ROADMAP.md"), doc)).toEqual([]);
    expect(readdirSync(here).filter((name) => /digital-twin|d1i-/i.test(name))).toEqual([]);
  });
});
