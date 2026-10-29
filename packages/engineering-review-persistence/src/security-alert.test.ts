import { describe, expect, it, vi } from "vitest";
import { emitReviewSecurityAlert } from "./security-alert";

describe("Review security alert sink", () => {
  it("emits structured JSON without document content", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await emitReviewSecurityAlert({
      name: "review.cross_tenant_attempt",
      at: "2026-09-20T00:00:00.000Z",
      requestId: "req-1",
      code: "cross_tenant_rejected",
      resourceType: "engineering_review_package",
      resourceId: "pkg-1",
    });
    expect(warn).toHaveBeenCalled();
    const payload = JSON.parse(String(warn.mock.calls[0]?.[0]));
    expect(payload.kind).toBe("rtb.review.security_alert");
    expect(payload.severity).toBe("critical");
    expect(payload.destination).toBe("structured_log");
    expect(payload.owner).toBe("review-oncall");
    expect(JSON.stringify(payload).toLowerCase()).not.toMatch(/extractedtext|service_role|apikey/);
    warn.mockRestore();
  });

  it("does not alert for non-actionable upload blocks", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await emitReviewSecurityAlert({
      name: "review.external_upload_blocked",
      at: "2026-09-20T00:00:00.000Z",
      code: "external_upload_disabled",
    });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
