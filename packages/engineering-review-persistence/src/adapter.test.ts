import { describe, expect, it, vi } from "vitest";
import { bindPlatformReviewAudit, bindTrustedReviewAudit } from "./audit-bind";
import { parseEnvAssignments } from "./env";
import { createSupabaseEngineeringReviewStore } from "./supabase-store";
import { EngineeringReviewError } from "@rtb/engineering-review";

describe("env assignment parsing", () => {
  it("lets later duplicate keys win and ignores invalid names", () => {
    const parsed = parseEnvAssignments(
      [
        "SUPABASE_SERVICE_ROLE_KEY=first",
        "NEXT_PUBLIC_SUPABASE_URL=https://example-one.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY=second",
        "NEXT_PUBLIC_SUPABASE_URL=https://example-two.supabase.co",
        "$env:SMOKE_BASE_URL=ignored",
        "https://teams.microsoft.com/meet/1?p=x=ignored",
      ].join("\n"),
    );
    expect(parsed.SUPABASE_SERVICE_ROLE_KEY).toBe("second");
    expect(parsed.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example-two.supabase.co");
    expect(parsed["$env:SMOKE_BASE_URL"]).toBeUndefined();
  });
});

describe("production adapter unit", () => {
  it("rejects anonymous client construction", () => {
    expect(() =>
      createSupabaseEngineeringReviewStore({
        client: {} as never,
        kind: "anon",
      }),
    ).toThrow(EngineeringReviewError);
    expect(typeof bindTrustedReviewAudit).toBe("function");
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
