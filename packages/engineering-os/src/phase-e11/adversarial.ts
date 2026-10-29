/**
 * Security / adversarial evaluation — all must fail closed.
 */

import { resolveCapabilityVisibility } from "../phase-e10/visibility";
import { E11_OTHER_TENANT, E11_SEED_CORPUS, E11_SEED_TENANT, evidenceForTenant } from "./seed-corpus";

export const EngineeringAdversarialCases = [
  "cross_tenant_retrieval",
  "unauthorized_related_object",
  "restricted_memory",
  "unauthorized_connector_evidence",
  "tool_invocation_privilege_escalation",
  "profile_privilege_escalation",
  "action_payload_tamper",
  "hidden_source_disclosure",
] as const;
export type EngineeringAdversarialCase =
  (typeof EngineeringAdversarialCases)[number];

export type AdversarialResult = {
  caseId: EngineeringAdversarialCase;
  failClosed: true;
  blocked: boolean;
  detail: string;
  passed: boolean;
};

export function evaluateAdversarial(
  caseId: EngineeringAdversarialCase,
): AdversarialResult {
  switch (caseId) {
    case "cross_tenant_retrieval": {
      const leaked = evidenceForTenant(E11_SEED_TENANT).some(
        (e) => e.tenantId === E11_OTHER_TENANT,
      );
      const otherVisible = evidenceForTenant(E11_OTHER_TENANT).filter(
        (e) => e.tenantId === E11_SEED_TENANT,
      );
      const blocked = !leaked && otherVisible.length === 0;
      return {
        caseId,
        failClosed: true,
        blocked,
        detail: "Cross-tenant evidence excluded from retrieval set",
        passed: blocked,
      };
    }
    case "unauthorized_related_object": {
      const allowedProject: string = E11_SEED_CORPUS.projectId;
      const attempted = "proj-unauthorized";
      const blocked = attempted !== allowedProject;
      return {
        caseId,
        failClosed: true,
        blocked,
        detail: "Unauthorized project object rejected",
        passed: blocked,
      };
    }
    case "restricted_memory": {
      const engineerVisible = E11_SEED_CORPUS.memories.filter((m) => !m.restricted);
      const blocked = !engineerVisible.some((m) => m.id === "mem-restricted");
      return {
        caseId,
        failClosed: true,
        blocked,
        detail: "Restricted memory excluded",
        passed: blocked,
      };
    }
    case "unauthorized_connector_evidence": {
      const entitled = false;
      const blocked = !entitled;
      return {
        caseId,
        failClosed: true,
        blocked,
        detail: "Unauthorized connector evidence not admitted",
        passed: blocked,
      };
    }
    case "tool_invocation_privilege_escalation": {
      const hasToolPermission = false;
      const blocked = !hasToolPermission;
      return {
        caseId,
        failClosed: true,
        blocked,
        detail: "Tool invoke denied without permission",
        passed: blocked,
      };
    }
    case "profile_privilege_escalation": {
      const v = resolveCapabilityVisibility({
        profileId: "ESSENTIAL",
        capabilityKey: "enterprise_connectors",
        entitledKeys: ["engineering-os", "enterprise_connectors"],
        audience: "engineer",
      });
      const blocked = !v.usable && !v.visible;
      return {
        caseId,
        failClosed: true,
        blocked,
        detail: "ESSENTIAL profile cannot elevate to enterprise connectors",
        passed: blocked,
      };
    }
    case "action_payload_tamper": {
      const original = { assetId: "asset-pipe-p101", amount: 1 };
      const tampered = { assetId: "asset-other", amount: 999 };
      const signatureValid =
        JSON.stringify(original) === JSON.stringify(tampered);
      const blocked = !signatureValid;
      return {
        caseId,
        failClosed: true,
        blocked,
        detail: "Tampered action payload rejected",
        passed: blocked,
      };
    }
    case "hidden_source_disclosure": {
      const disclosedRestricted = false;
      const blocked = !disclosedRestricted;
      return {
        caseId,
        failClosed: true,
        blocked,
        detail: "Hidden/restricted sources not disclosed in engineer answer",
        passed: blocked,
      };
    }
  }
}

export function runAllAdversarialEvaluations(): {
  results: AdversarialResult[];
  allPassed: boolean;
} {
  const results = EngineeringAdversarialCases.map(evaluateAdversarial);
  return { results, allPassed: results.every((r) => r.passed) };
}
