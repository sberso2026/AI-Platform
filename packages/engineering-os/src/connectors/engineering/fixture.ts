import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "../../lifecycle-intelligence/fixture";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../../digital-thread/fixture";
import type { EngineeringExternalConnection, VendorExternalObject } from "./types";

export const A13B_PROJECT_A = CRUSHER_EXPANSION_FEED_PROJECT_ID;
export const A13B_PROJECT_B = "project-b-isolation";
export const A13B_UNREGISTERED_PROJECT = "ext-unregistered-omega";
export const A13B_ACCOUNT = "acct-epcm-01";

export function a13bConnection(overrides: Partial<EngineeringExternalConnection> = {}): EngineeringExternalConnection {
  const stamp = "2026-10-01T00:00:00.000Z";
  return {
    id: "conn-edms-a13b",
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    displayName: "Project EDMS",
    category: "EDMS",
    vendor: "ACONEX",
    credentialSecretId: "secret:edms-oauth",
    authMode: "OAUTH",
    writePolicy: "READ_ONLY",
    status: "CONFIGURED",
    enabled: true,
    createdBy: "eng-admin",
    createdAt: stamp,
    updatedAt: stamp,
    ...overrides,
  };
}

export function rfi142(): VendorExternalObject {
  return {
    objectType: "RFI",
    objectId: "ext-rfi-142",
    objectNumber: "RFI-142",
    displayName: "Anchor bolt clash",
    externalAccountId: A13B_ACCOUNT,
    externalProjectId: "ext-project-a",
    version: "A",
    etag: "etag-rfi-a",
    vendorStatus: "Open",
    webUrl: "https://example.aconex.com/projects/alpha/rfi/142",
    occurredAt: "2026-10-01T02:00:00.000Z",
    relatedDocumentIds: ["ext-dwg-s104"],
    systemId: "sys-crusher",
    summary: "Anchor bolts clash with reinforcement.",
  };
}

export function drawingRevC(): VendorExternalObject {
  return {
    objectType: "DRAWING",
    objectId: "ext-dwg-s104",
    objectNumber: "S-104",
    displayName: "Foundation drawing Rev C",
    externalAccountId: A13B_ACCOUNT,
    externalProjectId: "ext-project-a",
    version: "C",
    etag: "etag-dwg-c",
    vendorStatus: "For Information",
    webUrl: "https://example.aconex.com/projects/alpha/docs/s-104",
    occurredAt: "2026-09-20T00:00:00.000Z",
  };
}

export function drawingRevD(): VendorExternalObject {
  return {
    ...drawingRevC(),
    displayName: "Foundation drawing Rev D",
    version: "D",
    etag: "etag-dwg-d",
    vendorStatus: "Rev D",
    occurredAt: "2026-10-01T03:00:00.000Z",
  };
}

export function transmittalT12(): VendorExternalObject {
  return {
    objectType: "TRANSMITTAL",
    objectId: "ext-trn-12",
    objectNumber: "TRN-12",
    displayName: "Foundation issue transmittal",
    externalAccountId: A13B_ACCOUNT,
    externalProjectId: "ext-project-a",
    version: "1",
    etag: "etag-trn-1",
    vendorStatus: "Issued for Construction",
    webUrl: "https://example.aconex.com/projects/alpha/trn/12",
    occurredAt: "2026-09-28T00:00:00.000Z",
    relatedDocumentIds: ["ext-dwg-s104"],
  };
}

export function fieldChangeAnchor(): VendorExternalObject {
  return {
    objectType: "FIELD_CHANGE",
    objectId: "ext-fc-75",
    objectNumber: "FC-75",
    displayName: "Move anchor bolts 75 mm",
    externalAccountId: A13B_ACCOUNT,
    externalProjectId: "ext-project-a",
    version: "A",
    etag: "etag-fc-a",
    vendorStatus: "Open",
    webUrl: "https://example.aconex.com/projects/alpha/fc/75",
    occurredAt: "2026-10-01T04:00:00.000Z",
    relatedDocumentIds: ["ext-dwg-s104"],
    systemId: "sys-crusher",
    summary: "Proposed field change: move anchor bolts 75 mm.",
  };
}

export function bimModel(): VendorExternalObject {
  return {
    objectType: "MODEL",
    objectId: "ext-model-found",
    objectNumber: "MDL-FOUND",
    displayName: "Foundation federated model",
    externalAccountId: A13B_ACCOUNT,
    externalProjectId: "ext-project-a",
    version: "12",
    etag: "etag-mdl-12",
    vendorStatus: "For Information",
    webUrl: "https://docs.autodesk.com/projects/alpha/items/mdl-found",
    occurredAt: "2026-09-25T00:00:00.000Z",
    systemId: "sys-crusher",
  };
}

export function bimClash(): VendorExternalObject {
  return {
    objectType: "ISSUE",
    objectId: "ext-clash-pipe-beam",
    objectNumber: "CLASH-88",
    displayName: "Pipe conflicts with structural beam",
    externalAccountId: A13B_ACCOUNT,
    externalProjectId: "ext-project-a",
    version: "1",
    etag: "etag-clash-1",
    vendorStatus: "Open",
    webUrl: "https://docs.autodesk.com/projects/alpha/issues/88",
    occurredAt: "2026-10-01T05:00:00.000Z",
    systemId: "sys-crusher",
    summary: "Pipe conflicts with structural beam.",
  };
}

export function scheduleMilestone(): VendorExternalObject {
  return {
    objectType: "MILESTONE",
    objectId: "ext-ms-deliv",
    objectNumber: "MS-DEL-01",
    displayName: "Engineering Deliverable target",
    externalAccountId: A13B_ACCOUNT,
    externalProjectId: "ext-project-a",
    version: "3",
    etag: "etag-ms-3",
    vendorStatus: "In Progress",
    occurredAt: "2026-09-30T00:00:00.000Z",
    neededBy: "2026-10-15T00:00:00.000Z",
    percentComplete: 40,
  };
}

export function scheduleComplete(): VendorExternalObject {
  return {
    objectType: "SCHEDULE_ACTIVITY",
    objectId: "ext-act-100",
    objectNumber: "A-100",
    displayName: "Foundation engineering complete",
    externalAccountId: A13B_ACCOUNT,
    externalProjectId: "ext-project-a",
    version: "9",
    etag: "etag-act-9",
    vendorStatus: "Complete",
    occurredAt: "2026-10-01T06:00:00.000Z",
    percentComplete: 100,
  };
}

export function projectBRfi(): VendorExternalObject {
  return {
    objectType: "RFI",
    objectId: "ext-rfi-b9",
    objectNumber: "RFI-B9",
    displayName: "Project B only query",
    externalAccountId: A13B_ACCOUNT,
    externalProjectId: "ext-project-b",
    version: "A",
    etag: "etag-b9",
    vendorStatus: "Open",
    webUrl: "https://example.aconex.com/projects/beta/rfi/b9",
    occurredAt: "2026-10-01T07:00:00.000Z",
  };
}

export function unregisteredProjectDoc(): VendorExternalObject {
  return {
    objectType: "DOCUMENT",
    objectId: "ext-unreg-1",
    objectNumber: "UNREG-1",
    displayName: "Unregistered project document",
    externalAccountId: A13B_ACCOUNT,
    externalProjectId: A13B_UNREGISTERED_PROJECT,
    version: "A",
    etag: "etag-unreg",
    vendorStatus: "Open",
    occurredAt: "2026-10-01T08:00:00.000Z",
  };
}

export { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE };
