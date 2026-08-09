/**
 * Phase 13C — SPACE GASS solver capability registry.
 * Only the selected bounded method may be qualified.
 */

import {
  SPACEGASS_BOUNDED_METHOD,
  SPACEGASS_PROVIDER_KEY,
} from "./spacegass-version";

export type SpaceGassCapabilityLifecycle =
  | "available"
  | "reserved"
  | "qualified"
  | "certified"
  | "unavailable";

export type SpaceGassCapabilityRow = {
  methodKey: string;
  lifecycle: SpaceGassCapabilityLifecycle;
  notes: string;
};

/** Selected bounded method key literal (linear_elastic_static). */
export const SPACEGASS_SELECTED_METHOD_LITERAL = "linear_elastic_static" as const;

export const SPACEGASS_CAPABILITY_REGISTRY: readonly SpaceGassCapabilityRow[] = [
  {
    methodKey: SPACEGASS_BOUNDED_METHOD,
    lifecycle: "qualified",
    notes:
      "Bounded first method linear_elastic_static. Adapter/mapping/fail-closed qualified; hosted execution certified=false.",
  },
  {
    methodKey: "nonlinear_static",
    lifecycle: "reserved",
    notes: "Reserved — not qualified in Phase 13C.",
  },
  {
    methodKey: "modal",
    lifecycle: "reserved",
    notes: "Reserved — not qualified in Phase 13C.",
  },
  {
    methodKey: "dynamic_response",
    lifecycle: "unavailable",
    notes: "Unavailable — out of scope for 13C.",
  },
] as const;

export function getSpaceGassCapability(
  methodKey: string,
): SpaceGassCapabilityRow | undefined {
  return SPACEGASS_CAPABILITY_REGISTRY.find((r) => r.methodKey === methodKey);
}

export function assertSpaceGassCapabilityRegistry(): {
  ok: true;
  providerKey: typeof SPACEGASS_PROVIDER_KEY;
  selectedMethod: typeof SPACEGASS_BOUNDED_METHOD;
  onlySelectedQualified: true;
} {
  const selected = getSpaceGassCapability(SPACEGASS_BOUNDED_METHOD);
  if (!selected || selected.lifecycle !== "qualified") {
    throw new Error("spacegass_selected_method_must_be_qualified");
  }
  for (const row of SPACEGASS_CAPABILITY_REGISTRY) {
    if (
      row.methodKey !== SPACEGASS_BOUNDED_METHOD &&
      (row.lifecycle === "qualified" || row.lifecycle === "certified")
    ) {
      throw new Error(`spacegass_unselected_method_must_not_be_qualified:${row.methodKey}`);
    }
  }
  return {
    ok: true,
    providerKey: SPACEGASS_PROVIDER_KEY,
    selectedMethod: SPACEGASS_BOUNDED_METHOD,
    onlySelectedQualified: true,
  };
}
