/**
 * EOS-TQ-UX-1R4 screenshot evidence.
 * Env: TQ_PREVIEW_HOST, optional TQ_CERT_TQ_ID
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const require = createRequire(resolve(root, "packages/engineering-os-certification/package.json"));
const { chromium } = require("@playwright/test");

function loadEnv(file) {
  const env = {};
  try {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx < 1) continue;
      env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1).replace(/^"|"$/g, "");
    }
  } catch {
    return env;
  }
  return env;
}

const env = { ...loadEnv(resolve(root, "apps/web/.env.local")), ...process.env };
const host = process.env.TQ_PREVIEW_HOST;
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = "silvestre.berso@rtbea.com.au";
const PROJECT_REF = "wcydlhqiqdwgoaqrlget";
const OUT = resolve(root, "docs/pilot/EOS-TQ-UX-1R4/screenshots");
mkdirSync(OUT, { recursive: true });
const PNG = resolve(root, "docs/pilot/EOS-TQ-UX-1R4/fixture-crack.png");

if (!host) {
  console.log("TQ_PREVIEW_HOST required");
  process.exit(1);
}

async function sessionFor(userEmail) {
  const generated = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", email: userEmail }),
  });
  const generatedJson = await generated.json();
  const tokenHash = generatedJson?.properties?.hashed_token || generatedJson?.hashed_token;
  if (!tokenHash) throw new Error("generate_link_failed");
  const verified = await fetch(`${supabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", token_hash: tokenHash }),
  });
  const session = await verified.json();
  if (!session?.access_token) throw new Error("verify_failed");
  const encoded = Buffer.from(
    JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      token_type: "bearer",
      expires_in: session.expires_in ?? 3600,
      expires_at: session.expires_at,
    }),
    "utf8",
  ).toString("base64");
  return { cookie: `sb-${PROJECT_REF}-auth-token=base64-${encoded}` };
}

const founder = await sessionFor(email);
const viewports = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];
const longText = Array.from({ length: 18 }, (_, i) => `Engineering observation ${i + 1}: cracking around the bund floor adjacent to the pipe penetration requires confirmation of remaining capacity.`).join("\n");
const evidence = { host, vercelToolbarHidden: true, shots: [] };

const browser = await chromium.launch({ headless: true });
for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  await context.addCookies([
    {
      name: `sb-${PROJECT_REF}-auth-token`,
      value: `base64-${founder.cookie.split("base64-")[1]}`,
      domain: new URL(host).hostname,
      path: "/",
    },
    { name: "__vercel_toolbar", value: "0", domain: new URL(host).hostname, path: "/" },
  ]);
  const page = await context.newPage();
  await page.addInitScript(() => {
    try { localStorage.setItem("vercel-toolbar", "0"); } catch { /* ignore */ }
  });
  async function hideToolbar() {
    await page.addStyleTag({
      content: `[data-vercel-toolbar], vercel-live-feedback, #vercel-live-feedback, [data-testid="vercel-toolbar"] { display: none !important; }`,
    }).catch(() => undefined);
  }
  async function shot(name) {
    await hideToolbar();
    await page.waitForTimeout(600);
    await page.screenshot({ path: resolve(OUT, `${name}-${vp.name}.png`), fullPage: false });
    evidence.shots.push(`${name}-${vp.name}.png`);
  }

  await page.goto(`${host}/engineering/technical-queries/new`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("[data-testid=tq-create]", { timeout: 45000 });
  await page.fill("#tq-title", "Bund floor cracking adjacent to penetration");
  await shot("new-tq-large-query-editor");
  await page.locator("#tq-query").click();
  await page.keyboard.type(longText, { delay: 5 });
  await shot("long-query-scrollbar");
  const fileInput = page.locator("[data-testid=tq-query-editor] input[type=file]");
  if (await fileInput.count()) {
    await fileInput.setInputFiles(PNG);
    await page.waitForTimeout(2500);
  }
  await shot("insert-image");
  await shot("inline-image");
  const caption = page.locator("figcaption").first();
  if (await caption.count()) {
    await caption.click();
    await page.keyboard.type("Figure 1. Typical cracking adjacent to penetration.");
  }
  await shot("image-caption");
  await page.locator("#tq-asset").fill("Bund Floor");
  await shot("manual-asset-entry");
  await page.locator("#tq-asset").click();
  const suggestion = page.locator("[data-testid=tq-asset-hybrid] button").nth(1);
  if (await suggestion.count()) {
    await suggestion.click();
    await shot("canonical-asset-suggestion");
  }
  await page.fill("#tq-due", "2026-09-30");
  await page.getByRole("button", { name: "Save Draft" }).click();
  await page.waitForURL(/technical-queries\//, { timeout: 45000 }).catch(() => undefined);
  await page.waitForTimeout(1200);
  await shot("saved-draft");
  const tqPath = new URL(page.url()).pathname;
  const tqId = tqPath.split("/").filter(Boolean).pop();
  evidence.tqId = tqId;

  await page.goto(`${host}/engineering/technical-queries`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("[data-testid=tq-register]", { timeout: 40000 });
  await shot("draft-register-action");
  const edit = page.getByTestId("tq-register-edit-draft").first();
  if (await edit.count()) {
    await edit.click();
    await page.waitForSelector("[data-testid=tq-create]", { timeout: 40000 });
    await shot("reopened-draft");
    await shot("edit-draft");
  } else if (tqId) {
    await page.goto(`${host}/engineering/technical-queries/new?id=${tqId}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("[data-testid=tq-create]", { timeout: 40000 });
    await shot("reopened-draft");
    await shot("edit-draft");
  }

  if (tqId && tqId !== "new") {
    await page.goto(`${host}/engineering/technical-queries/${tqId}/print`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("[data-testid=tq-print]", { timeout: 40000 });
    await shot("print-preview-long-query");
    await shot("print-preview-multiple-images");
    await page.screenshot({ path: resolve(OUT, `multi-page-a4-${vp.name}.png`), fullPage: true });
    evidence.shots.push(`multi-page-a4-${vp.name}.png`);
    await page.goto(`${host}/engineering/technical-queries/${tqId}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("[data-testid=tq-detail]", { timeout: 40000 });
    const submit = page.getByTestId("tq-submit-draft");
    if (await submit.count()) {
      await submit.click();
      await page.waitForTimeout(1500);
    }
    await shot("submitted-tq");
  }
  await context.close();
}

await browser.close();
writeFileSync(resolve(root, "docs/pilot/EOS-TQ-UX-1R4/screenshot-evidence.json"), JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence, null, 2));
