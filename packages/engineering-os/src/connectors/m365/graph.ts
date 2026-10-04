import {
  DEFAULT_PAGE_SIZE,
  type ConnectorSecretsPort,
  type GraphDriveItem,
  type GraphPage,
  type M365Connection,
} from "./types";
import { assertApprovedGraphPath, isAllowedGraphUrl, isPersonalOneDriveItem, validateRedirectLocation } from "./security";

export type GraphPortError = {
  kind: "AUTH" | "THROTTLE" | "NETWORK" | "RESYNC" | "NOT_FOUND" | "FORBIDDEN";
  message: string;
  retryAfterMs?: number;
};

export class GraphPortFailure extends Error {
  constructor(public readonly failure: GraphPortError) {
    super(failure.message);
    this.name = "GraphPortFailure";
  }
}

export type GraphSiteIdentity = {
  siteId: string;
  hostname: string;
  path: string;
  displayName: string;
  webUrl: string;
};

export type GraphLibraryIdentity = {
  driveId: string;
  name: string;
  driveType: string;
  webUrl?: string | null;
};

export type GraphPort = {
  testConnection(connection: M365Connection): Promise<{ ok: boolean; status: string; message: string }>;
  resolveSite(input: { connection: M365Connection; hostname: string; path: string }): Promise<GraphSiteIdentity>;
  listLibraries(input: { connection: M365Connection; siteId: string }): Promise<GraphLibraryIdentity[]>;
  listChildren(input: {
    connection: M365Connection;
    siteId: string;
    driveId: string;
    rootItemId?: string | null;
    skipToken?: string | null;
    pageSize?: number;
  }): Promise<GraphPage<GraphDriveItem>>;
  delta(input: {
    connection: M365Connection;
    siteId: string;
    driveId: string;
    rootItemId?: string | null;
    deltaToken?: string | null;
  }): Promise<GraphPage<GraphDriveItem>>;
  getItem(input: { connection: M365Connection; driveId: string; itemId: string }): Promise<GraphDriveItem | null>;
  download(input: { connection: M365Connection; driveId: string; itemId: string }): Promise<Buffer>;
  upload(input: {
    connection: M365Connection;
    driveId: string;
    parentId: string;
    fileName: string;
    content: Buffer;
    contentType: string;
  }): Promise<GraphDriveItem>;
};

export class MockGraphPort implements GraphPort {
  items = new Map<string, GraphDriveItem>();
  contents = new Map<string, Buffer>();
  deltaToken = "delta-1";
  failAuth = false;
  failNetwork = false;
  throttleRemaining = 0;
  resyncRequired = false;
  pageSize = DEFAULT_PAGE_SIZE;
  listedPersonalDrive = false;
  listedMail = false;
  sites = new Map<string, GraphSiteIdentity>();
  libraries = new Map<string, GraphLibraryIdentity[]>();
  deniedSites = new Set<string>();
  missingSites = new Set<string>();
  consentDenied = false;

  seedSite(site: GraphSiteIdentity) {
    this.sites.set(`${site.hostname}${site.path}`.toLowerCase(), site);
  }

  seedLibrary(siteId: string, library: GraphLibraryIdentity) {
    const current = this.libraries.get(siteId) ?? [];
    current.push(library);
    this.libraries.set(siteId, current);
  }

  key(driveId: string, itemId: string) {
    return `${driveId}:${itemId}`;
  }

  seed(item: GraphDriveItem, content?: Buffer) {
    this.items.set(this.key(item.driveId, item.id), item);
    if (content) this.contents.set(this.key(item.driveId, item.id), content);
  }

  private guard() {
    if (this.failAuth) throw new GraphPortFailure({ kind: "AUTH", message: "invalid_client" });
    if (this.failNetwork) throw new GraphPortFailure({ kind: "NETWORK", message: "network_failure" });
    if (this.throttleRemaining > 0) {
      this.throttleRemaining -= 1;
      throw new GraphPortFailure({ kind: "THROTTLE", message: "too_many_requests", retryAfterMs: 200 });
    }
  }

  async testConnection(connection: M365Connection) {
    this.guard();
    if (this.consentDenied) throw new GraphPortFailure({ kind: "AUTH", message: "consent_required" });
    if (!connection.microsoftTenantId || !connection.applicationId || !connection.credentialSecretId) {
      return { ok: false, status: "NOT_CONFIGURED", message: "connection incomplete" };
    }
    return { ok: true, status: "READY", message: "mock graph reachable" };
  }

