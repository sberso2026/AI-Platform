import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  IdentityProvisioningError,
  assertActivationResendAllowed,
  buildInviteUserMetadata,
  classifyIdentityFailure,
  deriveOnboardingState,
  shouldBlockSeatAssignment,
} from "./identity-onboarding";
import { MembershipAdminService } from "./membership-admin";
import { deliverActivationMail, type AuthMailAdapter } from "./auth-mail-adapter";
import {
  CANONICAL_AUTH_ACTIVATION_PATH,
  buildAuthActivationRedirect,
} from "./canonical-auth-origin";

const PILOT = "https://eos-pilot.rtbea.com.au";
const TENANT = "tenant-a";
const WS = "workspace-a";
const ROLE_ID = "role-member";

function chain(result: { data: unknown; error: null | { message: string } }) {
  const api: Record<string, unknown> = {};
  const self = () => api;
  api.select = self;
  api.eq = self;
  api.in = self;
  api.order = self;
  api.maybeSingle = async () => result;
  api.single = async () => result;
  api.upsert = async () => ({ error: null });
  api.update = self;
  api.insert = self;
  return api;
}

function createMock(options: {
  users?: Array<{
    id: string;
    email: string;
    email_confirmed_at?: string | null;
    user_metadata?: Record<string, unknown>;
  }>;
  otherTenant?: boolean;
  createUser?: (input: Record<string, unknown>) => Promise<{ data: { user: { id: string; email: string; email_confirmed_at: null } }; error: null }>;
  mailer?: AuthMailAdapter;
}) {
  const users = options.users ?? [];
  const created: Array<Record<string, unknown>> = [];
  const upserts: Array<{ table: string; row: unknown }> = [];
  const admin = {
    auth: {
      admin: {
        listUsers: async () => ({ data: { users }, error: null }),
        getUserById: async (id: string) => ({
          data: { user: users.find((user) => user.id === id) ?? created.find((user) => user.id === id) ?? null },
          error: null,
        }),
        createUser: async (input: Record<string, unknown>) => {
          created.push(input);
          if (options.createUser) return options.createUser(input);
          const user = {
            id: `user-${created.length}`,
            email: String(input.email),
            email_confirmed_at: null,
            user_metadata: (input.user_metadata ?? {}) as Record<string, unknown>,
          };
          users.push(user);
          return { data: { user }, error: null };
        },
        updateUserById: async (id: string, attrs: { user_metadata?: Record<string, unknown> }) => {
          const user = users.find((item) => item.id === id);
          if (user && attrs.user_metadata) user.user_metadata = { ...user.user_metadata, ...attrs.user_metadata };
          return { data: { user }, error: null };
        },
        generateLink: async () => ({ data: { properties: { action_link: `${PILOT}/reset-password` } }, error: null }),
        inviteUserByEmail: async () => {
          throw new Error("inviteUserByEmail must not be used");
        },
      },
    },
    from(table: string) {
      if (table === "roles") return chain({ data: { id: ROLE_ID, slug: "member" }, error: null });
      if (table === "workspaces") return chain({ data: { id: WS }, error: null });
      if (table === "tenant_memberships") {
        const memberships = options.otherTenant
          ? [{ tenant_id: "other-tenant" }]
          : users.length
            ? [{ tenant_id: TENANT }]
            : [];
        return {
          ...chain({ data: memberships[0] ?? null, error: null }),
          select: () => ({
            eq: () => Promise.resolve({ data: memberships, error: null }),
          }),
          upsert: async (row: unknown) => {
            upserts.push({ table, row });
            return { error: null };
          },
        };
      }
      if (table === "workspace_memberships") {
        return {
          upsert: async (row: unknown) => {
            upserts.push({ table, row });
            return { error: null };
          },
        };
      }
      return chain({ data: null, error: null });
    },
  };
  const mailer: AuthMailAdapter =
    options.mailer ??
    ({
      send: async () => ({ delivered: true, actionLink: `${PILOT}/reset-password` }),
    } satisfies AuthMailAdapter);
  return {
    service: new MembershipAdminService(admin as never, mailer),
    created,
    upserts,
    users,
  };
}

