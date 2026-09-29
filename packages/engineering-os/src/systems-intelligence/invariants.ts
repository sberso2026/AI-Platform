/**
 * EOS-A3 Systems & Interface Intelligence invariants (application layer).
 * Database triggers remain the last line of defence.
 */

export const SYSTEM_STATUSES = ["draft", "active", "inactive", "superseded", "archived"] as const;
export type SystemStatus = (typeof SYSTEM_STATUSES)[number];

export const INTERFACE_STATUSES = [
  "identified",
  "defined",
  "agreed",
  "verified",
  "closed",
  "superseded",
] as const;
export type InterfaceStatus = (typeof INTERFACE_STATUSES)[number];

export const INTERFACE_TYPES = [
  "PHYSICAL",
  "FUNCTIONAL",
  "PROCESS",
  "MECHANICAL",
  "PIPING",
  "STRUCTURAL",
  "ELECTRICAL",
  "CONTROL",
  "DATA",
  "INFORMATION",
  "RESPONSIBILITY",
  "CONTRACT",
  "SCHEDULE",
] as const;
export type InterfaceType = (typeof INTERFACE_TYPES)[number];

export const INTERFACE_DIRECTIONALITY = ["undirected", "directed", "bidirectional"] as const;
export type InterfaceDirectionality = (typeof INTERFACE_DIRECTIONALITY)[number];

export const INTERFACE_ENDPOINT_ROLES = ["participant", "source", "target", "side_a", "side_b"] as const;
export type InterfaceEndpointRole = (typeof INTERFACE_ENDPOINT_ROLES)[number];

export const SYSTEM_ASSET_RELATIONS = ["CONTAINS", "USES"] as const;
export type SystemAssetRelation = (typeof SYSTEM_ASSET_RELATIONS)[number];

/** CONTAINS = asset is part of system architecture/scope. USES = shared/external dependency. */
export function assertSystemAssetRelation(value: string): asserts value is SystemAssetRelation {
  if (!(SYSTEM_ASSET_RELATIONS as readonly string[]).includes(value)) {
    throw new Error("System-asset relation must be CONTAINS (membership) or USES (shared dependency)");
  }
}

export function assertSystemStatus(value: string): asserts value is SystemStatus {
  if (!(SYSTEM_STATUSES as readonly string[]).includes(value)) {
    throw new Error(`Unknown system status: ${value}`);
  }
}

export function assertInterfaceType(value: string): asserts value is InterfaceType {
  if (!(INTERFACE_TYPES as readonly string[]).includes(value)) {
    throw new Error(`Unknown interface type: ${value}`);
  }
}

export function assertInterfaceStatus(value: string): asserts value is InterfaceStatus {
  if (!(INTERFACE_STATUSES as readonly string[]).includes(value)) {
    throw new Error(`Unknown interface status: ${value}`);
  }
}

export function assertInterfaceDirectionality(value: string): asserts value is InterfaceDirectionality {
  if (!(INTERFACE_DIRECTIONALITY as readonly string[]).includes(value)) {
    throw new Error(`Unknown interface directionality: ${value}`);
  }
}

export function assertEndpointRole(value: string): asserts value is InterfaceEndpointRole {
  if (!(INTERFACE_ENDPOINT_ROLES as readonly string[]).includes(value)) {
    throw new Error(`Unknown interface endpoint role: ${value}`);
  }
}

export function assertVerifiedEndpointCount(status: string, endpointCount: number) {
  if ((status === "verified" || status === "agreed") && endpointCount < 2) {
    throw new Error("Interface must have at least two endpoints before agreed/verified");
  }
}

export function assertNoSelfParent(systemId: string, parentSystemId?: string | null) {
  if (parentSystemId && parentSystemId === systemId) {
    throw new Error("system cannot parent itself");
  }
}

export const LEGACY_ASSET_SYSTEM_FIELD = "system";
export const LEGACY_ASSET_SUBSYSTEM_FIELD = "subsystem";
