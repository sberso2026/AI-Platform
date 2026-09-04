/**
 * EOS-SHELL-JARVIS-3 founder screenshot evidence.
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
const OUT = resolve(root, "docs/pilot/EOS-SHELL-JARVIS-3/screenshots");
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
console.log("founder_session_ok");
const viewports = [
  { name: "1366", width: 1366, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

const allRoutes = [
  { id: "01-command-centre", path: "/engineering" },
  { id: "02-engineering-systems", path: "/engineering/modules" },
  { id: "03-projects", path: "/engineering/projects" },
  { id: "04-assets", path: "/engineering/assets" },
  { id: "05-inspections", path: "/engineering/inspections" },
  { id: "06-documents", path: "/engineering/documents" },
  { id: "07-technical-queries", path: "/engineering/technical-queries" },
  { id: "08-project-intelligence", path: "/engineering/apps/project-intelligence" },
  { id: "09-asset-intelligence", path: "/engineering/apps/asset-intelligence" },
  { id: "10-digital-twin", path: "/engineering/apps/digital-twin" },
  { id: "11-engineering-models", path: "/engineering/apps/model-interoperability" },
  { id: "12-project-controls", path: "/engineering/apps/project-controls" },
];

const only = (process.env.EOS_SHOT_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);
const routes = only.length ? allRoutes.filter((route) => only.includes(route.id)) : allRoutes;

const jargonRe =
  /\b(ENGINEERING_MODULE_OPERATIONAL_CERTIFICATION_PASS|COMMERCE_APPLICATION_PROVISIONING_PASS|EOS_JARVIS_SHELL_CERTIFIED|migration lineage|application_key|entitledApplicationKeys)\b/i;
const internalIdRe = /\b(c1000000|asset_intelligence|digital_twin|engineering_model_interoperability|project_intelligence|project_controls)\b/;
const uuidRe = /[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

const evidence = {
  host,
  shots: [],
  uuidHits: [],
  internalHits: [],
  jargonHits: [],
  lightShell: [],
  notes: [],
};

function luminance(rgb) {
  const m = String(rgb).match(/\d+/g);
  if (!m || m.length < 3) return 0;
  const [r, g, b] = m.map(Number);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

async function settle(page, route) {
  console.log(`goto ${route.id} ${route.path}`);
  await page.goto(`${host}${route.path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.getByTestId("app-sidebar").waitFor({ timeout: 20000 }).catch(() => undefined);
  await page.getByTestId("app-header").waitFor({ timeout: 20000 }).catch(() => undefined);
  if (route.id === "01-command-centre") {
    await page.getByTestId("cc-project-health").waitFor({ timeout: 20000 }).catch(() => undefined);
  }
  if (route.id === "02-engineering-systems") {
    await page
      .locator("[data-testid=engineering-module-asset_intelligence]")
      .getByText("Installed")
      .waitFor({ timeout: 20000 })
      .catch(() => undefined);
  }
  if (route.id === "09-asset-intelligence") {
    await page.getByTestId("ai-asset-count").waitFor({ timeout: 20000 }).catch(() => undefined);
  }
  if (route.id === "10-digital-twin") {
    await Promise.race([
      page.getByTestId("dt-empty-twins").waitFor({ timeout: 20000 }).catch(() => undefined),
      page.getByTestId("dt-identity-card").waitFor({ timeout: 20000 }).catch(() => undefined),
    ]).catch(() => undefined);
  }
  if (route.id === "11-engineering-models") {
    await page.getByTestId("emi-model-count").waitFor({ timeout: 20000 }).catch(() => undefined);
  }
  if (route.id === "12-project-controls") {
    await page.getByTestId("project-controls-ready").waitFor({ timeout: 20000 }).catch(() => undefined);
  }
  await page.waitForTimeout(1500);
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
      localStorage.setItem("theme", "dark");
      sessionStorage.setItem("rtb.engineering.selectedProjectId", projectId);
    } catch {
      /* ignore */
    }
  }, PILOT_PROJECT_ID);

  for (const route of routes) {
    await settle(page, route);
    const shellTheme = await page.locator("[data-eos-theme=enterprise-dark]").count();
    const colors = await page.evaluate(() => {
      const shell = document.querySelector("[data-testid=platform-shell]");
      const main = document.querySelector("[data-testid=page-main], main, [data-testid=engineering-os-v1-ready], [data-testid=engineering-module-launcher]");
      return {
        htmlClass: document.documentElement.className,
        shellBg: shell ? getComputedStyle(shell).backgroundColor : "",
        mainBg: main ? getComputedStyle(main).backgroundColor : "",
        colorScheme: getComputedStyle(document.documentElement).colorScheme,
      };
    });
    const light =
      shellTheme === 0 ||
      luminance(colors.shellBg) > 0.55 ||
      luminance(colors.mainBg) > 0.55 ||
      /\blight\b/.test(colors.htmlClass);
    if (light) {
      evidence.lightShell.push({ shot: `${route.id}-${vp.name}`, colors, shellTheme });
    }

    const body = await page
      .locator("[data-testid=page-main], main, [data-testid=engineering-module-launcher], [data-testid=engineering-os-v1-ready]")
      .first()
      .innerText()
      .catch(() => "");
    const sidebar = await page.locator("[data-testid=app-sidebar]").innerText().catch(() => "");
    const header = await page.locator("[data-testid=app-header]").innerText().catch(() => "");
    const visible = `${sidebar}\n${header}\n${body}`;
    const uuidHits = [...visible.matchAll(new RegExp(uuidRe, "gi"))].map((m) => m[0]);
    const internalHits = [...visible.matchAll(new RegExp(internalIdRe, "gi"))].map((m) => m[0]);
    const jargonHits = [...visible.matchAll(new RegExp(jargonRe, "gi"))].map((m) => m[0]);
    if (uuidHits.length) evidence.uuidHits.push({ shot: `${route.id}-${vp.name}`, count: uuidHits.length, samples: uuidHits.slice(0, 5) });
    if (internalHits.length) evidence.internalHits.push({ shot: `${route.id}-${vp.name}`, samples: internalHits.slice(0, 5) });
    if (jargonHits.length) evidence.jargonHits.push({ shot: `${route.id}-${vp.name}`, samples: jargonHits.slice(0, 5) });
    if (vp.name === "1920") {
      evidence.notes.push({
        shot: route.id,
        excerpt: body.slice(0, 700),
        hasJarvisTheme: shellTheme > 0,
        hasEngineeringOs: /Engineering OS/.test(visible),
        hasProjectHealth: /Project Health/.test(body),
        hasIntelligenceCore: /Engineering Intelligence Core|ENGINEERING AI/.test(visible),
      });
    }
    const file = `${route.id}-${vp.name}.png`;
    await page.screenshot({ path: resolve(OUT, file), fullPage: false });
    evidence.shots.push(file);
  }
  await context.close();
}

