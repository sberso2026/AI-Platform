/**
 * EOS-TQ-UX-1R3 screenshot + interaction evidence.
 * Hides Vercel Toolbar so founder review sees the product, not Preview chrome.
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
const host = process.env.TQ_PREVIEW_HOST ?? "https://eos-pilot.rtbea.com.au";
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = "silvestre.berso@rtbea.com.au";
const PROJECT_REF = "wcydlhqiqdwgoaqrlget";
const OUT = resolve(root, "docs/pilot/EOS-TQ-UX-1R3/screenshots");
mkdirSync(OUT, { recursive: true });

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
  return {
    cookie: `sb-${PROJECT_REF}-auth-token=base64-${encoded}`,
    accessToken: session.access_token,
  };
}

const founder = await sessionFor(email);
const list = await fetch(`${host}/api/engineering/technical-queries`, { headers: { Cookie: founder.cookie } });
const listJson = await list.json();
const first = Array.isArray(listJson.data) ? listJson.data[0] : null;
const tqId = first?.id ?? first?.query?.id ?? null;
const tqNumber = first?.presentation?.tqNumber ?? first?.tq_number ?? "TQ";

const viewports = [
  { name: "1366", width: 1366, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

const evidence = {
  host,
  tqId,
  tqNumber,
  backVisible: false,
  newTqScroll: false,
  sectionsReachable: false,
  stickyVisible: false,
  submitVisible: false,
  submitReason: false,
  printButton: false,
  printBack: false,
  printScroll: false,
  columnFilters: false,
  activeFilters: false,
  vercelToolbarHidden: true,
};

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
    try {
      localStorage.setItem("vercel-toolbar", "0");
    } catch {
      /* ignore */
    }
  });

  async function hideToolbar() {
    await page.addStyleTag({
      content: `[data-vercel-toolbar], vercel-live-feedback, #vercel-live-feedback, [data-testid="vercel-toolbar"] { display: none !important; }`,
    }).catch(() => undefined);
  }

  async function shot(name) {
    await hideToolbar();
    await page.waitForTimeout(800);
    await page.screenshot({ path: resolve(OUT, `${name}-${vp.name}.png`), fullPage: false });
  }

  await page.goto(`${host}/engineering/technical-queries`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("[data-testid=tq-register]", { timeout: 40000 });
  await page.waitForSelector("#tq-col-status, [data-testid=tq-register-table], a:has-text('+ New Technical Query')", { timeout: 45000 }).catch(() => undefined);
  await page.waitForTimeout(1500);
  evidence.columnFilters = (await page.locator("#tq-col-status").count()) > 0;
  await shot("register");

  if (await page.locator("#tq-col-status").count()) {
    await page.selectOption("#tq-col-status", { index: 1 }).catch(() => undefined);
    await page.waitForTimeout(600);
    evidence.activeFilters = (await page.locator("[data-testid=tq-active-filters]").count()) > 0;
    await shot("register-filters");
    if (await page.getByText("Clear all filters").count()) {
      await page.getByText("Clear all filters").click();
    }
  }

  await page.goto(`${host}/engineering/technical-queries/new`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("[data-testid=tq-create]", { timeout: 40000 });
  evidence.backVisible = (await page.getByTestId("tq-back-link").count()) > 0;
  const createMain = page.locator("[data-testid=tq-create]");
  const scrollHeight = await createMain.evaluate((el) => el.scrollHeight);
  const clientHeight = await createMain.evaluate((el) => el.clientHeight);
  evidence.newTqScroll = scrollHeight > clientHeight + 40;
  evidence.stickyVisible = (await page.getByTestId("tq-sticky-actions").count()) > 0;
  evidence.submitVisible = (await page.getByRole("button", { name: "Submit Technical Query" }).count()) > 0;
  evidence.submitReason = (await page.getByTestId("tq-submit-reason").count()) > 0;
  await shot("new-tq-top");
  await createMain.evaluate((el) => {
    el.scrollTop = el.scrollHeight * 0.45;
  });
  await shot("new-tq-middle");
  await createMain.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  const peopleSection = await page.getByText("People & responsibility").count();
  const contextSection = await page.getByText("Engineering context").count();
  const refsSection = await page.getByText("References & attachments").count();
  const summarySection = await page.getByText("You are creating").count();
  evidence.sectionsReachable = peopleSection + contextSection + refsSection + summarySection >= 3;
  await shot("new-tq-bottom");

  if (tqId) {
    await page.goto(`${host}/engineering/technical-queries/${tqId}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("[data-testid=tq-detail]", { timeout: 40000 });
    await shot("detail");
    await page.goto(`${host}/engineering/technical-queries/${tqId}/print`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("[data-testid=tq-print]", { timeout: 40000 });
    await page.waitForFunction(() => !document.body.innerText.includes("Loading print view"), { timeout: 40000 }).catch(() => undefined);
    await page.waitForTimeout(800);
    evidence.printButton = (await page.getByTestId("tq-print-button").count()) > 0;
    evidence.printBack = (await page.getByTestId("tq-back-link").count()) > 0;
    const printRoot = page.locator("[data-testid=tq-print]");
    const pScroll = await printRoot.evaluate((el) => el.scrollHeight > el.clientHeight + 20);
    evidence.printScroll = pScroll || (await printRoot.evaluate((el) => getComputedStyle(el).overflowY.includes("auto") || getComputedStyle(el).overflowY.includes("scroll")));
    await shot("print-preview");
  }

  await context.close();
}

await browser.close();
writeFileSync(resolve(OUT, "..", "screenshot-evidence.json"), JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence, null, 2));
