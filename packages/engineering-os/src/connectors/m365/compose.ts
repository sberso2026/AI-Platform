import type { EngineeringInformationRef } from "../../information-intelligence/types";
import type { SourceWorkflowSignal } from "../../work-context/types";
import { microsoftSourceIdentity, sourceFingerprint } from "./identity";
import { isGovernedSharePointWebUrl } from "./security";
import type { ExternalSourceRef, GraphDriveItem, M365Connection, SharePointScope } from "./types";

export function graphItemToSource(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  repositoryId: string;
  connection: M365Connection;
  scope: SharePointScope;
  item: GraphDriveItem;
  previous?: ExternalSourceRef | null;
  availability: ExternalSourceRef["availability"];
}): ExternalSourceRef {
  const occurredAt = input.item.lastModifiedAt ?? new Date().toISOString();
  const recordedAt = new Date().toISOString();
  const webUrl = isGovernedSharePointWebUrl(input.item.webUrl ?? null) ? input.item.webUrl ?? null : null;
  return {
    id: input.previous?.id ?? crypto.randomUUID(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    repositoryId: input.repositoryId,
    connectionId: input.connection.id,
    sourceSystem: "sharepoint",
    microsoftTenantId: input.connection.microsoftTenantId,
    siteId: input.item.siteId,
    driveId: input.item.driveId,
    itemId: input.item.id,
    listItemId: null,
    parentItemId: input.item.parentId,
    displayName: input.item.name,
    webUrl,
    pathWithinRoot: input.item.pathWithinRoot ?? `/${input.item.name}`,
    mimeType: input.item.mimeType ?? null,
    sizeBytes: input.item.size ?? null,
    etag: input.item.etag ?? null,
    ctag: input.item.ctag ?? null,
    versionLabel: input.item.etag ?? null,
    lastModifiedAt: input.item.lastModifiedAt ?? null,
    lastModifiedBy: input.item.lastModifiedBy ?? null,
    availability: input.availability,
    fingerprint: sourceFingerprint(input.item),
    informationRefId: input.previous?.informationRefId ?? null,
    occurredAt,
    recordedAt,
  };
}

export function sourceToWorkSignal(source: ExternalSourceRef, eventType: "FILE_CREATED" | "FILE_REVISED" | "FILE_PUBLISHED" | "FILE_MOVED" | "FILE_DELETED"): SourceWorkflowSignal {
  return {
    sourceSystem: "sharepoint",
    sourceEventType: eventType,
    sourceEventId: `${source.itemId}:${source.fingerprint}:${eventType}`,
    sourceObjectType: "external_reference",
    sourceObjectId: microsoftSourceIdentity({ siteId: source.siteId, driveId: source.driveId, id: source.itemId }),
    projectId: source.projectId,
    occurredAt: source.occurredAt,
    actorId: source.lastModifiedBy,
    path: source.pathWithinRoot,
    managedRepositoryId: source.repositoryId,
    informationRefId: source.informationRefId,
  };
}

export function sourceToInformationRef(source: ExternalSourceRef): EngineeringInformationRef {
  return {
    id: source.informationRefId ?? crypto.randomUUID(),
    tenantId: source.tenantId,
    workspaceId: source.workspaceId,
    projectId: source.projectId,
    sourceObjectType: "external_reference",
    sourceObjectId: microsoftSourceIdentity({ siteId: source.siteId, driveId: source.driveId, id: source.itemId }),
    informationType: inferInformationType(source.displayName, source.mimeType),
    sourceKind: "EXTERNAL_REFERENCE",
    purpose: "FOR_COORDINATION",
    eligibility: "UNVERIFIED",
    sourceFacts: {
      revision: source.versionLabel,
      revisionAuthority: "NONE",
      superseded: source.availability !== "ACTIVE",
      stale: source.availability !== "ACTIVE",
      sourceSystem: "sharepoint",
      inputFingerprint: source.fingerprint,
    },
    createdAt: source.recordedAt,
    updatedAt: source.recordedAt,
  };
}

function inferInformationType(name: string, mime: string | null): EngineeringInformationRef["informationType"] {
  const lower = name.toLowerCase();
  if (lower.includes("load")) return "LOAD_DATA";
  if (lower.includes("calc")) return "CALCULATION";
  if (lower.includes("spec")) return "SPECIFICATION";
  if (lower.includes("draw") || lower.endsWith(".dwg") || lower.endsWith(".dgn")) return "DRAWING";
  if (lower.endsWith(".rvt") || lower.endsWith(".ifc")) return "MODEL";
  if (mime?.includes("spreadsheet")) return "DATASHEET";
  return "REFERENCE_INFORMATION";
}

export function classifyGraphChange(previous: ExternalSourceRef | null, next: ExternalSourceRef): "FILE_CREATED" | "FILE_REVISED" | "FILE_MOVED" | "FILE_DELETED" | null {
  if (next.availability === "DELETED" || next.availability === "MOVED_OUTSIDE_SCOPE") return previous ? "FILE_DELETED" : null;
  if (!previous) return "FILE_CREATED";
  if (previous.fingerprint === next.fingerprint && previous.displayName === next.displayName && previous.pathWithinRoot === next.pathWithinRoot) {
    return null;
  }
  if (previous.displayName !== next.displayName || previous.pathWithinRoot !== next.pathWithinRoot) {
    return previous.itemId === next.itemId ? "FILE_MOVED" : "FILE_CREATED";
  }
  return "FILE_REVISED";
}

export function toSearchHit(source: ExternalSourceRef) {
  return {
    objectType: "engineering_external_source",
    id: source.id,
    title: source.displayName,
    projectId: source.projectId,
    workspaceId: source.workspaceId,
    tenantId: source.tenantId,
    href: `/engineering/information`,
    provider: "SharePoint",
    availability: source.availability,
    indexedBody: false,
  };
}
