/**
 * Phase 11N — frozen Project Controls V1.0 public contract families.
 *
 * Contract families mirror the twelve intelligence contributors plus profile,
 * snapshot and timeline surfaces. Each family carries governance metadata only.
 */

import { PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION, projectDecisionOwnership } from "../version";

export type ProjectContractFamilyId =
  | "pc.contract.progress"
  | "pc.contract.schedule"
  | "pc.contract.change"
  | "pc.contract.cost"
  | "pc.contract.productivity"
  | "pc.contract.forecast"
  | "pc.contract.decision_support"
  | "pc.contract.scenario"
  | "pc.contract.risk_opportunity"
  | "pc.contract.assurance"
  | "pc.contract.explainability"
  | "pc.contract.organizational_learning"
  | "pc.contract.profile"
  | "pc.contract.snapshot"
  | "pc.contract.timeline";

export type ProjectPublicContract = {
  contractId: ProjectContractFamilyId;
  version: typeof PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION;
  owner: "project_controls";
  permissions: readonly string[];
  errors: readonly string[];
  idempotency: "required_on_mutations";
  compatibility: "semver_minor_additive_only";
  deprecation: "none_in_v1";
  audit: "required";
  advisoryOnly: boolean;
  mutatesCanonicalState: false;
};

const BASE = {
  version: PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION,
  owner: "project_controls" as const,
  permissions: ["project_controls.read", "project_controls.assess", "project_controls.publish"],
  errors: [
    "missing_scope",
    "forbidden_capability",
    "idempotency_conflict",
    "review_required",
    "advisory_only_violation",
  ],
  idempotency: "required_on_mutations" as const,
  compatibility: "semver_minor_additive_only" as const,
  deprecation: "none_in_v1" as const,
  audit: "required" as const,
  mutatesCanonicalState: false as const,
};

export const PROJECT_CONTROLS_PUBLIC_CONTRACTS: readonly ProjectPublicContract[] = [
  { ...BASE, contractId: "pc.contract.progress", advisoryOnly: false },
  { ...BASE, contractId: "pc.contract.schedule", advisoryOnly: false },
  { ...BASE, contractId: "pc.contract.change", advisoryOnly: true },
  { ...BASE, contractId: "pc.contract.cost", advisoryOnly: true },
  { ...BASE, contractId: "pc.contract.productivity", advisoryOnly: true },
  { ...BASE, contractId: "pc.contract.forecast", advisoryOnly: true },
  { ...BASE, contractId: "pc.contract.decision_support", advisoryOnly: true },
  { ...BASE, contractId: "pc.contract.scenario", advisoryOnly: true },
  { ...BASE, contractId: "pc.contract.risk_opportunity", advisoryOnly: true },
  { ...BASE, contractId: "pc.contract.assurance", advisoryOnly: true },
  { ...BASE, contractId: "pc.contract.explainability", advisoryOnly: true },
  { ...BASE, contractId: "pc.contract.organizational_learning", advisoryOnly: true },
  { ...BASE, contractId: "pc.contract.profile", advisoryOnly: true },
  { ...BASE, contractId: "pc.contract.snapshot", advisoryOnly: false },
  { ...BASE, contractId: "pc.contract.timeline", advisoryOnly: false },
] as const;

export function getProjectPublicContract(
  contractId: ProjectContractFamilyId,
): ProjectPublicContract | undefined {
  return PROJECT_CONTROLS_PUBLIC_CONTRACTS.find((c) => c.contractId === contractId);
}

export function assertPublicContractsFrozen(): {
  ok: true;
  contractCount: number;
  contractVersion: string;
  projectDecisionOwnership: typeof projectDecisionOwnership;
} {
  for (const contract of PROJECT_CONTROLS_PUBLIC_CONTRACTS) {
    if (contract.version !== PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION) {
      throw new Error(`public_contract_version_drift:${contract.contractId}`);
    }
    if (contract.mutatesCanonicalState !== false) {
      throw new Error(`public_contract_mutates_canonical:${contract.contractId}`);
    }
    if (contract.audit !== "required") {
      throw new Error(`public_contract_audit_required:${contract.contractId}`);
    }
  }
  if (projectDecisionOwnership !== "human_only") {
    throw new Error("project_decision_ownership_must_be_human_only");
  }
  return {
    ok: true,
    contractCount: PROJECT_CONTROLS_PUBLIC_CONTRACTS.length,
    contractVersion: PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION,
    projectDecisionOwnership,
  };
}
