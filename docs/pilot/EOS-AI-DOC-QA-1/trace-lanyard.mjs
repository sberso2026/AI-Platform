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
const PROJECT_REF = "wcydlhqiqdwgoaqrlget";
const OUT = resolve("docs/pilot/EOS-AI-DOC-QA-1");

async function sessionCookie() {
  const generated = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
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

function clip(value, n = 500) {
  return String(value ?? "").replace(/\s+/g, " ").slice(0, n);
}

function parseCandidates(diagnostic) {
  const rows = [];
  for (const line of diagnostic ?? []) {
    if (!String(line).startsWith("candidate:")) continue;
    const parts = String(line).split(":");
    const get = (prefix) => {
      const found = parts.find((part) => part.startsWith(`${prefix}=`));
      return found ? found.slice(prefix.length + 1) : "";
    };
    rows.push({
      rank: Number(parts[1]),
      chunk_id: parts[2],
      page: get("page"),
      section: get("section"),
      fts: get("fts"),
      distinctive: get("distinctive"),
      fallback: get("fallback"),
      semantic: get("semantic"),
      fusion: get("fusion"),
      selected: parts.includes("selected"),
      rejection: parts.at(-1),
    });
  }
  return rows;
}

async function ask(cookie, query) {
  const started = Date.now();
  const response = await fetch(`${host}/api/engineering/ai`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: query,
      documentId: CONVEYOR,
      objectType: "document",
      objectId: CONVEYOR,
      scope: "document",
      agentSlug: "engineering-director",
    }),
  });
  const json = await response.json();
  const data = json?.data ?? json ?? {};
  const evidence = Array.isArray(data.evidence) ? data.evidence : [];
  const diagnostic = data.diagnosticLimitations ?? [];
  const hay = `${data.message ?? ""}\n${evidence.map((row) => `${row.sectionPath ?? ""} ${row.pageStart ?? ""} ${row.excerpt ?? ""}`).join("\n")}`;
  return {
    query,
    http: response.status,
    ms: Date.now() - started,
    message: clip(data.message, 800),
    limitations: data.limitations ?? [],
    diagnostic,
    query_plan: diagnostic.find((line) => String(line).startsWith("query_plan:")) ?? null,
    rank1_margin: diagnostic.find((line) => String(line).startsWith("rank1_margin:")) ?? null,
    meta: data.meta ?? {},
    retrievalMode: data.retrievalMode ?? data.meta?.retrievalMode ?? null,
    generationFailed: Boolean(data.meta?.generationFailed),
    generationFailureLayer: data.meta?.generationFailureLayer ?? null,
    generationFailureCause: data.meta?.generationFailureCause ?? null,
    generationProvider: data.meta?.generationProvider ?? null,
    generationAvailable: data.meta?.generationAvailable ?? null,
    abstained: Boolean(data.grounded?.abstained ?? data.meta?.abstained),
    evidenceCount: evidence.length,
    evidence: evidence.map((row) => ({
      number: row.documentNumber ?? null,
      page: row.pageStart ?? null,
      section: row.sectionPath ?? null,
      href: row.sourceLocation ?? null,
      excerpt: clip(row.excerpt, 280),
    })),
    candidates: parseCandidates(diagnostic),
    has_4_5: /4\.5\s*m/i.test(hay),
    has_degraded: /could not generate an answer|degraded mode/i.test(String(data.message ?? "")),
    has_lanyard_or_pull: /lanyard|pull\s*wir/i.test(hay),
  };
}

mkdirSync(OUT, { recursive: true });
const cookie = await sessionCookie();
const questions = [
  "supports for lanyards or pull wires shall be provided at what maximum interval?",
  "what is the maximum interval for lanyard or pull wire support?",
];
const results = [];
for (const query of questions) {
  results.push(await ask(cookie, query));
}
writeFileSync(resolve(OUT, "failure-trace.json"), JSON.stringify({ host, documentId: CONVEYOR, results }, null, 2));
console.log(JSON.stringify(results.map((row) => ({
  query: row.query,
  http: row.http,
  ms: row.ms,
  has_4_5: row.has_4_5,
  has_degraded: row.has_degraded,
  has_lanyard_or_pull: row.has_lanyard_or_pull,
  generationFailed: row.generationFailed,
  generationFailureLayer: row.generationFailureLayer,
  generationFailureCause: row.generationFailureCause,
  generationProvider: row.generationProvider,
  generationAvailable: row.generationAvailable,
  retrievalMode: row.retrievalMode,
  abstained: row.abstained,
  evidenceCount: row.evidenceCount,
  evidence: row.evidence,
  query_plan: row.query_plan,
  selected: row.candidates.filter((c) => c.selected).slice(0, 6),
  top: row.candidates.slice(0, 8),
  message: row.message,
  limitations: row.limitations,
})), null, 2));
