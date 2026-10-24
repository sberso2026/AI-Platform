import type { ConnectorVendor, VendorExternalObject } from "./types";

export class VendorPortFailure extends Error {
  constructor(
    readonly failure: { kind: "AUTH" | "THROTTLE" | "NETWORK" | "RESYNC"; status?: number; retryAfterMs?: number },
  ) {
    super(`vendor_port_${failure.kind.toLowerCase()}`);
  }
}

export type VendorPort = {
  vendor: ConnectorVendor;
  list(input: { externalProjectId: string; cursor?: string | null }): Promise<{
    items: VendorExternalObject[];
    cursor?: string | null;
    status?: number;
    retryAfterMs?: number;
  }>;
  get(input: { externalProjectId: string; objectType: string; objectId: string }): Promise<VendorExternalObject | null>;
  update(input: {
    externalProjectId: string;
    objectType: string;
    objectId: string;
    etag: string | null;
    body: Record<string, unknown>;
  }): Promise<VendorExternalObject>;
};

export class MockVendorPort implements VendorPort {
  throttleNext = false;
  constructor(
    readonly vendor: ConnectorVendor,
    private readonly objects = new Map<string, VendorExternalObject>(),
  ) {}

  seed(object: VendorExternalObject) {
    this.objects.set(this.key(object.externalProjectId, object.objectType, object.objectId), object);
  }

  async list(input: { externalProjectId: string }) {
    if (this.throttleNext) {
      this.throttleNext = false;
      throw new VendorPortFailure({ kind: "THROTTLE", status: 429, retryAfterMs: 1200 });
    }
    const items = [...this.objects.values()].filter((row) => row.externalProjectId === input.externalProjectId);
    return { items, cursor: null, status: 200 };
  }

  async get(input: { externalProjectId: string; objectType: string; objectId: string }) {
    return this.objects.get(this.key(input.externalProjectId, input.objectType, input.objectId)) ?? null;
  }

  async update(input: {
    externalProjectId: string;
    objectType: string;
    objectId: string;
    etag: string | null;
    body: Record<string, unknown>;
  }) {
    const current = await this.get(input);
    if (!current) throw new Error("external_object_not_found");
    if ((current.etag ?? null) !== (input.etag ?? null)) throw new Error("EXTERNAL_STATE_CHANGED");
    const next: VendorExternalObject = {
      ...current,
      vendorStatus: typeof input.body.vendorStatus === "string" ? input.body.vendorStatus : current.vendorStatus,
      etag: `${current.etag ?? "v"}-published`,
      version: `${current.version ?? "A"}+eos`,
      occurredAt: new Date().toISOString(),
    };
    this.seed(next);
    return next;
  }

  private key(projectId: string, objectType: string, objectId: string) {
    return `${projectId}:${objectType}:${objectId}`;
  }
}
