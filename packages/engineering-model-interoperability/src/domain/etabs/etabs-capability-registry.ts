/**
 * Phase 13E — ETABS capability registry.
 * Proven: model/result export federation. Execution methods mostly reserved/unavailable.
 */

import { ETABS_BOUNDED_METHOD, ETABS_PROVIDER_KEY } from "./etabs-version";

export type EtabsCapabilityLifecycle =
  | "available"
  | "reserved"
  | "qualified"
  | "certified"
  | "unavailable"
  | "federation_proven";

export type EtabsCapabilityRow = {
  methodKey: string;
  lifecycle: EtabsCapabilityLifecycle;
  notes: string;
};

export const ETABS_FEDERATION_CAPABILITY_KEY = "model_result_export_federation" as const;

export const ETABS_CAPABILITY_REGISTRY: readonly EtabsCapabilityRow[] = [
  {
    methodKey: ETABS_FEDERATION_CAPABILITY_KEY,
    lifecycle: "federation_proven",
    notes:
      "Export/fixture model + result federation proven. Not live native COM. Not hosted execution certified.",
  },
  {
    methodKey: ETABS_BOUNDED_METHOD,
    lifecycle: "reserved",
    notes:
      "Execution reserved — ETABSSolverAdapter fail-closed when COM unavailable. Not execution-qualified.",
  },
  {
    methodKey: "modal",
    lifecycle: "reserved",
    notes: "Reserved — not execution-qualified in Phase 13E.",
  },
  {
    methodKey: "response_spectrum",
    lifecycle: "reserved",
    notes: "Reserved — not execution-qualified in Phase 13E.",
  },
  {
    methodKey: "nonlinear_static",
    lifecycle: "unavailable",
    notes: "Unavailable — out of scope for 13E export federation.",
  },
  {
    methodKey: "time_history",
    lifecycle: "unavailable",
    notes: "Unavailable — out of scope for 13E export federation.",
  },
] as const;

export function getEtabsCapability(
  methodKey: string,
): EtabsCapabilityRow | undefined {
  return ETABS_CAPABILITY_REGISTRY.find((r) => r.methodKey === methodKey);
}

export function assertEtabsCapabilityRegistry(): {
  ok: true;
  providerKey: typeof ETABS_PROVIDER_KEY;
  federationProven: true;
  noExecutionMethodQualifiedOrCertified: true;
} {
  const fed = getEtabsCapability(ETABS_FEDERATION_CAPABILITY_KEY);
  if (!fed || fed.lifecycle !== "federation_proven") {
    throw new Error("etabs_federation_capability_must_be_proven");
  }
  for (const row of ETABS_CAPABILITY_REGISTRY) {
    if (
      row.methodKey !== ETABS_FEDERATION_CAPABILITY_KEY &&
      (row.lifecycle === "qualified" || row.lifecycle === "certified")
    ) {
      throw new Error(
        `etabs_execution_method_must_not_be_qualified:${row.methodKey}`,
      );
    }
  }
  return {
    ok: true,
    providerKey: ETABS_PROVIDER_KEY,
    federationProven: true,
    noExecutionMethodQualifiedOrCertified: true,
  };
}
