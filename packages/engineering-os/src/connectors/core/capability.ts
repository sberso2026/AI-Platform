import { CANONICAL_CONNECTOR_CERTIFICATION_MATRIX, DEFAULT_CONNECTOR_WRITE_POLICY, type ConnectorCapability } from "./types";

export function connectorCapabilityState(vendor: string, capability: ConnectorCapability): string {
  const row = CANONICAL_CONNECTOR_CERTIFICATION_MATRIX.find((item) => item.vendor === vendor);
  if (!row) return "NOT_AVAILABLE";
  return row.capabilities[capability];
}

export function assertConnectorCapability(input: {
  vendor: string;
  capability: ConnectorCapability;
  writePolicy?: string;
}): void {
  const state = connectorCapabilityState(input.vendor, input.capability);
  if (state === "NOT_AVAILABLE" || state === "CONTRACT_ONLY") {
    throw new Error("CAPABILITY_NOT_CERTIFIED");
  }
  const writeCapabilities: ConnectorCapability[] = ["PUBLISH_DOCUMENT", "UPDATE_RFI_RESPONSE"];
  if (writeCapabilities.includes(input.capability)) {
    const policy = input.writePolicy ?? DEFAULT_CONNECTOR_WRITE_POLICY;
    if (policy === "READ_ONLY") throw new Error("ARBITRARY_EXTERNAL_WRITE_PROHIBITED");
  }
}

export function certificationIsNotHealth(input: { certification: string; operational: string }) {
  return {
    certified: input.certification,
    operational: input.operational,
    conflated: false,
    liveCertifiedButAuthRequired: input.certification.startsWith("LIVE_") && input.operational === "AUTHENTICATION_REQUIRED",
    readyButFixtureOnly: input.operational === "READY" && input.certification === "FIXTURE_CERTIFIED",
  };
}
