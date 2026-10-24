import { describe, expect, it } from "vitest";
import {
  CANONICAL_TENANT_ONBOARDING_MODEL,
  assertCanAssignInviteRole,
  isPilotInviteRoleSlug,
  mapPilotInviteRole,
} from "./membership-admin";

describe("pilot invite role mapping", () => {
  it("locks self-service as the only canonical owner onboarding model", () => {
    expect(CANONICAL_TENANT_ONBOARDING_MODEL).toBe("SELF_SERVICE");
  });
  it("maps canonical admin/engineer/reviewer labels onto platform slugs", () => {
    expect(mapPilotInviteRole("admin")).toBe("admin");
    expect(mapPilotInviteRole("project manager")).toBe("admin");
    expect(mapPilotInviteRole("engineer")).toBe("member");
    expect(mapPilotInviteRole("member")).toBe("member");
    expect(mapPilotInviteRole("licensed reviewer")).toBe("viewer");
    expect(mapPilotInviteRole("viewer")).toBe("viewer");
  });

  it("only treats platform RBAC slugs as assignable invite roles", () => {
    expect(isPilotInviteRoleSlug("admin")).toBe(true);
    expect(isPilotInviteRoleSlug("owner")).toBe(false);
    expect(isPilotInviteRoleSlug("engineer")).toBe(false);
  });

  it("refuses invite-role mutation of an existing owner", () => {
    expect(() => assertCanAssignInviteRole("owner")).toThrow(/Owner tenant role cannot be changed/);
    expect(() => assertCanAssignInviteRole("admin")).not.toThrow();
    expect(() => assertCanAssignInviteRole("member")).not.toThrow();
    expect(() => assertCanAssignInviteRole("viewer")).not.toThrow();
  });
});
