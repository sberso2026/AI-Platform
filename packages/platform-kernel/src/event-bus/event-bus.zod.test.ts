import type { SupabaseClient } from "@rtb/database";
import { describe, expect, it } from "vitest";
import { EventBusService, eventPayloadSchema } from "./event-bus";

const RFC_UUID = "550e8400-e29b-41d4-a716-446655440000";
const GUID_ONLY = "00000000-0000-0000-0000-000000000000";

function client(capture: { inserted?: Record<string, unknown> }): SupabaseClient {
  return {
    from(table: string) {
      if (table === "events") {
        return {
          insert(row: Record<string, unknown>) {
            capture.inserted = row;
            return {
              select() {
                return {
                  single: async () => ({
                    data: {
                      id: RFC_UUID,
                      tenant_id: row.tenant_id,
                      workspace_id: row.workspace_id,
                      event_type: row.event_type,
                      source: row.source,
                      payload: row.payload,
                      metadata: row.metadata,
                      correlation_id: row.correlation_id,
                      causation_id: row.causation_id,
                      status: "published",
                      created_at: "2026-10-24T00:00:00.000Z",
                    },
                    error: null,
                  }),
                };
              },
            };
          },
        };
      }
      const chain = {
        eq() {
          return chain;
        },
        then(resolve: (value: { data: unknown[] }) => void) {
          resolve({ data: [] });
        },
      };
      return { select: () => chain };
    },
  } as unknown as SupabaseClient;
}

describe("platform event schema on patched zod", () => {
  it("parses objects, defaults, optional fields, records, and uuid checks", async () => {
    const capture: { inserted?: Record<string, unknown> } = {};
    const bus = new EventBusService(client(capture));
    const published = await bus.publish({ tenantId: RFC_UUID, eventType: "review.requested" });
    expect(published.event_type).toBe("review.requested");
    expect(capture.inserted).toMatchObject({
      tenant_id: RFC_UUID,
      workspace_id: null,
      source: "platform",
      payload: {},
      metadata: {},
      correlation_id: null,
      causation_id: null,
    });

    const parsed = eventPayloadSchema.parse({
      tenantId: RFC_UUID,
      workspaceId: RFC_UUID,
      eventType: "review.requested",
      payload: { subject: "site-1" },
      correlationId: GUID_ONLY,
    });
    expect(parsed.payload).toEqual({ subject: "site-1" });
    expect(parsed.metadata).toEqual({});
    expect(parsed.source).toBe("platform");
    expect(parsed.correlationId).toBe(GUID_ONLY);

    const safe = eventPayloadSchema.safeParse({ tenantId: "not-a-uuid", eventType: "x" });
    expect(safe.success).toBe(false);
    expect(eventPayloadSchema.safeParse({ tenantId: RFC_UUID, eventType: "" }).success).toBe(false);
    expect(eventPayloadSchema.safeParse({ tenantId: RFC_UUID, eventType: "x", workspaceId: null }).success).toBe(false);
    await expect(bus.publish({ tenantId: "latest", eventType: "x" })).rejects.toThrow();
  });
});
