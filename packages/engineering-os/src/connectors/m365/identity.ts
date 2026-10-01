import type { ExternalSourceRef, GraphDriveItem } from "./types";

export function microsoftSourceIdentity(item: Pick<GraphDriveItem, "siteId" | "driveId" | "id">): string {
  return `sp:${item.siteId}:${item.driveId}:${item.id}`;
}

export function sourceFingerprint(item: Pick<GraphDriveItem, "id" | "etag" | "ctag" | "lastModifiedAt">): string {
  return `${item.id}:${item.etag ?? item.ctag ?? item.lastModifiedAt ?? "unknown"}`;
}

export function isOlderThanKnown(incomingOccurredAt: string, knownOccurredAt: string): boolean {
  return Date.parse(incomingOccurredAt) < Date.parse(knownOccurredAt);
}

export function renamePreservesIdentity(previous: ExternalSourceRef, next: GraphDriveItem): boolean {
  return previous.itemId === next.id && previous.driveId === next.driveId && previous.siteId === next.siteId;
}

export function sameMicrosoftIdentity(a: Pick<ExternalSourceRef, "siteId" | "driveId" | "itemId">, b: Pick<GraphDriveItem, "siteId" | "driveId" | "id">): boolean {
  return a.siteId === b.siteId && a.driveId === b.driveId && a.itemId === b.id;
}
