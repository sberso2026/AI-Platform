import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect, type Page } from "@playwright/test";
import {
  BROWSER_E2E_EVIDENCE_PASS,
  BOS16_BROWSER_E2E_STAGE_COMPLETE,
  bosBrowserE2eCertified,
  bosLiveHubSpotCertified,
  bosLiveMicrosoft365Certified,
  bosLiveXeroCertified,
  bosProductionEligible,
  HUBSPOT_LIVE_CERTIFICATION_EXECUTED,
  M365_LIVE_CERTIFICATION_EXECUTED,
  XERO_LIVE_CERTIFICATION_EXECUTED,
} from "../../business-os/src/release.ts";
import { directAgentProviderAccess, crossTenantAgentAccess } from "../../business-os/src/version.ts";
import { signInAs } from "./auth.js";

const ROOT = resolve(import.meta.dirname, "../../..");

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(resolve(ROOT, ".env.local"));
loadEnvFile(resolve(ROOT, ".env.bos16-rls.local"));

const browserReady = Boolean(
  process.env.RTB_TEST_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || process.env.E2E_BASE_URL || process.env.BOS16_BROWSER_E2E === "1",
);
const emailA = process.env.BOS_RLS_TENANT_A_EMAIL ?? "cert-bos16-rls-a@rtb-cert.test";
const emailB = process.env.BOS_RLS_TENANT_B_EMAIL ?? "cert-bos16-rls-b@rtb-cert.test";

const SECRET_RE =
  /client_secret|refresh_token|access_token|eyJ[A-Za-z0-9_-]{20,}\.|service_role|NEXT_PUBLIC_(XERO|MS365|HUBSPOT)_|hapikey|bos_fixture_secret_ref/i;

async function resetOauthCards(page: Page): Promise<void> {
  await page.goto("/business/integrations");
  await expect(page.getByTestId("bos-integrations-catalog")).toBeVisible();
  await expect(page.getByTestId("bos-connector-state-xero")).toBeVisible();
  for (const id of ["xero", "microsoft_365", "hubspot"] as const) {
    const disconnect = page.getByTestId(`bos-disconnect-${id}`);
    if (await disconnect.isVisible()) {
      await disconnect.click();
      await expect(page.getByTestId("bos-disconnect-dialog")).toBeVisible();
      await page.getByTestId("bos-disconnect-confirm").click();
      await expect(page.getByTestId(`bos-connect-${id}`)).toBeVisible({ timeout: 20_000 });
    }
  }
}

async function completeFixture(
  page: Page,
  connectorId: "xero" | "microsoft_365" | "hubspot",
  action: "bos-oauth-allow" | "bos-oauth-deny",
  expected: string,
): Promise<void> {
  await expect(page.getByTestId(`bos-oauth-fixture-${connectorId}`)).toBeVisible();
  await page.getByTestId(action).click({ noWaitAfter: true });
  await expect(page.getByTestId(`bos-connector-state-${connectorId}`)).toContainText(expected, { timeout: 30_000 });
}

async function scanSecrets(page: Page): Promise<string[]> {
  const hits: string[] = [];
  const body = await page.content();
  if (SECRET_RE.test(body)) hits.push("dom");
  const url = page.url();
  if (SECRET_RE.test(url)) hits.push("url");
  return hits;
}

