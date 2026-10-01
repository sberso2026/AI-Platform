import type { EngineeringInformationRef } from "../../information-intelligence/types";
import type { SourceWorkflowSignal } from "../../work-context/types";
import { externalObjectIdentity, objectFingerprint } from "./identity";
import { isGovernedExternalWebUrl } from "./security";
import {
  EDMS_STATUS_MAPPING,
  type ConnectorVendor,
  type EngineeringExternalConnection,
  type EngineeringExternalObjectRef,
  type EngineeringExternalProjectBinding,
  type NormalizedExternalObjectType,
  type VendorExternalObject,
} from "./types";

export function mapVendorStatus(vendorStatus: string | null | undefined) {
  const row = EDMS_STATUS_MAPPING.find((item) => item.vendorStatus === vendorStatus);
  return {
    eosMappedStatus: row?.eosDocumentStatus ?? row?.eosQueryState ?? null,
    issued: Boolean(row?.issued),
    authority: row?.authority ?? "UNVERIFIED",
  };
}

export function vendorObjectToRef(input: {
  tenantId: string;
  workspaceId: string;
  connection: EngineeringExternalConnection;
  binding: EngineeringExternalProjectBinding;
  object: VendorExternalObject;
  previous?: EngineeringExternalObjectRef | null;
  availability?: EngineeringExternalObjectRef["availability"];
}): EngineeringExternalObjectRef {
  const mapped = mapVendorStatus(input.object.vendorStatus);
  const occurredAt = input.object.occurredAt;
  return {
    id: input.previous?.id ?? crypto.randomUUID(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.binding.eosProjectId,
    connectionId: input.connection.id,
    bindingId: input.binding.id,
    repositoryId: input.binding.repositoryId,
    sourceSystem: input.connection.vendor.toLowerCase(),
    externalAccountId: input.object.externalAccountId,
    externalProjectId: input.object.externalProjectId,
    objectType: input.object.objectType,
    objectId: input.object.objectId,
    objectNumber: input.object.objectNumber ?? null,
    displayName: input.object.displayName,
    webUrl: isGovernedExternalWebUrl(input.object.webUrl ?? null) ? input.object.webUrl ?? null : null,
    version: input.object.version ?? null,
    etag: input.object.etag ?? null,
    vendorStatus: input.object.vendorStatus ?? null,
    eosMappedStatus: mapped.eosMappedStatus,
    fingerprint: objectFingerprint(input.object),
    availability: input.availability ?? "ACTIVE",
    informationRefId: input.previous?.informationRefId ?? null,
    relatedCanonicalType: canonicalTypeFor(input.object.objectType),
    relatedCanonicalId: input.previous?.relatedCanonicalId ?? null,
    occurredAt,
    recordedAt: new Date().toISOString(),
    metadata: {
      summary: input.object.summary ?? null,
      systemId: input.object.systemId ?? null,
      percentComplete: input.object.percentComplete ?? null,
      neededBy: input.object.neededBy ?? null,
      relatedDocumentIds: input.object.relatedDocumentIds ?? [],
      issuedByVendor: mapped.issued,
      transmittalIsNotApproval: input.object.objectType === "TRANSMITTAL",
      presenceIsNotAuthority: true,
    },
  };
}

export function refToInformationRef(ref: EngineeringExternalObjectRef): EngineeringInformationRef {
  return {
    id: ref.informationRefId ?? crypto.randomUUID(),
    tenantId: ref.tenantId,
    workspaceId: ref.workspaceId,
    projectId: ref.projectId,
    sourceObjectType: "external_reference",
    sourceObjectId: externalObjectIdentity({
      vendor: ref.sourceSystem,
      externalAccountId: ref.externalAccountId,
      externalProjectId: ref.externalProjectId,
      objectType: ref.objectType,
      objectId: ref.objectId,
    }),
    informationType: informationTypeFor(ref.objectType),
    sourceKind: "EXTERNAL_REFERENCE",
    purpose: "FOR_COORDINATION",
    eligibility: "UNVERIFIED",
    sourceFacts: {
      revision: ref.version,
      revisionAuthority: "NONE",
      superseded: ref.availability !== "ACTIVE",
      stale: ref.availability !== "ACTIVE",
      sourceSystem: ref.sourceSystem,
      inputFingerprint: ref.fingerprint,
    },
    createdAt: ref.recordedAt,
    updatedAt: ref.recordedAt,
  };
}

export function refToWorkSignal(
  ref: EngineeringExternalObjectRef,
  eventType: string,
): SourceWorkflowSignal {
  return {
    sourceSystem: ref.sourceSystem,
    sourceEventType: eventType,
    sourceEventId: `${ref.objectType}:${ref.objectId}:${ref.fingerprint}:${eventType}`,
    sourceObjectType: ref.relatedCanonicalType ?? "external_reference",
    sourceObjectId: externalObjectIdentity({
      vendor: ref.sourceSystem,
      externalAccountId: ref.externalAccountId,
      externalProjectId: ref.externalProjectId,
      objectType: ref.objectType,
      objectId: ref.objectId,
    }),
    projectId: ref.projectId,
    occurredAt: ref.occurredAt,
    path: `/${ref.objectType}/${ref.objectNumber ?? ref.objectId}`,
    managedRepositoryId: ref.repositoryId,
    informationRefId: ref.informationRefId,
    systemId: typeof ref.metadata.systemId === "string" ? ref.metadata.systemId : null,
  };
}

export function classifyExternalChange(
  previous: EngineeringExternalObjectRef | null,
  next: EngineeringExternalObjectRef,
): string | null {
  if (next.availability !== "ACTIVE") return previous ? "FILE_DELETED" : null;
  if (!previous) return eventTypeFor(next.objectType, true, next);
  if (previous.fingerprint === next.fingerprint) return null;
  return eventTypeFor(next.objectType, false, next);
}

export function scheduleDoesNotCompleteDeliverable(percentComplete: number | null | undefined, deliverableReviewIncomplete: boolean) {
  return {
    schedulePercentComplete: percentComplete ?? null,
    deliverableReviewIncomplete,
    deliverableMaturityUnchanged: true,
    engineeringStateIndependent: true,
  };
}

export function engineerFacingLabel(ref: EngineeringExternalObjectRef, vendor: ConnectorVendor) {
  const number = ref.objectNumber ?? ref.objectId;
  return {
    title: `${number} ${ref.displayName}`.trim(),
    externalSystem: vendorDisplay(vendor),
    restPathHidden: true,
  };
}

function vendorDisplay(vendor: ConnectorVendor) {
  if (vendor === "ACONEX") return "Aconex";
  if (vendor === "ACC") return "Autodesk Construction Cloud";
  if (vendor === "P6") return "Primavera P6";
  if (vendor === "SHAREPOINT") return "SharePoint";
  return vendor;
}

function canonicalTypeFor(objectType: NormalizedExternalObjectType) {
  if (objectType === "RFI" || objectType === "TQ" || objectType === "FIELD_CHANGE" || objectType === "ISSUE") return "technical_query";
  if (objectType === "DRAWING" || objectType === "DOCUMENT" || objectType === "MODEL") return "document";
  if (objectType === "TRANSMITTAL") return "external_reference";
  if (objectType === "SCHEDULE_ACTIVITY" || objectType === "MILESTONE") return "schedule_activity";
  if (objectType === "ANALYSIS_FILE") return "analysis_result";
  return "external_reference";
}

function informationTypeFor(objectType: NormalizedExternalObjectType): EngineeringInformationRef["informationType"] {
  if (objectType === "DRAWING") return "DRAWING";
  if (objectType === "MODEL") return "MODEL";
  if (objectType === "ANALYSIS_FILE") return "ANALYSIS_OUTPUT";
  if (objectType === "VENDOR_DATA") return "DATASHEET";
  return "REFERENCE_INFORMATION";
}

function eventTypeFor(objectType: NormalizedExternalObjectType, created: boolean, ref: EngineeringExternalObjectRef) {
  if (objectType === "RFI" || objectType === "TQ") return created ? "RFI_CREATED" : "RFI_RESPONDED";
  if (objectType === "FIELD_CHANGE" || objectType === "ISSUE") return created ? "RFI_CREATED" : "SOURCE_REVISED";
  if (objectType === "TRANSMITTAL") return "CORRESPONDENCE_ISSUED";
  if (objectType === "DRAWING") return ref.metadata.issuedByVendor ? "CAD_DRAWING_ISSUED" : "CAD_DRAWING_REVISED";
  if (objectType === "DOCUMENT" || objectType === "MODEL") return created ? "FILE_CREATED" : "FILE_REVISED";
  if (objectType === "ANALYSIS_FILE") return "ANALYSIS_RESULT_IMPORTED";
  return null;
}