  async resolveSite(input: { connection: M365Connection; hostname: string; path: string }) {
    this.guard();
    const key = `${input.hostname}${input.path}`.toLowerCase();
    if (this.deniedSites.has(key)) throw new GraphPortFailure({ kind: "FORBIDDEN", message: "graph_forbidden" });
    if (this.missingSites.has(key)) throw new GraphPortFailure({ kind: "NOT_FOUND", message: "site_not_found" });
    const site = this.sites.get(key);
    if (!site) throw new GraphPortFailure({ kind: "NOT_FOUND", message: "site_not_found" });
    return site;
  }

  async listLibraries(input: { connection: M365Connection; siteId: string }) {
    this.guard();
    return (this.libraries.get(input.siteId) ?? []).filter((row) => row.driveType !== "personal");
  }

  async listChildren(input: {
    connection: M365Connection;
    siteId: string;
    driveId: string;
    rootItemId?: string | null;
    skipToken?: string | null;
    pageSize?: number;
  }) {
    this.guard();
    const all = [...this.items.values()].filter(
      (item) => item.driveId === input.driveId && !item.folder,
    );
    const size = input.pageSize ?? this.pageSize;
    const offset = input.skipToken ? Number(input.skipToken) || 0 : 0;
    const slice = all.slice(offset, offset + size);
    return {
      items: slice,
      nextLink: offset + size < all.length ? String(offset + size) : null,
    };
  }

  async delta(input: {
    connection: M365Connection;
    siteId: string;
    driveId: string;
    rootItemId?: string | null;
    deltaToken?: string | null;
  }) {
    this.guard();
    if (this.resyncRequired) {
      throw new GraphPortFailure({ kind: "RESYNC", message: "resyncRequired" });
    }
    const listed = await this.listChildren(input);
    return { ...listed, deltaLink: this.deltaToken };
  }

  async getItem(input: { connection: M365Connection; driveId: string; itemId: string }) {
    this.guard();
    return this.items.get(this.key(input.driveId, input.itemId)) ?? null;
  }

  async download(input: { connection: M365Connection; driveId: string; itemId: string }) {
    this.guard();
    const item = this.items.get(this.key(input.driveId, input.itemId));
    if (item && isPersonalOneDriveItem(item)) throw new Error("PERSONAL_ONEDRIVE_ACCESS_PROHIBITED");
    const content = this.contents.get(this.key(input.driveId, input.itemId));
    if (!content) throw new GraphPortFailure({ kind: "NOT_FOUND", message: "content_not_found" });
    return content;
  }

  async upload(input: {
    connection: M365Connection;
    driveId: string;
    parentId: string;
    fileName: string;
    content: Buffer;
    contentType: string;
  }) {
    this.guard();
    const existing = [...this.items.values()].find(
      (row) => row.driveId === input.driveId && row.parentId === input.parentId && row.name === input.fileName && !row.deleted,
    );
    const id = existing?.id ?? `item-${crypto.randomUUID()}`;
    const siteId = existing?.siteId ?? [...this.items.values()].find((row) => row.driveId === input.driveId)?.siteId ?? "site-unknown";
    const item: GraphDriveItem = {
      id,
      name: input.fileName,
      parentId: input.parentId,
      siteId,
      driveId: input.driveId,
      driveType: "documentLibrary",
      mimeType: input.contentType,
      size: input.content.byteLength,
      etag: `etag-${Date.now()}`,
      lastModifiedAt: new Date().toISOString(),
      pathWithinRoot: `/${input.fileName}`,
      webUrl: `https://contoso.sharepoint.com/sites/eng/${encodeURIComponent(input.fileName)}`,
    };
    this.seed(item, input.content);
    return item;
  }
}

export class LiveGraphPort implements GraphPort {
  constructor(private readonly secrets: ConnectorSecretsPort) {}

