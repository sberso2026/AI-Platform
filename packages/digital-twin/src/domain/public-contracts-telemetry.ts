/**
 * Phase 12E — Digital Twin telemetry binding public contracts (0.5.0-telemetry-binding-draft).
 */

import { PUBLIC_CONTRACT_VERSION } from "../version";

export const TELEMETRY_CONTRACT_FAMILIES = [
  "TelemetrySourceReferenceCore",
  "TelemetryChannelReferenceCore",
  "TwinTelemetryBindingCore",
  "EngineeringTimeSeriesReadCore",
  "TelemetryProjectionCore",
  "LiveStateSemanticsCore",
] as const;

export type TelemetryContractFamily = (typeof TELEMETRY_CONTRACT_FAMILIES)[number];

export function assertTelemetryContracts(): {
  ok: true;
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
} {
  if (PUBLIC_CONTRACT_VERSION !== "0.5.0-telemetry-binding-draft") {
    throw new Error("telemetry_contracts_require_0_5_0_telemetry_binding_draft");
  }
  return { ok: true, contractVersion: PUBLIC_CONTRACT_VERSION };
}

export function assertTelemetryForbiddenCapabilities(): {
  ok: true;
  storesRawTelemetry: false;
  duplicateTimeSeriesPlaneDetected: false;
  telemetryHistorianImplemented: false;
  highFrequencyTelemetryImplemented: false;
  sensorRegistryImplemented: false;
  shmSignalProcessingImplemented: false;
  automaticTelemetryStatePublicationEnabled: false;
} {
  return {
    ok: true,
    storesRawTelemetry: false,
    duplicateTimeSeriesPlaneDetected: false,
    telemetryHistorianImplemented: false,
    highFrequencyTelemetryImplemented: false,
    sensorRegistryImplemented: false,
    shmSignalProcessingImplemented: false,
    automaticTelemetryStatePublicationEnabled: false,
  };
}
