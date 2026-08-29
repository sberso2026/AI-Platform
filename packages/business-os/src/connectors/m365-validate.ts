import { Ms365ConnectorError } from "./m365-errors";

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function boolOrUnknown(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function datetime(value: unknown): string | null {
  if (typeof value === "string") return str(value);
  if (value && typeof value === "object" && "dateTime" in value) {
    return str((value as { dateTime?: unknown }).dateTime);
  }
  return null;
}

export type MinimisedMs365Record = {
  externalSourceId: string;
  dataClass: string;
  sourceUpdatedAt: string | null;
  payload: Record<string, unknown>;
};

function requireId(value: unknown): string {
  const id = str(value);
  if (!id) throw new Ms365ConnectorError("m365_schema_invalid");
  return id;
}

export function minimiseUser(input: unknown): MinimisedMs365Record {
  if (!input || typeof input !== "object") throw new Ms365ConnectorError("m365_schema_invalid");
  const raw = input as Record<string, unknown>;
  const id = requireId(raw.id);
  return {
    externalSourceId: id,
    dataClass: "user_profile_read",
    sourceUpdatedAt: null,
    payload: {
      id,
      userPrincipalName: str(raw.userPrincipalName),
      displayName: str(raw.displayName),
      canonical: false,
    },
  };
}

export function minimiseEvent(input: unknown): MinimisedMs365Record {
  if (!input || typeof input !== "object") throw new Ms365ConnectorError("m365_schema_invalid");
  const raw = input as Record<string, unknown>;
  const id = requireId(raw.id);
  return {
    externalSourceId: id,
    dataClass: "calendar_event_read",
    sourceUpdatedAt: str(raw.lastModifiedDateTime),
    payload: {
      id,
      subject: str(raw.subject),
      start: datetime(raw.start),
      end: datetime(raw.end),
      isCancelled: boolOrUnknown(raw.isCancelled),
      canonical: false,
    },
  };
}

export function minimiseDriveItem(input: unknown): MinimisedMs365Record {
  if (!input || typeof input !== "object") throw new Ms365ConnectorError("m365_schema_invalid");
  const raw = input as Record<string, unknown>;
  const id = requireId(raw.id);
  const isFile = raw.file && typeof raw.file === "object";
  const isFolder = raw.folder && typeof raw.folder === "object";
  return {
    externalSourceId: id,
    dataClass: "drive_item_metadata_read",
    sourceUpdatedAt: str(raw.lastModifiedDateTime),
    payload: {
      id,
      name: str(raw.name),
      kind: isFolder ? "folder" : isFile ? "file" : null,
      canonical: false,
    },
  };
}

export function mapValidMs365Records(
  items: unknown,
  mapper: (item: unknown) => MinimisedMs365Record,
): { records: MinimisedMs365Record[]; rejected: number } {
  if (!Array.isArray(items)) throw new Ms365ConnectorError("m365_schema_invalid");
  const records: MinimisedMs365Record[] = [];
  let rejected = 0;
  for (const item of items) {
    try {
      records.push(mapper(item));
    } catch {
      rejected += 1;
    }
  }
  return { records, rejected };
}

export function validateMs365NextLink(nextLink: unknown, allowedPath: string): string | null {
  if (nextLink == null) return null;
  if (typeof nextLink !== "string" || !nextLink.trim()) throw new Ms365ConnectorError("m365_pagination_failed");
  let url: URL;
  try {
    url = new URL(nextLink);
  } catch {
    throw new Ms365ConnectorError("m365_pagination_failed");
  }
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "graph.microsoft.com") {
    throw new Ms365ConnectorError("m365_pagination_failed");
  }
  if (url.pathname !== allowedPath) throw new Ms365ConnectorError("m365_pagination_failed");
  return url.toString();
}