describe("identity onboarding states", () => {
  it("derives pending_activation for unconfirmed users", () => {
    expect(deriveOnboardingState({ emailConfirmed: false })).toBe("pending_activation");
  });
  it("derives active after Auth confirmation", () => {
    expect(deriveOnboardingState({ emailConfirmed: true })).toBe("active");
  });
  it("derives activation_delivery_failed without deleting identity", () => {
    expect(deriveOnboardingState({ emailConfirmed: false, activationDelivery: "failed" })).toBe(
      "activation_delivery_failed",
    );
  });
  it("derives suspended from membership status", () => {
    expect(deriveOnboardingState({ emailConfirmed: true, membershipStatus: "suspended" })).toBe("suspended");
  });
});

describe("identity provisioning helpers", () => {
  it("never auto-confirms invite metadata", () => {
    const meta = buildInviteUserMetadata({
      tenantId: TENANT,
      workspaceId: WS,
      roleSlug: "member",
      invitedBy: "admin-1",
    });
    expect(meta.invited_tenant_id).toBe(TENANT);
    expect(meta.activation_delivery).toBe("pending");
    expect(JSON.stringify(meta)).not.toContain("email_confirm");
  });

  it("rate-limits activation resend per user", () => {
    expect(() => assertActivationResendAllowed(new Date().toISOString())).toThrow(IdentityProvisioningError);
    expect(() => assertActivationResendAllowed(new Date(Date.now() - 61 * 60 * 1000).toISOString())).not.toThrow();
  });

  it("blocks seat assignment when licensed capacity is already exceeded", () => {
    expect(shouldBlockSeatAssignment(7, 5)).toBe(true);
    expect(shouldBlockSeatAssignment(4, 5)).toBe(false);
  });

  it("maps known Auth failures to bounded codes", () => {
    expect(classifyIdentityFailure(new Error("already been registered")).code).toBe("identity_exists");
    expect(classifyIdentityFailure(new Error("Seat pool capacity exceeded")).code).toBe("seat_capacity_exceeded");
    expect(classifyIdentityFailure({ code: "over_email_send_rate_limit", message: "rate" }).status).toBe(429);
    expect(classifyIdentityFailure(new Error("failed to send")).code).toBe("activation_delivery_failed");
    expect(classifyIdentityFailure(new Error('Email address "a@b.com" is invalid')).code).toBe("invalid_recipient");
  });
});