await browser.close();
const evidencePath = resolve(root, "docs/pilot/EOS-SHELL-JARVIS-3/screenshot-evidence.json");
if (only.length) {
  try {
    const prev = JSON.parse(readFileSync(evidencePath, "utf8"));
    const shotSet = new Set([...(prev.shots ?? []), ...evidence.shots]);
    prev.shots = [...shotSet];
    prev.uuidHits = (prev.uuidHits ?? []).filter((hit) => !only.some((id) => String(hit.shot).startsWith(id)));
    prev.uuidHits.push(...evidence.uuidHits);
    prev.lightShell = (prev.lightShell ?? []).filter((hit) => !only.some((id) => String(hit.shot).startsWith(id)));
    prev.lightShell.push(...evidence.lightShell);
    prev.notes = (prev.notes ?? []).filter((note) => !only.includes(note.shot));
    prev.notes.push(...evidence.notes);
    writeFileSync(evidencePath, JSON.stringify(prev, null, 2));
  } catch {
    writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
  }
} else {
  writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
}
console.log(
  JSON.stringify(
    {
      shots: evidence.shots.length,
      uuidHits: evidence.uuidHits.length,
      internalHits: evidence.internalHits.length,
      jargonHits: evidence.jargonHits.length,
      lightShell: evidence.lightShell.length,
    },
    null,
    2,
  ),
);
