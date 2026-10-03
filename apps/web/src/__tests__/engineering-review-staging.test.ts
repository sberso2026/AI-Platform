import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { evaluateReviewRuntime, REVIEW_EOS_PROJECT_REF, REVIEW_STAGING_PROJECT_REF } from "@rtb/engineering-review/runtime";
import { evaluateCanonicalReviewAccess, resolveCanonicalActorContext } from "@rtb/engineering-review/identity";
import { sanitizeAuditMetadata } from "@rtb/engineering-review";
import {
  applyRtbM365ServerEnv,
  RTB_M365_SERVER_ENV_KEYS,
} from "../../../../scripts/review-staging-m365-env.mjs";

const WEB_ROOT = resolve(__dirname, "../../");
const REPO_ROOT = resolve(WEB_ROOT, "../..");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

const TENANT_A = "22222222-2222-4222-8222-222222222222";
const TENANT_X = "11111111-1111-4111-8111-111111111111";
const WS_A = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const WS_X = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const memberships = [
  {
    tenantId: TENANT_X,
    tenantSlug: "signup-x",
    roleSlug: "owner",
    settings: { created_via: "signup" },
    workspaces: [{ workspaceId: WS_X, slug: "default", status: "active" }],
  },
  {
    tenantId: TENANT_A,
    tenantSlug: "cert-er-a",
    roleSlug: "engineer",
    settings: { engineeringReview: { requireMfa: true, requireEnterpriseSso: false } },
    workspaces: [{ workspaceId: WS_A, slug: "cert-er-a1", status: "active" }],
  },
];

describe("ERA-7C staging login and MFA path", () => {
  it("refuses EOS for staging runtime and accepts the staging project ref", () => {
    expect(
      evaluateReviewRuntime({
        url: `https://${REVIEW_EOS_PROJECT_REF}.supabase.co`,
        runtime: "staging",
      }).ok,
    ).toBe(false);
    expect(
      evaluateReviewRuntime({
        url: `https://${REVIEW_STAGING_PROJECT_REF}.supabase.co`,
        runtime: "staging",
      }),
    ).toEqual({ ok: true, projectRef: REVIEW_STAGING_PROJECT_REF });
    const script = readFileSync(resolve(REPO_ROOT, "scripts/review-staging.mjs"), "utf8");
    expect(script).toContain('EOS_REF = "wcydlhqiqdwgoaqrlget"');
    expect(script).toContain("Refusing to start Review staging against the EOS Supabase project.");
    expect(script).not.toMatch(/readFileSync\([^)]*apps\/web\/\.env\.local/);
    expect(script).toContain("projectRefFromJwt");
  });

  it("uses the configured public Supabase client and never ships service-role to the browser", () => {
    const client = readApp("src/lib/supabase/client.ts");
    const login = readApp("src/app/(auth)/login/page.tsx");
    const security = readApp("src/app/(platform)/settings/security/page.tsx");
    const challenge = readApp("src/app/(auth)/login/mfa/page.tsx");
    expect(client).toContain("resolvePublicSupabaseConfig");
    expect(login).toContain("createClient");
    expect(login).toContain("signInWithPassword");
    expect(login).toContain("postPasswordMfaDestination");
    expect(login).toContain("mapAuthError");
    expect(readApp("src/lib/supabase/public-config.ts")).not.toMatch(/SERVICE_ROLE|createServiceClient|sb_secret_/);
    for (const body of [client, login, security, challenge]) {
      expect(body).not.toMatch(/SERVICE_ROLE|createServiceClient|sb_secret_/);
    }
  });

  it("keeps canonical Tenant A / WS A1 and MFA fail-closed", () => {
    const selected = resolveCanonicalActorContext({ memberships });
    expect(selected).toMatchObject({ ok: true, tenantId: TENANT_A, workspaceId: WS_A });
    expect(
      evaluateCanonicalReviewAccess({
        memberships,
        requested: { tenantId: TENANT_A, workspaceId: WS_A },
        claims: { aal: "aal1", amr: ["password"] },
      }),
    ).toEqual({ allowed: false, reason: "mfa_required" });
    expect(
      evaluateCanonicalReviewAccess({
        memberships,
        requested: { tenantId: TENANT_A, workspaceId: WS_A },
        claims: { aal: "aal2", amr: ["password", "totp"] },
      }),
    ).toMatchObject({ allowed: true, tenantId: TENANT_A, workspaceId: WS_A });
    expect(
      resolveCanonicalActorContext({ memberships, requested: { tenantId: TENANT_X } }),
    ).toMatchObject({ ok: true, workspaceId: WS_X });
    expect(
      resolveCanonicalActorContext({
        memberships,
        requested: { tenantId: TENANT_A, workspaceId: WS_X },
        requestedWorkspaceOwnership: { workspaceId: WS_X, tenantId: TENANT_X },
      }),
    ).toEqual({ ok: false, reason: "workspace_not_in_tenant" });
    expect(sanitizeAuditMetadata({ totpSecret: "secret", tenantId: TENANT_A })).toEqual({ tenantId: TENANT_A });
  });
});

