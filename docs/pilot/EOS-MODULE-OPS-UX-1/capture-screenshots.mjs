/**
 * EOS-MODULE-OPS-UX-1R founder screenshot evidence.
 * Env: EOS_PREVIEW_HOST
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
const host = process.env.EOS_PREVIEW_HOST;
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = "silvestre.berso@rtbea.com.au";
const PROJECT_REF = "wcydlhqiqdwgoaqrlget";
const PILOT_PROJECT_ID = "80652532-932e-464d-803b-9876df705bda";
const COL01_ASSET_ID = "2f98ad61-210c-409a-8122-06c3e6c48389";
const KERNEL_TWIN_ID = "7b468a8e-4626-41fe-a412-b64f4e8617c0";
const OUT = resolve(root, "docs/pilot/EOS-MODULE-OPS-UX-1/screenshots");
mkdirSync(OUT, { recursive: true });

if (!host) {
  console.log("EOS_PREVIEW_HOST required");
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
  { name: "1366", width: 1366, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

const routes = [
  { id: "01-engineering-systems", path: "/engineering/modules" },
  { id: "02-asset-intelligence-overview", path: "/engineering/apps/asset-intelligence" },
  { id: "03-asset-detail", path: `/engineering/apps/asset-intelligence/assets/${COL01_ASSET_ID}` },
  { id: "04-digital-twin-overview", path: "/engineering/apps/digital-twin" },
  { id: "05-twin-detail", path: `/engineering/apps/digital-twin/twins/${KERNEL_TWIN_ID}` },
  { id: "06-engineering-models", path: "/engineering/apps/model-interoperability" },
  { id: "07-model-detail", path: "/engineering/apps/model-interoperability/models" },
  { id: "08-project-controls-overview", path: "/engineering/apps/project-controls" },
  { id: "09-project-controls-schedule", path: "/engineering/apps/project-controls/schedule" },
  { id: "10-project-controls-cost", path: "/engineering/apps/project-controls/cost" },
  { id: "11-installed-products", path: "/system/products" },
];

const evidence = {
  host,
  shots: [],
  uuidHits: [],
  notes: [],
  access: null,
  open: {},
  commerce: {},
};

const uuidRe = /[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

async function waitFirst(page, locators, timeout = 45000) {
  await Promise.race(
    locators.map((locator) => locator.waitFor({ timeout }).catch(() => undefined)),
  ).catch(() => undefined);
}

async function settle(page, route) {
  await page.goto(`${host}${route.path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.getByText("Command Centre").first().waitFor({ timeout: 45000 }).catch(() => undefined);
  await page.getByText("Gold Coast").first().waitFor({ timeout: 20000 }).catch(() => undefined);
  if (route.id === "01-engineering-systems") {
    await page
      .locator("[data-testid=engineering-module-asset_intelligence]")
      .getByText("Installed")
      .waitFor({ timeout: 45000 })
      .catch(() => undefined);
  }
  if (route.id === "02-asset-intelligence-overview") {
    await page.getByTestId("ai-asset-count").waitFor({ timeout: 45000 }).catch(() => undefined);
  }
  if (route.id === "03-asset-detail") {
    await page.getByText("COL-01").first().waitFor({ timeout: 45000 }).catch(() => undefined);
  }
  if (route.id === "04-digital-twin-overview") {
    await waitFirst(page, [page.getByTestId("dt-empty-twins"), page.getByTestId("dt-identity-card")]);
  }
  if (route.id === "05-twin-detail") {
    await waitFirst(page, [
      page.getByTestId("digital-twin-detail"),
      page.getByTestId("dt-twins-empty"),
      page.getByText("No published state yet"),
    ]);
  }
  if (route.id === "06-engineering-models") {
    await page.getByTestId("emi-model-count").waitFor({ timeout: 45000 }).catch(() => undefined);
  }
  if (route.id === "07-model-detail") {
    await page.getByTestId("emi-models-empty").waitFor({ timeout: 45000 }).catch(() => undefined);
  }
  if (route.id === "08-project-controls-overview") {
    await page.getByTestId("project-controls-ready").waitFor({ timeout: 45000 }).catch(() => undefined);
    await page.getByText("Attention required").first().waitFor({ timeout: 20000 }).catch(() => undefined);
  }
  if (route.id === "09-project-controls-schedule") {
    await page.getByTestId("pc-schedule-page").waitFor({ timeout: 45000 }).catch(() => undefined);
  }
  if (route.id === "10-project-controls-cost") {
    await page.getByTestId("pc-cost-page").waitFor({ timeout: 20000 }).catch(() => undefined);
    await page.getByText("Cost").first().waitFor({ timeout: 20000 }).catch(() => undefined);
  }
  if (route.id === "11-installed-products") {
    await page.getByText("Loading…").waitFor({ state: "hidden", timeout: 45000 }).catch(() => undefined);
    await page.getByText("Engineering OS").first().waitFor({ timeout: 45000 }).catch(() => undefined);
  }
  await page.waitForTimeout(700);
}

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
  await page.addInitScript((projectId) => {
    try {
      localStorage.setItem("vercel-toolbar", "0");
      sessionStorage.setItem("rtb.engineering.selectedProjectId", projectId);
    } catch {
      /* ignore */
    }
  }, PILOT_PROJECT_ID);

  if (vp.name === "1920") {
    await page.goto(`${host}/engineering/modules`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.getByText("Command Centre").first().waitFor({ timeout: 45000 }).catch(() => undefined);
    await page
      .locator("[data-testid=engineering-module-asset_intelligence]")
      .getByText("Installed")
      .waitFor({ timeout: 45000 })
      .catch(() => undefined);
    evidence.access = await page.evaluate(async () => {
      const res = await fetch("/api/engineering/modules/access");
      return { status: res.status, body: await res.json().catch(() => null) };
    });
    for (const key of ["asset_intelligence", "digital_twin", "engineering_model_interoperability"]) {
      const card = page.locator(`[data-testid=engineering-module-${key}]`);
      const installed = await card.getByText("Installed").count();
      const href = await card.getAttribute("href");
      if (href) {
        await card.click();
        await page.waitForTimeout(1500);
        const url = page.url();
        evidence.open[key] = { href, url, installed: installed > 0 };
        await page.goto(`${host}/engineering/modules`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page
          .locator("[data-testid=engineering-module-asset_intelligence]")
          .getByText("Installed")
          .waitFor({ timeout: 45000 })
          .catch(() => undefined);
      } else {
        evidence.open[key] = { href: null, installed: installed > 0, linked: false };
      }
    }
  }

  for (const route of routes) {
    await settle(page, route);
    const body = await page
      .locator("[data-testid=page-main], main, [data-testid=engineering-module-launcher]")
      .first()
      .innerText()
      .catch(() => "");
    const sidebar = await page.locator("[data-testid=app-sidebar]").innerText().catch(() => "");
    const header = await page.locator("[data-testid=app-header]").innerText().catch(() => "");
    const visible = `${sidebar}\n${header}\n${body}`;
    const uuidHits = [...visible.matchAll(new RegExp(uuidRe, "gi"))].map((m) => m[0]);
    if (uuidHits.length) {
      evidence.uuidHits.push({ shot: `${route.id}-${vp.name}`, count: uuidHits.length, samples: uuidHits.slice(0, 5) });
    }
    if (vp.name === "1920") {
      evidence.notes.push({
        shot: route.id,
        excerpt: body.slice(0, 900),
        hasEngineeringOs: /Engineering OS/.test(visible),
        hasProductUuid: /c1000000/i.test(visible),
        hasInstalled: /Installed/.test(body),
        hasCol01: /COL-01/.test(body),
        hasTrialing: /Trialing/i.test(visible),
      });
    }
    const file = `${route.id}-${vp.name}.png`;
    await page.screenshot({ path: resolve(OUT, file), fullPage: false });
    evidence.shots.push(file);
  }
  await context.close();
}

await browser.close();
writeFileSync(resolve(root, "docs/pilot/EOS-MODULE-OPS-UX-1/screenshot-evidence.json"), JSON.stringify(evidence, null, 2));
console.log(
  JSON.stringify(
    {
      shots: evidence.shots.length,
      uuidHits: evidence.uuidHits.length,
      open: evidence.open,
      accessStatus: evidence.access?.status,
    },
    null,
    2,
  ),
);
