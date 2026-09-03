import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

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

const env = { ...loadEnv(resolve("apps/web/.env.local")), ...process.env };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const host = "https://eos-pilot.rtbea.com.au";
const email = "silvestre.berso@rtbea.com.au";
const CONVEYOR = "008ff87c-ede6-4007-b94d-480ef54a77e0";
const ASNZS = "c1cc8331-8b39-4e5f-871b-b1d237e7101e";
const PROJECT_REF = "wcydlhqiqdwgoaqrlget";
const OUT = resolve("docs/pilot/EOS-AI-DOC-QA-1");

async function sessionCookie() {
  const generated = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", email }),
  });
  const generatedJson = await generated.json();
  const tokenHash = generatedJson?.properties?.hashed_token || generatedJson?.hashed_token;
  const verified = await fetch(`${supabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", token_hash: tokenHash }),
  });
  const session = await verified.json();
  const encoded = Buffer.from(JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: "bearer",
    expires_in: session.expires_in ?? 3600,
    expires_at: session.expires_at,
  }), "utf8").toString("base64");
  return `sb-${PROJECT_REF}-auth-token=base64-${encoded}`;
}

async function ask(cookie, query, documentId) {
  const started = Date.now();
  const response = await fetch(`${host}/api/engineering/ai`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: query,
      documentId,
      objectType: "document",
      objectId: documentId,
      scope: "document",
      agentSlug: "engineering-director",
    }),
  });
  const json = await response.json();
  const data = json?.data ?? json ?? {};
  const evidence = Array.isArray(data.evidence) ? data.evidence : [];
  const hay = `${data.message ?? ""}\n${evidence.map((row) => `${row.sectionPath ?? ""} ${row.pageStart ?? ""} ${row.excerpt ?? ""}`).join("\n")}`;
  return {
    query,
    documentId,
    http: response.status,
    ms: Date.now() - started,
    message: String(data.message ?? "").replace(/\s+/g, " ").slice(0, 500),
    generationFailed: Boolean(data.meta?.generationFailed),
    evidenceFallbackUsed: Boolean(data.meta?.evidenceFallbackUsed),
    generationProvider: data.meta?.generationProvider ?? null,
    retrievalMode: data.retrievalMode ?? data.meta?.retrievalMode ?? null,
    degraded: /could not generate an answer/i.test(String(data.message ?? "")),
    hay,
    evidence: evidence.slice(0, 3).map((row) => ({
      page: row.pageStart ?? null,
      section: row.sectionPath ?? null,
      excerpt: String(row.excerpt ?? "").replace(/\s+/g, " ").slice(0, 180),
    })),
  };
}

function pass(row, patterns) {
  return patterns.every((re) => re.test(row.hay) || re.test(row.message)) && !row.degraded;
}

mkdirSync(OUT, { recursive: true });
const cookie = await sessionCookie();
const cases = [
  { id: "guard", documentId: CONVEYOR, q: "what is the minimum sheet metal guard thickness", expect: [/1\.5\s*mm/i] },
  { id: "guard_perturbed", documentId: CONVEYOR, q: "in the design of sheet metal guard, what is the minimum sheet metal guard thickness?", expect: [/1\.5\s*mm/i] },
  { id: "platform", documentId: CONVEYOR, q: "What is the minimum platform width to access the conveyor?", expect: [/600\s*mm/i] },
  { id: "crossover", documentId: CONVEYOR, q: "What is the requirement for conveyor crossover?", expect: [/4\.2\.3|7\.2\.2/] },
  { id: "lanyard_a", documentId: CONVEYOR, q: "supports for lanyards or pull wires shall be provided at what maximum interval?", expect: [/4\.5\s*m/i] },
  { id: "lanyard_b", documentId: CONVEYOR, q: "what is the maximum interval for lanyard or pull wire support?", expect: [/4\.5\s*m/i] },
  { id: "lanyard_c", documentId: CONVEYOR, q: "How far apart can pull-wire supports be?", expect: [/4\.5\s*m/i] },
  { id: "lanyard_d", documentId: CONVEYOR, q: "Maximum pull-wire support spacing?", expect: [/4\.5\s*m/i] },
  { id: "nut", documentId: ASNZS, q: "What is the test method for determining the mechanical properties of high-strength nuts?", expect: [/3\.4/, /4291\.2/] },
  { id: "bolt", documentId: ASNZS, q: "What is the tolerance for M20 bolt shank straightness?", expect: [/figure\s*2\.3/i] },
];

const results = [];
for (const item of cases) {
  const row = await ask(cookie, item.q, item.documentId);
  results.push({ ...row, id: item.id, pass: pass(row, item.expect) });
}

const report = {
  host,
  results: results.map((row) => ({
    id: row.id,
    pass: row.pass,
    degraded: row.degraded,
    generationFailed: row.generationFailed,
    evidenceFallbackUsed: row.evidenceFallbackUsed,
    generationProvider: row.generationProvider,
    message: row.message,
    evidence: row.evidence,
  })),
  FOUNDER_REGRESSION_PASS: results.every((row) => row.pass),
  LANYARD_LIVE_QA_PASS: results.filter((row) => row.id.startsWith("lanyard")).every((row) => row.pass),
  LANYARD_RETRIEVAL_PASS: results.filter((row) => row.id.startsWith("lanyard")).every((row) => /4\.5\s*m/i.test(row.hay)),
  LANYARD_GENERATED_QA_PASS: results.filter((row) => row.id.startsWith("lanyard")).every((row) => /4\.5\s*m/i.test(row.message) && !row.degraded),
  LANYARD_EVIDENCE_FALLBACK_PASS: results.filter((row) => row.id.startsWith("lanyard")).every((row) => /4\.5\s*m/i.test(row.message)),
};
writeFileSync(resolve(OUT, "live-qa.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  FOUNDER_REGRESSION_PASS: report.FOUNDER_REGRESSION_PASS,
  LANYARD_LIVE_QA_PASS: report.LANYARD_LIVE_QA_PASS,
  LANYARD_RETRIEVAL_PASS: report.LANYARD_RETRIEVAL_PASS,
  LANYARD_GENERATED_QA_PASS: report.LANYARD_GENERATED_QA_PASS,
  LANYARD_EVIDENCE_FALLBACK_PASS: report.LANYARD_EVIDENCE_FALLBACK_PASS,
  failed: results.filter((row) => !row.pass).map((row) => ({ id: row.id, message: row.message, degraded: row.degraded })),
}, null, 2));