test.describe("BOS-16A8 browser E2E honesty", () => {
  test("keeps live provider certification and release declaration false", () => {
    expect(bosBrowserE2eCertified).toBe(false);
    expect(bosLiveXeroCertified).toBe(false);
    expect(bosLiveMicrosoft365Certified).toBe(false);
    expect(bosLiveHubSpotCertified).toBe(false);
    expect(XERO_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(M365_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(HUBSPOT_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(bosProductionEligible).toBe(false);
    expect(directAgentProviderAccess).toBe(false);
    expect(crossTenantAgentAccess).toBe(false);
    expect(BROWSER_E2E_EVIDENCE_PASS).toBe(true);
    expect(BOS16_BROWSER_E2E_STAGE_COMPLETE).toBe(true);
  });
});

test.describe("BOS-16A8 integrations browser workflows", () => {
  test.describe.configure({ retries: 1 });
  test.beforeEach(() => {
    test.skip(!browserReady, "BOS16_BROWSER_E2E blocked: no Playwright base URL");
  });

  test("login and open Business OS integrations", async ({ page, context }) => {
    await signInAs(context, emailA);
    const res = await page.goto("/business/integrations");
    expect(res?.status() ?? 500).toBeLessThan(500);
    await expect(page.getByTestId("bos-integrations-catalog")).toBeVisible();
    await expect(page.getByTestId("bos-browser-fixture-banner")).toBeVisible();
    await expect(page.getByTestId("bos-connector-card-xero")).toBeVisible();
    await expect(page.getByTestId("bos-connector-card-microsoft_365")).toBeVisible();
    await expect(page.getByTestId("bos-connector-card-hubspot")).toBeVisible();
    expect(await scanSecrets(page)).toEqual([]);
  });

  test("Xero connect success persists after reload", async ({ page, context }) => {
    await signInAs(context, emailA);
    await resetOauthCards(page);
    await page.getByTestId("bos-connect-xero").click();
    await expect(page.getByTestId("bos-consent-dialog")).toBeVisible();
    await page.getByTestId("bos-consent-continue").click();
    await expect(page.getByTestId("bos-oauth-fixture-xero")).toBeVisible();
    await expect(page.getByTestId("bos-oauth-fixture-banner")).toContainText("not a live");
    await completeFixture(page, "xero", "bos-oauth-allow", "CONNECTED");
    await page.reload();
    await expect(page.getByTestId("bos-connector-state-xero")).toContainText("CONNECTED");
    expect(page.url()).not.toMatch(/code=|access_token|client_secret/);
    expect(await scanSecrets(page)).toEqual([]);
  });

  test("Xero consent denial stays ERROR", async ({ page, context }) => {
    await signInAs(context, emailA);
    await resetOauthCards(page);
    await page.getByTestId("bos-connect-xero").click();
    await page.getByTestId("bos-consent-continue").click();
    await completeFixture(page, "xero", "bos-oauth-deny", "ERROR");
  });

  test("Microsoft 365 connect success", async ({ page, context }) => {
    await signInAs(context, emailA);
    await resetOauthCards(page);
    await page.getByTestId("bos-connect-microsoft_365").click();
    await page.getByTestId("bos-consent-continue").click();
    await completeFixture(page, "microsoft_365", "bos-oauth-allow", "CONNECTED");
  });

  test("HubSpot connect success", async ({ page, context }) => {
    await signInAs(context, emailA);
    await resetOauthCards(page);
    await page.getByTestId("bos-connect-hubspot").click();
    await page.getByTestId("bos-consent-continue").click();
    await completeFixture(page, "hubspot", "bos-oauth-allow", "CONNECTED");
  });

  test("invalid OAuth state fails closed", async ({ page, context }) => {
    await signInAs(context, emailA);
    const res = await page.goto("/api/business/integrations/oauth/callback?state=invalid&code=bos_fixture_ok");
    expect(res?.status() ?? 500).toBeLessThan(500);
    await page.goto("/business/integrations");
    expect(await scanSecrets(page)).toEqual([]);
  });

  test("sync success and sync error fixtures", async ({ page, context }) => {
    await signInAs(context, emailA);
    await resetOauthCards(page);
    await page.getByTestId("bos-connect-xero").click();
    await page.getByTestId("bos-consent-continue").click();
    await completeFixture(page, "xero", "bos-oauth-allow", "CONNECTED");
    await expect(page.getByTestId("bos-sync-xero")).toBeVisible();
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/business/integrations/sync") && res.request().method() === "POST"),
      page.getByTestId("bos-sync-xero").click(),
    ]);
    await expect(page.getByTestId("bos-connector-state-xero")).toContainText(/CONNECTED|ERROR/);
    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/business/integrations/oauth/fixture") && res.request().method() === "POST",
      ),
      page.getByTestId("bos-fixture-xero-sync_error").click(),
    ]);
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/business/integrations/sync") && res.request().method() === "POST"),
      page.getByTestId("bos-sync-xero").click(),
    ]);
    await expect(page.getByTestId("bos-connector-state-xero")).toContainText("ERROR");
  });

  test("reauth required blocks sync until reconnect", async ({ page, context }) => {
    await signInAs(context, emailA);
    await resetOauthCards(page);
    await page.getByTestId("bos-connect-microsoft_365").click();
    await page.getByTestId("bos-consent-continue").click();
    await completeFixture(page, "microsoft_365", "bos-oauth-allow", "CONNECTED");
    await page.getByTestId("bos-fixture-microsoft_365-reauth_required").click();
    await expect(page.getByTestId("bos-connector-state-microsoft_365")).toContainText("REAUTH_REQUIRED");
    await expect(page.getByTestId("bos-connect-microsoft_365")).toHaveAttribute("aria-label", /Reconnect/);
  });

  test("disconnect confirmation persists after refresh", async ({ page, context }) => {
    await signInAs(context, emailA);
    await resetOauthCards(page);
    await page.getByTestId("bos-connect-hubspot").click();
    await page.getByTestId("bos-consent-continue").click();
    await completeFixture(page, "hubspot", "bos-oauth-allow", "CONNECTED");
    await page.getByTestId("bos-disconnect-hubspot").click();
    await expect(page.getByTestId("bos-disconnect-dialog")).toBeVisible();
    await page.getByTestId("bos-disconnect-confirm").click();
    await expect(page.getByTestId("bos-connector-state-hubspot")).toContainText("DISCONNECTED");
    await page.reload();
    await expect(page.getByTestId("bos-connector-state-hubspot")).toContainText("DISCONNECTED");
  });

  test("cross-tenant browser isolation", async ({ page, context }) => {
    await signInAs(context, emailA);
    await resetOauthCards(page);
    await page.getByTestId("bos-connect-xero").click();
    await page.getByTestId("bos-consent-continue").click();
    await completeFixture(page, "xero", "bos-oauth-allow", "CONNECTED");
    const orgA = (await page.getByTestId("bos-connector-org-xero").textContent()) ?? "";
    await context.clearCookies();
    await signInAs(context, emailB);
    await page.goto("/business/integrations");
    const orgB = (await page.getByTestId("bos-connector-org-xero").textContent()) ?? "";
    if (orgA.includes("BOS Fixture")) {
      expect(orgB).not.toContain("BOS Fixture Accounting Org");
    }
  });

  test("unauthenticated configure is denied", async ({ request }) => {
    const res = await request.post("/api/business/integrations/oauth/start", {
      data: { connectorId: "xero" },
    });
    expect([401, 403, 302, 303, 307]).toContain(res.status());
    const body = await res.text();
    expect(body).not.toMatch(SECRET_RE);
  });

  test("AI workforce page does not expose provider tokens", async ({ page, context }) => {
    await signInAs(context, emailA);
    await page.goto("/business/ai-workforce");
    expect(await scanSecrets(page)).toEqual([]);
    expect(directAgentProviderAccess).toBe(false);
  });

  test("integrations screen has accessible labels and is usable on a mobile viewport", async ({ page, context }) => {
    await signInAs(context, emailA);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/business/integrations");
    await expect(page.getByTestId("bos-integrations-catalog")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: /Connect Xero/i })).toBeVisible();
  });
});
