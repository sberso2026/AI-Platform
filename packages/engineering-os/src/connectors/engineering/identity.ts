import type { EngineeringExternalObjectRef, VendorExternalObject } from "./types";
export { isOlderThanKnown } from "../core/identity";

export function externalObjectIdentity(input: {
  vendor: string;
  externalAccountId: string;
  externalProjectId: string;
  objectType: string;
  objectId: string;
}): string {
  return `${input.vendor}:${input.externalAccountId}:${input.externalProjectId}:${input.objectType}:${input.objectId}`;
}

export function objectFingerprint(object: Pick<VendorExternalObject, "objectId" | "etag" | "version" | "occurredAt" | "vendorStatus">): string {
  return `${object.objectId}:${object.etag ?? object.version ?? object.occurredAt}:${object.vendorStatus ?? ""}`;
}

export function sameExternalIdentity(previous: EngineeringExternalObjectRef, next: VendorExternalObject, vendor: string): boolean {
  return (
    previous.objectId === next.objectId &&
    previous.objectType === next.objectType &&
    previous.externalProjectId === next.externalProjectId &&
    previous.sourceSystem === vendor.toLowerCase()
  );
}
