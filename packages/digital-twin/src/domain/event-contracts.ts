/**
 * Phase 12N — frozen Digital Twin V1.0 public event contract families.
 */

import { DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION } from "../version";
import { DIGITAL_TWIN_EVENTS } from "./events";

export type DigitalTwinEventFamilyId =
  | "engineering.digital_twin.core"
  | "engineering.digital_twin.state"
  | "engineering.digital_twin.ingestion"
  | "engineering.digital_twin.telemetry"
  | "engineering.digital_twin.representation"
  | "engineering.digital_twin.simulation"
  | "engineering.digital_twin.thread"
  | "engineering.digital_twin.solver";

export type DigitalTwinEventContract = {
  familyId: DigitalTwinEventFamilyId;
  contractVersion: typeof DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION;
  namePrefixes: readonly string[];
  tenantIsolated: true;
  workspaceIsolated: true;
  containsForbiddenEngineOutput: false;
  mutatesCanonicalStateOnConsume: false;
  advisoryOnly: boolean;
};

const BASE = {
  contractVersion: DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION,
  tenantIsolated: true,
  workspaceIsolated: true,
  containsForbiddenEngineOutput: false,
  mutatesCanonicalStateOnConsume: false,
} as const;

export const DIGITAL_TWIN_EVENT_CONTRACTS: readonly DigitalTwinEventContract[] = [
  {
    ...BASE,
    familyId: "engineering.digital_twin.core",
    namePrefixes: ["engineering.digital_twin.created", "engineering.digital_twin.updated", "engineering.digital_twin.relationship."],
    advisoryOnly: false,
  },
  {
    ...BASE,
    familyId: "engineering.digital_twin.state",
    namePrefixes: ["engineering.digital_twin.state.", "engineering.digital_twin.snapshot."],
    advisoryOnly: false,
  },
  {
    ...BASE,
    familyId: "engineering.digital_twin.ingestion",
    namePrefixes: [
      "engineering.digital_twin.ingestion.",
      "engineering.digital_twin.state_candidate.",
      "engineering.digital_twin.candidate.",
    ],
    advisoryOnly: true,
  },
  {
    ...BASE,
    familyId: "engineering.digital_twin.telemetry",
    namePrefixes: [
      "engineering.digital_twin.telemetry.",
      "engineering.digital_twin.telemetry_binding.",
    ],
    advisoryOnly: true,
  },
  {
    ...BASE,
    familyId: "engineering.digital_twin.representation",
    namePrefixes: [
      "engineering.digital_twin.representation.",
      "engineering.digital_twin.mapping.",
    ],
    advisoryOnly: false,
  },
  {
    ...BASE,
    familyId: "engineering.digital_twin.simulation",
    namePrefixes: [
      "engineering.digital_twin.simulation.",
      "engineering.digital_twin.simulated_state.",
    ],
    advisoryOnly: true,
  },
  {
    ...BASE,
    familyId: "engineering.digital_twin.thread",
    namePrefixes: ["engineering.digital_twin.thread."],
    advisoryOnly: true,
  },
  {
    ...BASE,
    familyId: "engineering.digital_twin.solver",
    namePrefixes: [
      "engineering.digital_twin.solver.",
      "engineering.solver.",
    ],
    advisoryOnly: true,
  },
] as const;

export function getDigitalTwinEventContract(
  familyId: DigitalTwinEventFamilyId,
): DigitalTwinEventContract | undefined {
  return DIGITAL_TWIN_EVENT_CONTRACTS.find((c) => c.familyId === familyId);
}

export function resolveEventFamily(eventName: string): DigitalTwinEventFamilyId | undefined {
  return DIGITAL_TWIN_EVENT_CONTRACTS.find((c) =>
    c.namePrefixes.some((prefix) => eventName.startsWith(prefix)),
  )?.familyId;
}

export function assertEventContractsFrozen(): {
  ok: true;
  familyCount: number;
  eventCount: number;
  contractVersion: string;
} {
  for (const contract of DIGITAL_TWIN_EVENT_CONTRACTS) {
    if (contract.contractVersion !== DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION) {
      throw new Error(`event_contract_version_drift:${contract.familyId}`);
    }
    if (contract.containsForbiddenEngineOutput !== false) {
      throw new Error(`event_contract_forbidden_output:${contract.familyId}`);
    }
    if (contract.mutatesCanonicalStateOnConsume !== false) {
      throw new Error(`event_contract_mutates_canonical:${contract.familyId}`);
    }
  }
  return {
    ok: true,
    familyCount: DIGITAL_TWIN_EVENT_CONTRACTS.length,
    eventCount: DIGITAL_TWIN_EVENTS.length,
    contractVersion: DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION,
  };
}
