import { describe, expect, it } from "vitest";
import { IdentityProvisioningError } from "./identity-onboarding";
import {
  CANONICAL_TENANT_ONBOARDING_MODEL,
  MembershipAdminService,
  assertCanAssignInviteRole,
  isPilotInviteRoleSlug,
  mapPilotInviteRole,
} from "./membership-admin";
import { resolveActiveMembershipAccess } from "./nav-visibility";

describe("pilot invite role mapping", () => {
  it("locks self-service as the only canonical owner onboarding model", () => {
    expect(CANONICAL_TENANT_ONBOARDING_MODEL).toBe("SELF_SERVICE");
  });
  it("maps canonical admin/engineer/reviewer labels onto platform slugs", () => {
    expect(mapPilotInviteRole("admin")).toBe("admin");
    expect(mapPilotInviteRole("project manager")).toBe("admin");
    expect(mapPilotInviteRole("engineer")).toBe("member");
    expect(mapPilotInviteRole("pilot_engineer")).toBe("pilot-engineer");
    expect(mapPilotInviteRole("member")).toBe("member");
    expect(mapPilotInviteRole("licensed reviewer")).toBe("viewer");
    expect(mapPilotInviteRole("viewer")).toBe("viewer");
  });

  it("only treats platform RBAC slugs as assignable invite roles", () => {
    expect(isPilotInviteRoleSlug("admin")).toBe(true);
    expect(isPilotInviteRoleSlug("pilot-engineer")).toBe(true);
    expect(isPilotInviteRoleSlug("owner")).toBe(false);
    expect(isPilotInviteRoleSlug("engineer")).toBe(false);
  });

  it("suspends another member in the same tenant and refuses self or a missing member", async () => {
    const calls: string[] = [];
    const client = {
      from(table: string) {
        calls.push(table);
        return {
          update(values: { status: string }) {
            calls.push(values.status);
            return this;
          },
          eq() {
            return this;
          },
          select() {
            return this;
          },
          maybeSingle: async () => ({ data: { id: "membership-1", user_id: "user-b", status: "suspended" }, error: null }),
          insert: async () => ({ error: null }),
        };
      },
    };
    const service = new MembershipAdminService(client as never);
    const updated = await service.setMembershipStatus({
      tenantId: "tenant-a",
      actorUserId: "user-a",
      userId: "user-b",
      status: "suspended",
    });
    expect(updated).toMatchObject({ status: "suspended", engineeringAuthority: false });
    expect(calls).toEqual(["tenant_memberships", "suspended", "audit_events"]);
    await expect(
      service.setMembershipStatus({
        tenantId: "tenant-a",
        actorUserId: "user-a",
        userId: "user-a",
        status: "suspended",
      }),
    ).rejects.toBeInstanceOf(IdentityProvisioningError);
  });

  it("refuses invite-role mutation of an existing owner", () => {
    expect(() => assertCanAssignInviteRole("owner")).toThrow(/Owner tenant role cannot be changed/);
    expect(() => assertCanAssignInviteRole("admin")).not.toThrow();
    expect(() => assertCanAssignInviteRole("member")).not.toThrow();
    expect(() => assertCanAssignInviteRole("viewer")).not.toThrow();
  });
});

describe("active workspace role isolation", () => {
  const memberships = [{ roleSlug: "owner" }, { roleSlug: "member" }];

  it("uses the selected workspace role instead of the other workspace owner role", () => {
    expect(resolveActiveMembershipAccess(memberships, "member")).toEqual({
      roleSlug: "member",
      tier: "engineer",
    });
  });

  it("keeps owner authority when that workspace is selected", () => {
    expect(resolveActiveMembershipAccess(memberships, "owner")).toEqual({
      roleSlug: "owner",
      tier: "admin",
    });
  });

  it("fails closed to the least privilege when no workspace is selected", () => {
    expect(resolveActiveMembershipAccess(memberships, null)?.roleSlug).toBe("member");
  });

  it("preserves a single owner workspace when it is the only membership", () => {
    expect(resolveActiveMembershipAccess([{ roleSlug: "owner" }], null)).toEqual({
      roleSlug: "owner",
      tier: "admin",
    });
  });
});
