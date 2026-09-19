import { describe, expect, it, vi } from "vitest";
import { bindPlatformReviewAudit } from "./audit-bind";
import { createSupabaseEngineeringReviewStore } from "./supabase-store";
import { EngineeringReviewError } from "@rtb/engineering-review";

describe("production adapter unit", () => {
  it("rejects anonymous client construction", () => {
    expect(() =>
      createSupabaseEngineeringReviewStore({
        client: {} as never,
        kind: "anon",
      }),
    ).toThrow(EngineeringReviewError);
  });

  it("maps platform audit through AuditService and does not throw when insert fails", async () => {
    const sink = bindPlatformReviewAudit({
      from() {
        return {
          insert() {
            return {
              select() {
                return {
                  async single() {
                    return { data: null, error: { message: "audit unavailable" } };
                  },
                };
              },
            };
          },
        };
      },
    } as never);
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(
      sink.record({
        tenantId: "00000000-0000-4000-8000-000000000001" as never,
        workspaceId: "00000000-0000-4000-8000-000000000002" as never,
        projectId: "00000000-0000-4000-8000-000000000003" as never,
        action: "review_package.created",
        resourceType: "engineering_review_package",
        resourceId: "00000000-0000-4000-8000-000000000004",
        at: new Date().toISOString(),
      }),
    ).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