  private async token(connection: M365Connection): Promise<string> {
    const secret = await this.secrets.getSecretValue(connection.credentialSecretId);
    if (!secret) throw new GraphPortFailure({ kind: "AUTH", message: "secret_unavailable" });
    const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(connection.microsoftTenantId)}/oauth2/v2.0/token`;
    if (!isAllowedGraphUrl(tokenUrl)) throw new Error("SSRF_BLOCKED");
    const body = new URLSearchParams({
      client_id: connection.applicationId,
      client_secret: secret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    });
    const response = await fetchGraph(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (response.status === 401 || response.status === 403) {
      throw new GraphPortFailure({ kind: "AUTH", message: "token_rejected" });
    }
    if (response.status === 429) {
      throw new GraphPortFailure({ kind: "THROTTLE", message: "throttled", retryAfterMs: retryAfter(response) });
    }
    if (!response.ok) throw new GraphPortFailure({ kind: "NETWORK", message: `token_http_${response.status}` });
    const json = (await response.json()) as { access_token?: string };
    if (!json.access_token) throw new GraphPortFailure({ kind: "AUTH", message: "token_missing" });
    return json.access_token;
  }

  private async graph(connection: M365Connection, path: string, init?: RequestInit) {
    assertApprovedGraphPath(path);
    const url = `https://graph.microsoft.com/v1.0${path}`;
    if (!isAllowedGraphUrl(url)) throw new Error("SSRF_BLOCKED");
    const access = await this.token(connection);
    const response = await fetchGraph(url, {
      ...init,
      headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${access}` },
    });
    if (response.status === 401) throw new GraphPortFailure({ kind: "AUTH", message: "graph_unauthorized" });
    if (response.status === 403) throw new GraphPortFailure({ kind: "FORBIDDEN", message: "graph_forbidden" });
    if (response.status === 429) throw new GraphPortFailure({ kind: "THROTTLE", message: "throttled", retryAfterMs: retryAfter(response) });
    if (response.status === 410) throw new GraphPortFailure({ kind: "RESYNC", message: "resyncRequired" });
    return response;
  }

  async testConnection(connection: M365Connection) {
    try {
      await this.token(connection);
      return { ok: true, status: "READY", message: "application credential accepted" };
    } catch (error) {
      if (error instanceof GraphPortFailure && error.failure.kind === "AUTH") {
        return { ok: false, status: "AUTHENTICATION_REQUIRED", message: error.message };
      }
      return { ok: false, status: "UNAVAILABLE", message: error instanceof Error ? error.message : "unavailable" };
    }
  }

  async resolveSite(input: { connection: M365Connection; hostname: string; path: string }) {
    const relative = input.path.replace(/^\//, "");
    const path = relative ? `/sites/${input.hostname}:/${relative}` : `/sites/${input.hostname}`;
    const response = await this.graph(input.connection, path);
    if (response.status === 404) throw new GraphPortFailure({ kind: "NOT_FOUND", message: "site_not_found" });
    if (!response.ok) throw new GraphPortFailure({ kind: "NETWORK", message: `site_http_${response.status}` });
    const json = (await response.json()) as { id?: string; displayName?: string; webUrl?: string };
    if (!json.id) throw new GraphPortFailure({ kind: "NOT_FOUND", message: "site_not_found" });
    return {
      siteId: json.id,
      hostname: input.hostname,
      path: input.path,
      displayName: json.displayName ?? (input.path || input.hostname),
      webUrl: json.webUrl ?? `https://${input.hostname}${input.path}`,
    };
  }

  async listLibraries(input: { connection: M365Connection; siteId: string }) {
    const response = await this.graph(input.connection, `/sites/${input.siteId}/drives?$select=id,name,driveType,webUrl`);
    if (response.status === 404) throw new GraphPortFailure({ kind: "NOT_FOUND", message: "library_unavailable" });
    if (!response.ok) throw new GraphPortFailure({ kind: "NETWORK", message: `drives_http_${response.status}` });
    const json = (await response.json()) as { value?: Array<{ id: string; name: string; driveType?: string; webUrl?: string }> };
    return (json.value ?? [])
      .filter((row) => row.driveType !== "personal")
      .map((row) => ({
        driveId: row.id,
        name: row.name,
        driveType: row.driveType ?? "documentLibrary",
        webUrl: row.webUrl ?? null,
      }));
  }

  async listChildren(input: {
    connection: M365Connection;
    siteId: string;
    driveId: string;
    rootItemId?: string | null;
    skipToken?: string | null;
    pageSize?: number;
  }) {
    const root = input.rootItemId ? `/drives/${input.driveId}/items/${input.rootItemId}/children` : `/drives/${input.driveId}/root/children`;
    const size = input.pageSize ?? DEFAULT_PAGE_SIZE;
    const qs = new URLSearchParams({ $top: String(size), $select: "id,name,parentReference,webUrl,file,folder,size,eTag,cTag,lastModifiedDateTime,lastModifiedBy" });
    if (input.skipToken) qs.set("$skiptoken", input.skipToken);
    const response = await this.graph(input.connection, `${root}?${qs.toString()}`);
    const json = (await response.json()) as GraphListResponse;
    return mapPage(json, input.siteId, input.driveId);
  }

