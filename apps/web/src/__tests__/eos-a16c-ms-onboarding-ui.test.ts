import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const page = readFileSync(resolve(__dirname, "../app/(platform)/engineering/settings/integrations/page.tsx"), "utf8");
const start = readFileSync(resolve(__dirname, "../app/api/engineering/m365/oauth/start/route.ts"), "utf8");
const route = readFileSync(resolve(__dirname, "../app/api/engineering/work/route.ts"), "utf8");

describe("EOS-A16C Microsoft onboarding UX", () => {
  it("offers Connect Microsoft 365 without asking for Graph internals", () => {
    expect(page).toContain("Connect Microsoft 365");
    expect(page).toContain("Microsoft 365 / SharePoint");
    expect(page).toContain("Read only");
    expect(page).toContain("Use RTB Managed Repository");
    expect(page).toContain("Approved SharePoint site");
    expect(page).not.toContain("Microsoft tenant id");
    expect(page).not.toContain("Application id");
    expect(page).not.toContain("Credential secret reference");
    expect(page).not.toContain("SharePoint site id");
    expect(page).not.toContain("Library / drive id");
    expect(page).not.toContain("graph.microsoft.com");
    expect(page).not.toContain("accessToken");
  });

  it("starts Microsoft sign-in through the trusted OAuth route", () => {
    expect(page).toContain("/api/engineering/m365/oauth/start");
    expect(start).toContain("buildMicrosoftAuthorizeUrl");
    expect(start).toContain("buildMicrosoftAdminConsentUrl");
    expect(route).toContain("m365Onboarding");
    expect(route).toContain("resolveSharePointSite");
    expect(route).toContain("use_microsoft_sign_in");
  });
});
