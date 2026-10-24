import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  C10_VALIDATION_LANE_STATUS,
  D1F_R3_STEEL_SYSTEM_DISPATCH_SCOPE,
  D1G_R2_DEFAULT_RESOURCE_LIMITS,
  D1G_R3_COMMERCIAL_PROVIDER_CONNECTOR_IMPLEMENTED,
  D1G_R3_COPYRIGHTED_VENDOR_DOCUMENTATION_REPRODUCED,
  D1G_R3_FEATURE_FLAG_DEFAULT,
  D1G_R3_LICENSE_BYPASS_ALLOWED,
  D1G_R3_MATURITY_STATE,
  D1G_R3_NEW_ENGINEERING_FORMULA_COUNT,
  D1G_R3_NEW_VENDOR_SDK_DEPENDENCY_COUNT,
  D1G_R3_ONE_MAPPING_ASSUMED_VALID_FOR_ALL_PROVIDER_VERSIONS,
  D1G_R3_PROVIDER_ERROR_CODES,
  D1G_R3_R2_LIMITS_CLASSIFIED_AS_PRODUCTION_SCALE,
  D1G_R3_R2_PACKAGE_SCALE_CLASSIFICATION,
  D1G_R3_R4_CONNECTOR_READ_ONLY,
  D1G_R3_R4_HANDOFF_READY,
  D1G_R3_R4_SCALE_CHANGE_REQUIRED,
  D1G_R3_R4_SOLVER_EXECUTION_IN_SCOPE,
  D1G_R3_SELECTED_INTEGRATION_MODE,
  D1G_R3_SELECTED_PROVIDER,
  D1G_R3_SIGN_MAPPING_INFERRED,
  D1G_R3_SOLVER_EXECUTION_COUNT,
  D1G_R3_UNKNOWN_PROVIDER_SEMANTIC_GUESSED,
  D1G_R3_UNSOURCED_MARKET_SHARE_SCORE_USED,
  D1G_R3_VENDOR_API_CALL_PRESENT,
  PARALLEL_PROVIDER_SEMANTIC_MAPPING_IMPLEMENTATIONS,
  PARALLEL_SOLVER_INTEGRATION_DOMAIN_CREATED,
  PROVIDER_BRAND_EQUALS_RESULT_AUTHORITY,
} from "@rtb/types";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { D1G_R3_ARCHITECTURE, D1G_R3_SELECTION_RECORD, d1gR3SelectionFingerprint, reviewD1gR3ProviderArchitecture } from "./provider-selection";

const HERE = dirname(fileURLToPath(import.meta.url));

describe("EOS-D1G-R3 first provider selection architecture", () => {
  it("selects SPACE GASS from the recorded evidence without implementing a connector", () => {
    const record = JSON.parse(readFileSync(join(HERE, "eos-d1g-r3-provider-selection.json"), "utf8")) as {
      selectedProvider: string;
      connectorImplemented: boolean;
      scaleClassification: string;
    };
    expect(record.selectedProvider).toBe("SPACE_GASS");
    expect(record.connectorImplemented).toBe(false);
    expect(record.scaleClassification).toBe("FIXTURE_ONLY");
    expect(D1G_R3_SELECTION_RECORD.selectedProvider).toBe(D1G_R3_SELECTED_PROVIDER);
    expect(D1G_R3_SELECTION_RECORD.integrationMode).toBe(D1G_R3_SELECTED_INTEGRATION_MODE);
    expect(D1G_R3_SELECTION_RECORD.r2Limits).toEqual(D1G_R2_DEFAULT_RESOURCE_LIMITS);
    expect(D1G_R3_SELECTION_RECORD.r2Limits.maxFileBytes).toBe(262144);
    expect(D1G_R3_SELECTION_RECORD.r2Limits.maxResultCount).toBe(64);
    expect(D1G_R3_SELECTION_RECORD.r2Limits.maxObjectCount).toBe(64);
    expect(D1G_R3_SELECTION_RECORD.r2Limits.maxNestingDepth).toBe(8);
    expect(D1G_R3_R2_LIMITS_CLASSIFIED_AS_PRODUCTION_SCALE).toBe(false);
    expect(D1G_R3_R2_PACKAGE_SCALE_CLASSIFICATION).toBe("FIXTURE_ONLY");
    expect(D1G_R3_R4_SCALE_CHANGE_REQUIRED).toBe(true);
    expect(D1G_R3_COMMERCIAL_PROVIDER_CONNECTOR_IMPLEMENTED).toBe(false);
    expect(D1G_R3_VENDOR_API_CALL_PRESENT).toBe(false);
    expect(D1G_R3_SOLVER_EXECUTION_COUNT).toBe(0);
    expect(D1G_R3_NEW_VENDOR_SDK_DEPENDENCY_COUNT).toBe(0);
    expect(D1G_R3_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1G_R3_FEATURE_FLAG_DEFAULT).toBe(false);
    expect(D1G_R3_R4_CONNECTOR_READ_ONLY).toBe(true);
    expect(D1G_R3_R4_SOLVER_EXECUTION_IN_SCOPE).toBe(false);
    expect(D1G_R3_R4_HANDOFF_READY).toBe(true);
    expect(D1G_R3_SIGN_MAPPING_INFERRED).toBe(false);
    expect(D1G_R3_UNKNOWN_PROVIDER_SEMANTIC_GUESSED).toBe(false);
    expect(D1G_R3_UNSOURCED_MARKET_SHARE_SCORE_USED).toBe(false);
    expect(D1G_R3_LICENSE_BYPASS_ALLOWED).toBe(false);
    expect(D1G_R3_ONE_MAPPING_ASSUMED_VALID_FOR_ALL_PROVIDER_VERSIONS).toBe(false);
    expect(PARALLEL_SOLVER_INTEGRATION_DOMAIN_CREATED).toBe(false);
    expect(PARALLEL_PROVIDER_SEMANTIC_MAPPING_IMPLEMENTATIONS).toBe(false);
    expect(PROVIDER_BRAND_EQUALS_RESULT_AUTHORITY).toBe(false);
    expect(D1G_R3_COPYRIGHTED_VENDOR_DOCUMENTATION_REPRODUCED).toBe(false);
    expect(D1G_R3_MATURITY_STATE).toBe("FIRST_PROVIDER_SELECTED_AND_CONNECTOR_ARCHITECTURE_DEFINED");
    expect(C10_VALIDATION_LANE_STATUS).toBe("PENDING_QUALIFIED_HUMAN_REVIEW");
    expect(D1F_R3_STEEL_SYSTEM_DISPATCH_SCOPE).toBe("D1D_EU_TENSION only");
    expect(D1G_R3_PROVIDER_ERROR_CODES).toContain("LICENSE_UNAVAILABLE");
    expect(D1G_R3_ARCHITECTURE.credentialArchitecture).toBe("NOT_APPLICABLE");
    expect(D1G_R3_ARCHITECTURE.flow).toContain("D1F_NORMALIZATION");
    const fingerprint = d1gR3SelectionFingerprint();
    expect(fingerprint).toBe(d1gR3SelectionFingerprint());
    expect(fingerprint).toHaveLength(64);
    expect(reviewD1gR3ProviderArchitecture()).toEqual({ pass: true, gaps: [] });
    const source = readFileSync(join(HERE, "provider-selection.ts"), "utf8");
    for (const token of ["fetch(", "child_process", "spawn(", "execFile("]) {
      expect(source.includes(token), token).toBe(false);
    }
    expect(scanAnalysisFormulaBypass("provider-selection.ts", source)).toEqual([]);
  });
});
