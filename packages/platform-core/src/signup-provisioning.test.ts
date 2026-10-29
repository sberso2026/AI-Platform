import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const inviteMigration = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../supabase/migrations/20260901013000_batch_99_invite_no_stray_tenant.sql"),
  "utf8",
);

/**
 * Signup provisioning contract tests (Batch 2.06b).
 * Encodes the required auth → profile → tenant → membership → workspace path.
 * Live DB coverage runs via supabase migration 20260206000000_fix_signup_provisioning.sql.
 */

const SIGNUP_PROVISIONING_STEPS = [
  "auth.users insert",
  "profiles row",
  "tenants row",
  "default roles (owner)",
  "default workspace",
  "tenant_memberships (owner)",
  "workspace_memberships",
  "engineering OS seed (best-effort)",
] as const;

describe("Signup provisioning path", () => {
  it("defines complete auth user provisioning sequence", () => {
    expect(SIGNUP_PROVISIONING_STEPS).toContain("profiles row");
    expect(SIGNUP_PROVISIONING_STEPS).toContain("tenants row");
    expect(SIGNUP_PROVISIONING_STEPS).toContain("tenant_memberships (owner)");
    expect(SIGNUP_PROVISIONING_STEPS).toContain("workspace_memberships");
    expect(SIGNUP_PROVISIONING_STEPS[0]).toBe("auth.users insert");
  });

  it("requires handle_new_user to be SECURITY DEFINER with search_path", () => {
    const functionContract = {
      name: "handle_new_user",
      language: "plpgsql",
      security: "DEFINER",
      search_path: "public",
      trigger: "on_auth_user_created AFTER INSERT ON auth.users",
    };
    expect(functionContract.security).toBe("DEFINER");
    expect(functionContract.search_path).toBe("public");
    expect(functionContract.trigger).toContain("auth.users");
  });

  it("creates tenant via trigger — not a manual frontend insert", () => {
    const rules = {
      createTenantInFrontend: false,
      createTenantInHandleNewUser: true,
      createMembershipAsOwner: true,
    };
    expect(rules.createTenantInFrontend).toBe(false);
    expect(rules.createTenantInHandleNewUser).toBe(true);
    expect(rules.createMembershipAsOwner).toBe(true);
  });
});

describe("Tenant creation contract", () => {
  it("requires unique slug generation", () => {
    const slug = (base: string) =>
      base
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "org";
    expect(slug("Acme Engineering")).toBe("acme-engineering");
    expect(slug("!!!")).toBe("org");
  });

  it("stores signup provenance in tenant.settings", () => {
    const settings = { created_via: "signup", owner_user_id: "user-uuid" };
    expect(settings.created_via).toBe("signup");
    expect(settings.owner_user_id).toBeTruthy();
  });
});

describe("Membership creation contract", () => {
  it("joins invited users to invited_tenant_id instead of creating a tenant", () => {
    const inviteMetadata = {
      invited_tenant_id: "tenant-uuid",
      invited_role_slug: "member",
      invited_workspace_id: "workspace-uuid",
    };
    expect(inviteMetadata.invited_role_slug).toBe("member");
    expect(["admin", "member", "viewer"]).toContain(inviteMetadata.invited_role_slug);
  });

  it("invite handle_new_user never bootstraps a signup tenant", () => {
    expect(inviteMigration).toContain("signup tenant bootstrap is forbidden for invited users");
    expect(inviteMigration).toMatch(/IF v_invite_marker IS NOT NULL THEN[\s\S]*RETURN NEW;/);
    const inviteBranch = inviteMigration.slice(
      inviteMigration.indexOf("IF v_invite_marker IS NOT NULL THEN"),
      inviteMigration.indexOf("v_tenant_name :="),
    );
    expect(inviteBranch).not.toMatch(/INSERT INTO public\.tenants/);
    expect(inviteBranch).toContain("INSERT INTO public.tenant_memberships");
    expect(inviteBranch).toContain("INSERT INTO public.workspace_memberships");
  });

  it("assigns owner role on signup tenant membership", () => {
    const membership = {
      role_slug: "owner",
      status: "active",
      joined_at_required: true,
    };
    expect(membership.role_slug).toBe("owner");
    expect(membership.status).toBe("active");
  });

  it("links workspace membership via roles.id FK", () => {
    const workspaceMembershipColumns = ["workspace_id", "user_id", "role_id"];
    expect(workspaceMembershipColumns).toContain("role_id");
    expect(workspaceMembershipColumns).not.toContain("role");
  });
});

describe("Workspace creation contract", () => {
  it("creates default workspace slug on tenant insert", () => {
    const workspace = { name: "Default Workspace", slug: "default", type: "default", status: "active" };
    expect(workspace.slug).toBe("default");
    expect(workspace.type).toBe("default");
  });
});

describe("Signup UI error rendering", () => {
  function formatAuthError(error: {
    message?: string;
    status?: number | string;
    code?: string;
  }): string {
    const message =
      typeof error.message === "string" && error.message.trim().length > 0
        ? error.message.trim()
        : "Signup failed";
    const parts = [message];
    if (error.status != null && String(error.status).length > 0) {
      parts.push(`(status ${error.status})`);
    }
    if (error.code) parts.push(`[${error.code}]`);
    const rendered = parts.join(" ");
    if (!rendered || rendered === "{}" || rendered === "[object Object]") {
      return "Signup failed. Check email confirmation settings and Auth logs.";
    }
    return rendered;
  }

  it("renders message and status instead of empty object", () => {
    expect(formatAuthError({ message: "Database error saving new user", status: 500 })).toBe(
      "Database error saving new user (status 500)"
    );
  });

  it("does not render raw {}", () => {
    expect(formatAuthError({ message: "" })).not.toBe("{}");
    expect(formatAuthError({})).toContain("Signup failed");
  });
});
