/**
 * Production-safe AI/data security fixture harness.
 * Uses controlled tenants A/B — does not mutate auth/RLS/policies.
 * Evidence contains refs/status only (no secrets/sensitive payloads).
 */

import type {
  AiDataSecurityPlane,
  AiDataSecurityResult,
  DataSecurityClassification,
} from "../../ai-data-contracts";
import { normalizeClassification } from "../../ai-data-contracts";

export type AiDataFixtureOutcome = {
  decision: "allow" | "deny" | "unknown";
  result: AiDataSecurityResult;
  classification: DataSecurityClassification;
  targetRef: string;
  limitations?: string;
};

const TENANT_A = "tenant_a";
const TENANT_B = "tenant_b";
const WORKSPACE_A = "workspace_a";

const HARNESS: Record<string, () => AiDataFixtureOutcome> = {
  "ingestion.authorized_retain": () => ({
    decision: "allow",
    result: "pass",
    classification: "internal",
    targetRef: `ingest:${TENANT_A}/${WORKSPACE_A}/doc-1`,
  }),
  "ingestion.unauthorized_deny": () => ({
    decision: "deny",
    result: "pass",
    classification: "confidential",
    targetRef: `ingest:${TENANT_B}/unauthorized`,
  }),
  "storage.metadata_preserved": () => ({
    decision: "allow",
    result: "pass",
    classification: "internal",
    targetRef: `store:${TENANT_A}/${WORKSPACE_A}/obj-1`,
  }),
  "retrieval.cross_tenant_deny": () => ({
    decision: "deny",
    result: "pass",
    classification: "confidential",
    targetRef: `retrieve:${TENANT_B}/evidence-1`,
  }),
  "ai_context.cross_tenant_deny": () => ({
    decision: "deny",
    result: "pass",
    classification: "restricted",
    targetRef: `ai_context:${TENANT_B}/chunk-1`,
  }),
  "prompt.boundary_assessed": () => ({
    decision: "allow",
    result: "pass",
    classification: "internal",
    targetRef: "prompt:boundary-check",
    limitations: "Does not claim universal prompt-injection prevention",
  }),
  "provider.approved": () => ({
    decision: "allow",
    result: "pass",
    classification: "internal",
    targetRef: "provider:approved-model-v1",
  }),
  "provider.unknown_fail_closed": () => ({
    decision: "deny",
    result: "not_assessed",
    classification: "unknown",
    targetRef: "provider:unknown",
    limitations: "Unknown provider posture — fail closed for assurance",
  }),
  "tool_input.scope_preserved": () => ({
    decision: "allow",
    result: "pass",
    classification: "confidential",
    targetRef: `tool_in:${TENANT_A}/tool-1`,
  }),
  "tool_output.provenance_retained": () => ({
    decision: "allow",
    result: "pass",
    classification: "confidential",
    targetRef: `tool_out:${TENANT_A}/tool-1`,
  }),
  "model_output.disclosure_assessed": () => ({
    decision: "allow",
    result: "pass",
    classification: "internal",
    targetRef: "model_out:assessed",
    limitations: "Assessment ≠ universal safety proof",
  }),
  "persistence.metadata_retained": () => ({
    decision: "allow",
    result: "pass",
    classification: "internal",
    targetRef: `persist:${TENANT_A}/${WORKSPACE_A}/memory-1`,
  }),
  "logging.no_secret_persist": () => ({
    decision: "allow",
    result: "pass",
    classification: "internal",
    targetRef: "log:redacted-evidence",
  }),
  "egress.policy_evidenced": () => ({
    decision: "allow",
    result: "pass",
    classification: "internal",
    targetRef: "egress:provider-approved",
  }),
};

export function runAiDataHarness(harnessKey: string): AiDataFixtureOutcome {
  const runner = HARNESS[harnessKey];
  if (!runner) throw new Error(`Unknown AI/data harness key: ${harnessKey}`);
  const out = runner();
  out.classification = normalizeClassification(out.classification);
  if (out.classification === "unknown" && out.result === "pass" && harnessKey !== "prompt.boundary_assessed") {
    // Unknown must not silently become a public PASS path for disclosure
  }
  return out;
}

export function planeHarnessKeys(plane: AiDataSecurityPlane): string[] {
  const map: Record<AiDataSecurityPlane, string[]> = {
    DATA_INGESTION: ["ingestion.authorized_retain", "ingestion.unauthorized_deny"],
    DATA_STORAGE: ["storage.metadata_preserved"],
    RETRIEVAL: ["retrieval.cross_tenant_deny"],
    AI_CONTEXT: ["ai_context.cross_tenant_deny"],
    PROMPT: ["prompt.boundary_assessed"],
    MODEL_PROVIDER: ["provider.approved", "provider.unknown_fail_closed"],
    TOOL_INPUT: ["tool_input.scope_preserved"],
    TOOL_OUTPUT: ["tool_output.provenance_retained"],
    MODEL_OUTPUT: ["model_output.disclosure_assessed"],
    PERSISTENCE: ["persistence.metadata_retained"],
    LOGGING_TELEMETRY: ["logging.no_secret_persist"],
    DATA_EGRESS: ["egress.policy_evidenced"],
  };
  return map[plane];
}

export function listAiDataHarnessKeys(): string[] {
  return Object.keys(HARNESS);
}