describe("MembershipAdminService.invite", () => {
  it("creates a pending Auth identity with email_confirm false", async () => {
    const mock = createMock({});
    const result = await mock.service.invite({
      tenantId: TENANT,
      workspaceId: WS,
      email: "new.user@rtbea.com.au",
      roleSlug: "member",
      invitedBy: "admin-1",
      redirectTo: `${PILOT}/reset-password`,
    });
    expect(mock.created[0]?.email_confirm).toBe(false);
    expect(mock.created[0]?.password).toBeUndefined();
    expect(result.created).toBe(true);
    expect(result.delivery).toBe("activation_sent");
    expect(result.onboardingState).toBe("pending_activation");
    expect(result.applicationAccess).toBe("not_assigned");
    expect(mock.upserts.some((row) => row.table === "tenant_memberships")).toBe(true);
    expect(mock.upserts.some((row) => row.table === "workspace_memberships")).toBe(true);
  });

  it("does not call inviteUserByEmail", async () => {
    const mock = createMock({});
    await mock.service.invite({
      tenantId: TENANT,
      workspaceId: WS,
      email: "new.user@rtbea.com.au",
      roleSlug: "admin",
      invitedBy: "admin-1",
      redirectTo: `${PILOT}/reset-password`,
    });
    expect(mock.created).toHaveLength(1);
  });

  it("is idempotent for an existing pending user on the same tenant", async () => {
    const mock = createMock({
      users: [{ id: "u1", email: "dup@rtbea.com.au", email_confirmed_at: null }],
    });
    const first = await mock.service.invite({
      tenantId: TENANT,
      workspaceId: WS,
      email: "dup@rtbea.com.au",
      roleSlug: "member",
      invitedBy: "admin-1",
      redirectTo: `${PILOT}/reset-password`,
    });
    const second = await mock.service.invite({
      tenantId: TENANT,
      workspaceId: WS,
      email: "dup@rtbea.com.au",
      roleSlug: "member",
      invitedBy: "admin-1",
      redirectTo: `${PILOT}/reset-password`,
    });
    expect(first.userId).toBe("u1");
    expect(second.userId).toBe("u1");
    expect(second.created).toBe(false);
    expect(mock.created).toHaveLength(0);
  });

  it("refuses to cross-link an identity from another tenant", async () => {
    const mock = createMock({
      users: [{ id: "foreign", email: "sberso@yahoo.com.au", email_confirmed_at: "2026-01-01" }],
      otherTenant: true,
    });
    await expect(
      mock.service.invite({
        tenantId: TENANT,
        workspaceId: WS,
        email: "sberso@yahoo.com.au",
        roleSlug: "member",
        invitedBy: "admin-1",
        redirectTo: `${PILOT}/reset-password`,
      }),
    ).rejects.toMatchObject({ code: "identity_exists", status: 409 });
  });

  it("keeps the pending identity when activation mail fails", async () => {
    const mock = createMock({
      mailer: { send: async () => ({ delivered: false, error: "smtp down" }) },
    });
    await expect(
      mock.service.invite({
        tenantId: TENANT,
        workspaceId: WS,
        email: "pending@rtbea.com.au",
        roleSlug: "viewer",
        invitedBy: "admin-1",
        redirectTo: `${PILOT}/reset-password`,
      }),
    ).rejects.toMatchObject({ code: "activation_delivery_failed", status: 502 });
    expect(mock.created).toHaveLength(1);
    expect((mock.created[0] as { email_confirm?: boolean }).email_confirm).toBe(false);
  });

  it("refuses temporary-password break-glass on the canonical path", async () => {
    const mock = createMock({});
    await expect(
      mock.service.invite({
        tenantId: TENANT,
        workspaceId: WS,
        email: "x@rtbea.com.au",
        roleSlug: "member",
        invitedBy: "admin-1",
        breakGlass: true,
      }),
    ).rejects.toMatchObject({ status: 422 });
  });

  it("resends activation without creating another Auth user", async () => {
    const mock = createMock({
      users: [{ id: "u-pending", email: "pending@rtbea.com.au", email_confirmed_at: null, user_metadata: {} }],
    });
    const result = await mock.service.resendActivation({
      tenantId: TENANT,
      userId: "u-pending",
      redirectTo: `${PILOT}/reset-password`,
      actorUserId: "admin-1",
    });
    expect(result.userId).toBe("u-pending");
    expect(result.delivery).toBe("activation_sent");
    expect(mock.created).toHaveLength(0);
  });
});

describe("activation mail adapter", () => {
  it("does not delete identity when send fails", async () => {
    await expect(
      deliverActivationMail(
        { send: async () => ({ delivered: false, error: "mailer" }) },
        { email: "a@b.com", redirectTo: `${PILOT}/reset-password`, template: "activation" },
      ),
    ).rejects.toMatchObject({ code: "activation_delivery_failed" });
  });
});

describe("custom-domain activation redirect", () => {
  it("uses /reset-password on the pilot domain", () => {
    expect(CANONICAL_AUTH_ACTIVATION_PATH).toBe("/reset-password");
    expect(buildAuthActivationRedirect({ appUrl: PILOT })).toBe(`${PILOT}/reset-password`);
  });
});

describe("service-role exposure contract", () => {
  it("does not put the service role in browser identity or recovery pages", () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../apps/web/src");
    const users = readFileSync(resolve(root, "app/(platform)/users/page.tsx"), "utf8");
    const forgot = readFileSync(resolve(root, "app/(auth)/forgot-password/page.tsx"), "utf8");
    const reset = readFileSync(resolve(root, "app/(auth)/reset-password/page.tsx"), "utf8");
    for (const source of [users, forgot, reset]) {
      expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(source).not.toContain("service_role");
      expect(source).not.toContain("inviteUserByEmail");
    }
  });
});
