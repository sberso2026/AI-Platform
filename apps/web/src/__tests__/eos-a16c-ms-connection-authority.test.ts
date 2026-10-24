import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hasEngineeringAdminAuthority } from "../lib/commerce/engineering-admin-authority";
import { engineeringApiRequiresIdentityAssurance } from "../lib/commerce/engineering-identity-assurance";

const start = readFileSync(resolve(__dirname, "../app/api/engineering/m365/oauth/start/route.ts"), "utf8");
const callback = readFileSync(resolve(__dirname, "../app/api/engineering/m365/oauth/callback/route.ts"), "utf8");
const api = readFileSync(resolve(__dirname, "../lib/commerce/engineering-api.ts"), "utf8");
const page = readFileSync(resolve(__dirname, "../app/(platform)/engineering/settings/integrations/page.tsx"), "utf8");
const store = readFileSync(resolve(__dirname, "../../../../packages/engineering-os/src/connectors/m365/supabase-store.ts"), "utf8");

describe("EOS-A16C Microsoft connection authority alignment", () => {
  it("keeps Connect Microsoft 365 unavailable unless engineering admin and AAL2", () => {
    expect(hasEngineeringAdminAuthority({
      roleSlug: "engineer",
      permissions: [{ resource: "engineering", action: "execute" }, { resource: "engineering", action: "read" }],
    })).toBe(false);
    expect(hasEngineeringAdminAuthority({ roleSlug: "admin", permissions: [] })).toBe(true);
    expect(page).toContain("canConnectMicrosoft = canAdministerEngineering && assurance.aal === \"aal2\"");
    expect(page).toContain("disabled={!canConnectMicrosoft}");
    expect(page).toContain('disabled={!canConnectMicrosoft} onClick={() => void post("indexSharePointRepository"');
    expect(start).toContain("microsoftConnectionOAuthDenial");
    expect(callback).toContain("microsoftConnectionOAuthDenial");
    expect(api).toContain('denyIfEngineeringIdentityInsufficient(ctx, "settings", "POST")');
    expect(engineeringApiRequiresIdentityAssurance("settings", "POST")).toBe(true);
  });

  it("does not use a service-role bypass on OAuth start, callback, or connection upsert", () => {
    expect(start).not.toMatch(/createServiceClient|SERVICE_ROLE/);
    expect(callback).not.toMatch(/createServiceClient|SERVICE_ROLE/);
    expect(store).not.toMatch(/createServiceClient|SERVICE_ROLE|bypassRls/);
    expect(store).toContain(".upsert(");
    expect(callback).not.toContain("NEXT_PUBLIC_");
    expect(start).not.toContain("NEXT_PUBLIC_");
  });
});
