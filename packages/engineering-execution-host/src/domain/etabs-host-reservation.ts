/**
 * ETABS host reservation — no adapter / no execution.
 */

import {
  ETABSAdapterImplemented,
  ETABSExecutionCertified,
} from "../version";
import {
  unavailableProviderProbeResult,
  type EngineeringProviderHostProbe,
  type ProviderHostProbeResult,
} from "./provider-host-probe";

export type EtabsHostReservation = {
  providerId: "etabs";
  reserved: true;
  ETABSAdapterImplemented: false;
  ETABSExecutionCertified: false;
  detail: string;
};

export function getEtabsHostReservation(): EtabsHostReservation {
  if (ETABSAdapterImplemented || ETABSExecutionCertified) {
    throw new Error("etabs_must_remain_unimplemented_in_phase_13d1");
  }
  return {
    providerId: "etabs",
    reserved: true,
    ETABSAdapterImplemented: false,
    ETABSExecutionCertified: false,
    detail:
      "ETABS reserved for future controlled-host integration; no adapter in Phase 13D.1.",
  };
}

export function createEtabsReservedHostProbe(): EngineeringProviderHostProbe {
  return {
    providerId: "etabs",
    async probe(): Promise<ProviderHostProbeResult> {
      const reservation = getEtabsHostReservation();
      return unavailableProviderProbeResult(
        "etabs",
        reservation.detail,
        [
          "Do not require ETABS installation for Phase 13D.1.",
          "ETABSAdapterImplemented=false",
          "ETABSExecutionCertified=false",
        ],
      );
    },
  };
}