  async delta(input: {
    connection: M365Connection;
    siteId: string;
    driveId: string;
    rootItemId?: string | null;
    deltaToken?: string | null;
  }) {
    const path = input.deltaToken
      ? `/drives/${input.driveId}/root/delta?token=${encodeURIComponent(input.deltaToken)}`
      : input.rootItemId
        ? `/drives/${input.driveId}/items/${input.rootItemId}/delta`
        : `/drives/${input.driveId}/root/delta`;
    const response = await this.graph(input.connection, path);
    const json = (await response.json()) as GraphListResponse;
    return mapPage(json, input.siteId, input.driveId);
  }

  async getItem(input: { connection: M365Connection; driveId: string; itemId: string }) {
    const response = await this.graph(input.connection, `/drives/${input.driveId}/items/${input.itemId}`);
    if (response.status === 404) return null;
    const json = (await response.json()) as GraphItemResponse;
    return mapItem(json, json.parentReference?.siteId ?? "", input.driveId);
  }

  async download(input: { connection: M365Connection; driveId: string; itemId: string }) {
    const response = await this.graph(input.connection, `/drives/${input.driveId}/items/${input.itemId}/content`);
    if (!response.ok) {
      throw new GraphPortFailure({
        kind: response.status === 403 ? "FORBIDDEN" : response.status === 404 ? "NOT_FOUND" : "NETWORK",
        message: `content_http_${response.status}`,
      });
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    return bytes;
  }

  async upload(input: {
    connection: M365Connection;
    driveId: string;
    parentId: string;
    fileName: string;
    content: Buffer;
    contentType: string;
  }) {
    const path = `/drives/${input.driveId}/items/${input.parentId}:/${encodeURIComponent(input.fileName)}:/content`;
    const response = await this.graph(input.connection, path, {
      method: "PUT",
      headers: { "Content-Type": input.contentType },
      body: new Uint8Array(input.content),
    });
    const json = (await response.json()) as GraphItemResponse;
    return mapItem(json, json.parentReference?.siteId ?? "", input.driveId);
  }
}

type GraphItemResponse = {
  id: string;
  name: string;
  webUrl?: string;
  size?: number;
  eTag?: string;
  cTag?: string;
  lastModifiedDateTime?: string;
  file?: { mimeType?: string };
  folder?: Record<string, unknown>;
  deleted?: { state?: string };
  parentReference?: { id?: string; driveId?: string; siteId?: string; path?: string; driveType?: string };
  lastModifiedBy?: { user?: { displayName?: string } };
};

type GraphListResponse = {
  value?: GraphItemResponse[];
  "@odata.nextLink"?: string;
  "@odata.deltaLink"?: string;
};

function mapItem(row: GraphItemResponse, siteId: string, driveId: string): GraphDriveItem {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parentReference?.id ?? null,
    siteId: row.parentReference?.siteId ?? siteId,
    driveId: row.parentReference?.driveId ?? driveId,
    driveType: row.parentReference?.driveType,
    webUrl: row.webUrl ?? null,
    mimeType: row.file?.mimeType ?? null,
    size: row.size ?? null,
    etag: row.eTag ?? null,
    ctag: row.cTag ?? null,
    lastModifiedAt: row.lastModifiedDateTime ?? null,
    lastModifiedBy: row.lastModifiedBy?.user?.displayName ?? null,
    pathWithinRoot: row.parentReference?.path ? `${row.parentReference.path}/${row.name}` : `/${row.name}`,
    deleted: Boolean(row.deleted),
    folder: Boolean(row.folder),
  };
}

function mapPage(json: GraphListResponse, siteId: string, driveId: string): GraphPage<GraphDriveItem> {
  return {
    items: (json.value ?? []).map((row) => mapItem(row, siteId, driveId)),
    nextLink: json["@odata.nextLink"] ?? null,
    deltaLink: json["@odata.deltaLink"] ?? null,
  };
}

function retryAfter(response: Response): number {
  const header = response.headers.get("Retry-After");
  const seconds = header ? Number(header) : 2;
  return Number.isFinite(seconds) ? Math.min(60_000, Math.max(200, seconds * 1000)) : 2000;
}

async function fetchGraph(url: string, init: RequestInit, hop = 0): Promise<Response> {
  const allowed = hop === 0 ? isAllowedGraphUrl(url) : validateRedirectLocation(url);
  if (!allowed) throw new Error("SSRF_BLOCKED");
  const response = await fetch(url, { ...init, redirect: "manual" });
  if ([301, 302, 307, 308].includes(response.status) && hop < 3) {
    const location = response.headers.get("location");
    if (!validateRedirectLocation(location) || !location) throw new Error("UNSAFE_REDIRECT");
    const next = location.startsWith("http") ? location : new URL(location, url).toString();
    return fetchGraph(next, init, hop + 1);
  }
  return response;
}
