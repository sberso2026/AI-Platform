/**
 * Phase 11N — frozen Project Controls V1.0 public event contract families.
 *
 * Families are the public surface. Individual event names inside a family are
 * enumerated in domain/events.ts; the family + version pair is what external
 * consumers may depend on. Identifiers and governance flags only — no payloads.
 */

import { PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION } from "../version";
import { PROJECT_CONTROLS_EVENTS } from "./events";

export type ProjectEventFamilyId =
  | "engineering.project.progress"
  | "engineering.project.schedule"
  | "engineering.project.change"
  | "engineering.project.cost"
  | "engineering.project.productivity"
  | "engineering.project.forecast"
  | "engineering.project.decision"
  | "engineering.project.scenario"
  | "engineering.project.risk_opportunity"
  | "engineering.project.assurance"
  | "engineering.project.explainability"
  | "engineering.project.organizational_learning"
  | "engineering.project.profile"
  | "engineering.project.snapshot";

export type ProjectEventContract = {
  familyId: ProjectEventFamilyId;
  contractVersion: typeof PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION;
  namePrefixes: readonly string[];
  tenantIsolated: true;
  workspaceIsolated: true;
  /** No V1.0 event carries earned value, CPM output or financial posting. */
  containsForbiddenEngineOutput: false;
  /** No V1.0 event mutates canonical Engineering OS state on consumption. */
  mutatesCanonicalStateOnConsume: false;
  advisoryOnly: boolean;
};

const BASE = {
  contractVersion: PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION,
  tenantIsolated: true,
  workspaceIsolated: true,
  containsForbiddenEngineOutput: false,
  mutatesCanonicalStateOnConsume: false,
} as const;

export const PROJECT_CONTROLS_EVENT_CONTRACTS: readonly ProjectEventContract[] = [
  { ...BASE, familyId: "engineering.project.progress", namePrefixes: ["engineering.project.progress."], advisoryOnly: false },
  { ...BASE, familyId: "engineering.project.schedule", namePrefixes: ["engineering.project.schedule."], advisoryOnly: false },
  {
    ...BASE,
    familyId: "engineering.project.change",
    namePrefixes: [
      "engineering.project.change.",
      "engineering.project.change_candidate.",
    ],
    advisoryOnly: true,
  },
  { ...BASE, familyId: "engineering.project.cost", namePrefixes: ["engineering.project.cost."], advisoryOnly: true },
  { ...BASE, familyId: "engineering.project.productivity", namePrefixes: ["engineering.project.productivity."], advisoryOnly: true },
  { ...BASE, familyId: "engineering.project.forecast", namePrefixes: ["engineering.project.forecast."], advisoryOnly: true },
  { ...BASE, familyId: "engineering.project.decision", namePrefixes: ["engineering.project.decision."], advisoryOnly: true },
  { ...BASE, familyId: "engineering.project.scenario", namePrefixes: ["engineering.project.scenario."], advisoryOnly: true },
  { ...BASE, familyId: "engineering.project.risk_opportunity", namePrefixes: ["engineering.project.risk_opportunity."], advisoryOnly: true },
  { ...BASE, familyId: "engineering.project.assurance", namePrefixes: ["engineering.project.assurance."], advisoryOnly: true },
  { ...BASE, familyId: "engineering.project.explainability", namePrefixes: ["engineering.project.explainability."], advisoryOnly: true },
  {
    ...BASE,
    familyId: "engineering.project.organizational_learning",
    namePrefixes: ["engineering.project.organizational_learning."],
    advisoryOnly: true,
  },
  { ...BASE, familyId: "engineering.project.profile", namePrefixes: ["engineering.project.profile."], advisoryOnly: false },
  { ...BASE, familyId: "engineering.project.snapshot", namePrefixes: ["engineering.project.snapshot."], advisoryOnly: false },
] as const;

export function getProjectEventContract(
  familyId: ProjectEventFamilyId,
): ProjectEventContract | undefined {
  return PROJECT_CONTROLS_EVENT_CONTRACTS.find((c) => c.familyId === familyId);
}

export function resolveEventFamily(eventName: string): ProjectEventFamilyId | undefined {
  return PROJECT_CONTROLS_EVENT_CONTRACTS.find((c) =>
    c.namePrefixes.some((prefix) => eventName.startsWith(prefix)),
  )?.familyId;
}

export function assertEventContractsFrozen(): {
  ok: true;
  familyCount: number;
  eventCount: number;
  contractVersion: string;
} {
  for (const contract of PROJECT_CONTROLS_EVENT_CONTRACTS) {
    if (contract.contractVersion !== PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION) {
      throw new Error(`event_contract_version_drift:${contract.familyId}`);
    }
    if (contract.containsForbiddenEngineOutput !== false) {
      throw new Error(`event_contract_forbidden_output:${contract.familyId}`);
    }
    if (contract.mutatesCanonicalStateOnConsume !== false) {
      throw new Error(`event_contract_mutates_canonical:${contract.familyId}`);
    }
  }

  const unmapped = PROJECT_CONTROLS_EVENTS.filter((name) => !resolveEventFamily(name));
  if (unmapped.length > 0) {
    throw new Error(`event_without_contract_family:${unmapped[0]}`);
  }

  return {
    ok: true,
    familyCount: PROJECT_CONTROLS_EVENT_CONTRACTS.length,
    eventCount: PROJECT_CONTROLS_EVENTS.length,
    contractVersion: PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION,
  };
}
