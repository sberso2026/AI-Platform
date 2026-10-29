/**
 * Phase 13F — frozen Engineering Model Interoperability V1.0 event contracts.
 */

import { ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACT_VERSION } from "../version";
import { ENGINEERING_MODEL_INTEROP_EVENT_TYPES } from "./events";

export type EmiEventFamilyId =
  | "engineering.model.reference"
  | "engineering.model.version"
  | "engineering.model.element"
  | "engineering.model.mapping"
  | "engineering.model.change_impact"
  | "engineering.model.result";

export type EmiEventContract = {
  familyId: EmiEventFamilyId;
  contractVersion: typeof ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACT_VERSION;
  namePrefixes: readonly string[];
  tenantIsolated: true;
  workspaceIsolated: true;
  containsForbiddenEngineOutput: false;
  mutatesSourceModelOnConsume: false;
  advisoryOnly: boolean;
};

const BASE = {
  contractVersion: ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACT_VERSION,
  tenantIsolated: true as const,
  workspaceIsolated: true as const,
  containsForbiddenEngineOutput: false as const,
  mutatesSourceModelOnConsume: false as const,
};

export const EMI_EVENT_CONTRACTS: readonly EmiEventContract[] = [
  {
    ...BASE,
    familyId: "engineering.model.reference",
    namePrefixes: ["engineering.model.reference."],
    advisoryOnly: false,
  },
  {
    ...BASE,
    familyId: "engineering.model.version",
    namePrefixes: ["engineering.model.version."],
    advisoryOnly: false,
  },
  {
    ...BASE,
    familyId: "engineering.model.element",
    namePrefixes: ["engineering.model.element."],
    advisoryOnly: false,
  },
  {
    ...BASE,
    familyId: "engineering.model.mapping",
    namePrefixes: [
      "engineering.model.mapping.",
      "engineering.model.mapping.review.",
    ],
    advisoryOnly: true,
  },
  {
    ...BASE,
    familyId: "engineering.model.change_impact",
    namePrefixes: ["engineering.model.change_impact."],
    advisoryOnly: true,
  },
  {
    ...BASE,
    familyId: "engineering.model.result",
    namePrefixes: ["engineering.model.result."],
    advisoryOnly: false,
  },
] as const;

export function resolveEventFamily(
  eventType: string,
): EmiEventContract | undefined {
  return EMI_EVENT_CONTRACTS.find((c) =>
    c.namePrefixes.some(
      (p) => eventType === p.replace(/\.$/, "") || eventType.startsWith(p),
    ),
  );
}

export function assertEventContractsFrozen(): {
  ok: true;
  contractVersion: string;
  familyCount: number;
} {
  for (const name of ENGINEERING_MODEL_INTEROP_EVENT_TYPES) {
    if (!resolveEventFamily(name)) {
      throw new Error(`event_family_unmapped:${name}`);
    }
  }
  for (const c of EMI_EVENT_CONTRACTS) {
    if (c.containsForbiddenEngineOutput !== false) {
      throw new Error(`event_forbidden_output:${c.familyId}`);
    }
    if (
      c.contractVersion !==
      ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACT_VERSION
    ) {
      throw new Error(`event_contract_version_drift:${c.familyId}`);
    }
  }
  return {
    ok: true,
    contractVersion: ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACT_VERSION,
    familyCount: EMI_EVENT_CONTRACTS.length,
  };
}