describe("EOS-A16C Review staging M365 env propagation", () => {
  const fakeSecret = "fake-entra-client-secret-value";
  const fileEnv = {
    RTB_M365_APPLICATION_ID: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    RTB_M365_CREDENTIAL_SECRET_ID: "secret:rtb-m365-multitenant",
    RTB_M365_CLIENT_SECRET: fakeSecret,
    UNRELATED_FILE_KEY: "must-not-copy",
    NEXT_PUBLIC_RTB_M365_CLIENT_SECRET: fakeSecret,
  };

  function stagingChildEnv(processEnv: NodeJS.ProcessEnv = {}, parsedFileEnv: Record<string, string> = fileEnv) {
    const childEnv: NodeJS.ProcessEnv = {
      ...processEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://rntonzigxwxcjlcsadip.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "fake-anon",
      SUPABASE_URL: "https://rntonzigxwxcjlcsadip.supabase.co",
      SUPABASE_ANON_KEY: "fake-anon",
      SUPABASE_SERVICE_ROLE_KEY: "fake-service",
      SUPABASE_PROJECT_REF: "rntonzigxwxcjlcsadip",
      RTB_REVIEW_RUNTIME: "staging",
      NEXT_PUBLIC_RTB_REVIEW_RUNTIME: "staging",
    };
    return applyRtbM365ServerEnv(childEnv, processEnv, parsedFileEnv);
  }

  it("propagates the three server-only M365 keys from fileEnv", () => {
    const childEnv = stagingChildEnv({});
    expect(childEnv.RTB_M365_APPLICATION_ID).toBe(fileEnv.RTB_M365_APPLICATION_ID);
    expect(childEnv.RTB_M365_CREDENTIAL_SECRET_ID).toBe(fileEnv.RTB_M365_CREDENTIAL_SECRET_ID);
    expect(childEnv.RTB_M365_CLIENT_SECRET).toBe(fakeSecret);
    expect(RTB_M365_SERVER_ENV_KEYS).toEqual([
      "RTB_M365_APPLICATION_ID",
      "RTB_M365_CREDENTIAL_SECRET_ID",
      "RTB_M365_CLIENT_SECRET",
    ]);
  });

  it("leaves missing M365 keys unset and does not fabricate or broadly copy fileEnv", () => {
    const childEnv = stagingChildEnv({}, {});
    expect(childEnv.RTB_M365_APPLICATION_ID).toBeUndefined();
    expect(childEnv.RTB_M365_CREDENTIAL_SECRET_ID).toBeUndefined();
    expect(childEnv.RTB_M365_CLIENT_SECRET).toBeUndefined();
    const partial = stagingChildEnv({}, { RTB_M365_APPLICATION_ID: "app-only", UNRELATED_FILE_KEY: "x" });
    expect(partial.RTB_M365_APPLICATION_ID).toBe("app-only");
    expect(partial.RTB_M365_CREDENTIAL_SECRET_ID).toBeUndefined();
    expect(partial.RTB_M365_CLIENT_SECRET).toBeUndefined();
    expect(partial.UNRELATED_FILE_KEY).toBeUndefined();
  });

  it("prefers process.env over fileEnv and does not log the fake client secret", () => {
    const logs: string[] = [];
    const spyLog = vi.spyOn(console, "log").mockImplementation((...args) => {
      logs.push(args.map(String).join(" "));
    });
    const spyInfo = vi.spyOn(console, "info").mockImplementation((...args) => {
      logs.push(args.map(String).join(" "));
    });
    const spyWarn = vi.spyOn(console, "warn").mockImplementation((...args) => {
      logs.push(args.map(String).join(" "));
    });
    const spyError = vi.spyOn(console, "error").mockImplementation((...args) => {
      logs.push(args.map(String).join(" "));
    });
    try {
      const childEnv = stagingChildEnv({
        RTB_M365_APPLICATION_ID: "process-app-id",
        RTB_M365_CLIENT_SECRET: "process-fake-secret",
      });
      expect(childEnv.RTB_M365_APPLICATION_ID).toBe("process-app-id");
      expect(childEnv.RTB_M365_CLIENT_SECRET).toBe("process-fake-secret");
      expect(childEnv.RTB_M365_CREDENTIAL_SECRET_ID).toBe(fileEnv.RTB_M365_CREDENTIAL_SECRET_ID);
      expect(logs.join("\n")).not.toContain(fakeSecret);
      expect(logs.join("\n")).not.toContain("process-fake-secret");
    } finally {
      spyLog.mockRestore();
      spyInfo.mockRestore();
      spyWarn.mockRestore();
      spyError.mockRestore();
    }
  });

  it("does not expose M365 secrets as NEXT_PUBLIC and keeps Supabase/runtime child env", () => {
    const childEnv = stagingChildEnv({});
    expect(childEnv.NEXT_PUBLIC_RTB_M365_CLIENT_SECRET).toBeUndefined();
    expect(childEnv.NEXT_PUBLIC_RTB_M365_APPLICATION_ID).toBeUndefined();
    expect(childEnv.NEXT_PUBLIC_RTB_M365_CREDENTIAL_SECRET_ID).toBeUndefined();
    expect(childEnv.RTB_REVIEW_RUNTIME).toBe("staging");
    expect(childEnv.NEXT_PUBLIC_RTB_REVIEW_RUNTIME).toBe("staging");
    expect(childEnv.SUPABASE_PROJECT_REF).toBe("rntonzigxwxcjlcsadip");
    expect(childEnv.NEXT_PUBLIC_SUPABASE_URL).toBe("https://rntonzigxwxcjlcsadip.supabase.co");
    const script = readFileSync(resolve(REPO_ROOT, "scripts/review-staging.mjs"), "utf8");
    const helper = readFileSync(resolve(REPO_ROOT, "scripts/review-staging-m365-env.mjs"), "utf8");
    const nextConfig = readApp("next.config.ts");
    expect(script).toContain("applyRtbM365ServerEnv(childEnv, process.env, fileEnv)");
    expect(script).toContain("NEXT_PUBLIC_SUPABASE_URL: url");
    expect(script).toContain('RTB_REVIEW_RUNTIME: "staging"');
    expect(script).not.toContain("NEXT_PUBLIC_RTB_M365");
    expect(script).not.toMatch(/Object\.assign\(\s*childEnv\s*,\s*fileEnv/);
    expect(helper).not.toContain("console.log");
    expect(helper).not.toContain("NEXT_PUBLIC_");
    expect(nextConfig).not.toContain("RTB_M365_CLIENT_SECRET");
    expect(nextConfig).not.toMatch(/NEXT_PUBLIC_RTB_M365/);
  });
});

