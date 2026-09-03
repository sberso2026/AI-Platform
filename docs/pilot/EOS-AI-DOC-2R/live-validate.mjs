import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(file) {
  const env = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1).replace(/^"|"$/g, "");
  }
  return env;
}

const env = { ...loadEnv(resolve("apps/web/.env.local")), ...process.env };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const host = "https://eos-pilot.rtbea.com.au";
const email = "silvestre.berso@rtbea.com.au";
const ASNZS = "c1cc8331-8b39-4e5f-871b-b1d237e7101e";
const CONVEYOR = "008ff87c-ede6-4007-b94d-480ef54a77e0";
const PROJECT_REF = "wcydlhqiqdwgoaqrlget";

if (!supabaseUrl || !serviceKey || !anonKey) {
  console.log("missing_env=true");
  process.exit(1);
}

async function rest(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 240) };
  }
  return { ok: response.ok, status: response.status, data };
}

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
  const tokenHash =
    generatedJson?.properties?.hashed_token ||
    generatedJson?.hashed_token ||
    generatedJson?.email_otp;
  if (!tokenHash) {
    return { error: "generate_link_failed", status: generated.status };
  }
  const verified = await fetch(`${supabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "magiclink", token_hash: tokenHash }),
  });
  const session = await verified.json();
  if (!session?.access_token) {
    return { error: "verify_failed", status: verified.status };
  }
  const encoded = Buffer.from(JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: "bearer",
    expires_in: session.expires_in ?? 3600,
    expires_at: session.expires_at,
  }), "utf8").toString("base64");
  return {
    cookie: `sb-${PROJECT_REF}-auth-token=base64-${encoded}`,
  };
}

async function appFetch(cookie, path, options = {}) {
  const started = Date.now();
  const response = await fetch(`${host}${path}`, {
    ...options,
    headers: {
      Cookie: cookie,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  return { status: response.status, ms: Date.now() - started, json };
}

function clip(value) {
  return String(value ?? "").replace(/\s+/g, " ").slice(0, 220);
}

const auth = await sessionCookie();
if (auth.error) {
  console.log(JSON.stringify({ auth_error: auth.error, status: auth.status }));
  process.exit(1);
}

const conveyorChunks = await rest(
  `project_intelligence_document_chunks?engineering_document_id=eq.${CONVEYOR}&select=content,section_path,page_start&limit=12`,
);
const chunkText = (conveyorChunks.data ?? []).map((row) => String(row.content ?? "")).join("\n");
const sourceSupportsAs1755 = /AS\s*1755/.test(chunkText) || /AS\s*1755/.test(
  (conveyorChunks.data ?? []).map((row) => String(row.section_path ?? "")).join(" "),
);

const before = await appFetch(auth.cookie, `/api/engineering/documents/${CONVEYOR}`);
const beforeDoc = before.json?.data ?? {};
const beforeMeta = beforeDoc.metadata ?? {};

let confirm = { skipped: true };
if (sourceSupportsAs1755) {
  confirm = await appFetch(auth.cookie, `/api/engineering/documents/${CONVEYOR}`, {
    method: "PATCH",
    body: JSON.stringify({
      action: "confirm",
      documentNumber: "AS 1755:1986",
      title: beforeDoc.title || "Conveyors - Design, Construction, Installation and Operation",
      revision: beforeDoc.revision || "A",
      documentType: "standard",
      numberSource: "extracted_header",
    }),
  });
}

const ingestStart = Date.now();
const ingest = await appFetch(auth.cookie, `/api/engineering/documents/${CONVEYOR}/ingest`, {
  method: "POST",
});
let ingestReady = false;
let ingestPolls = 0;
let lastIngestion = null;
for (let i = 0; i < 36; i += 1) {
  ingestPolls += 1;
  const row = await appFetch(auth.cookie, `/api/engineering/documents/${CONVEYOR}`);
  lastIngestion = row.json?.data?.presentation?.ingestion ?? null;
  if (lastIngestion?.aiSearchable && lastIngestion?.state !== "processing" && lastIngestion?.state !== "queued") {
    ingestReady = true;
    break;
  }
  await new Promise((resolveWait) => setTimeout(resolveWait, 5000));
}
const ingestMs = Date.now() - ingestStart;

const questions = [
  {
    id: "asnzs_test_method",
    documentId: ASNZS,
    q: "What is the test method for determining the mechanical properties of high-strength nuts?",
    expect: [/3\.4/, /4291\.2/],
  },
  {
    id: "asnzs_straightness",
    documentId: ASNZS,
    q: "What is the tolerance for M20 bolt shank straightness?",
    expect: [/figure\s*2\.3/i, /0\.0025/],
  },
  {
    id: "conveyor_platform",
    documentId: CONVEYOR,
    q: "What is the minimum platform width to access the conveyor?",
    expect: [/4\.2\.1/, /600\s*mm/i],
  },
  {
    id: "conveyor_crossover",
    documentId: CONVEYOR,
    q: "What is the requirement for conveyor crossover?",
    expect: [/4\.2\.3|7\.2\.2/],
  },
  {
    id: "abstain",
    documentId: ASNZS,
    q: "What is the allowable wind load on the mast arm of this standard?",
    expect: [/enough authorised evidence|ABSTAIN|Insufficient|cannot support/i],
  },
];

const results = [];
for (const item of questions) {
  const response = await appFetch(auth.cookie, "/api/engineering/ai", {
    method: "POST",
    body: JSON.stringify({
      message: item.q,
      documentId: item.documentId,
      objectType: "document",
      objectId: item.documentId,
      scope: "document",
      agentSlug: "engineering-director",
    }),
  });
  const data = response.json?.data ?? response.json ?? {};
  const message = String(data.message ?? "");
  const meta = data.meta ?? {};
  const evidence = Array.isArray(data.evidence) ? data.evidence : [];
  const citations = evidence.map((row) => ({
    number: row.documentNumber ?? row.document_number ?? null,
    page: row.pageStart ?? row.page_start ?? null,
    section: row.sectionPath ?? row.section_path ?? null,
    excerpt: clip(row.excerpt),
  }));
  results.push({
    id: item.id,
    http: response.status,
    ms: response.ms,
    generationFailed: Boolean(meta.generationFailed),
    generationAvailable: Boolean(meta.generationAvailable),
    generationProvider: meta.generationProvider ?? null,
    generationFailureLayer: meta.generationFailureLayer ?? null,
    generationFailureCause: meta.generationFailureCause ?? null,
    retrievalMode: meta.retrievalMode ?? data.retrievalMode ?? null,
    abstained: Boolean(data.grounded?.abstained ?? meta.abstained),
    evidenceCount: evidence.length,
    expectOk: item.expect.every((re) => re.test(message) || evidence.some((row) => re.test(`${row.excerpt ?? ""} ${row.sectionPath ?? ""}`))),
    message: clip(message),
    citations,
    retrievalMs: meta.retrievalMs ?? null,
    reasoningMs: meta.reasoningMs ?? null,
  });
}

const isolation = await appFetch(auth.cookie, "/api/engineering/ai", {
  method: "POST",
  body: JSON.stringify({
    message: "What is the test method for determining the mechanical properties of high-strength nuts?",
    documentId: CONVEYOR,
    objectType: "document",
    objectId: CONVEYOR,
    scope: "document",
  }),
});
const isolationData = isolation.json?.data ?? {};
const isolationText = `${isolationData.message ?? ""} ${JSON.stringify(isolationData.evidence ?? [])}`;
const isolationPass = !/AS\/NZS 4291\.2/.test(isolationText) || /ABSTAIN|enough authorised evidence/i.test(String(isolationData.message ?? ""));

const afterDoc = await appFetch(auth.cookie, `/api/engineering/documents/${CONVEYOR}`);
const afterMeta = afterDoc.json?.data?.metadata ?? {};
const afterNumber = afterDoc.json?.data?.document_number ?? null;

const sectionSample = await rest(
  `project_intelligence_document_chunks?engineering_document_id=eq.${CONVEYOR}&select=section_path&limit=80`,
);
const sectionPaths = (sectionSample.data ?? []).map((row) => row.section_path).filter(Boolean);
const qaMs = results.map((row) => row.ms).filter((value) => Number.isFinite(value));
const retrievalMs = results.map((row) => Number(row.retrievalMs)).filter((value) => Number.isFinite(value) && value > 0);

function p95(values) {
  if (!values.length) return "n/a";
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)];
}

const generated = results.filter((row) => row.id !== "abstain");
const providerPass = generated.every((row) => row.generationAvailable && !row.generationFailed && row.generationProvider && row.generationProvider !== "mock");

console.log(
  JSON.stringify(
    {
      preview_host: host,
      confirm_status: confirm.status ?? null,
      confirm_body: confirm.json ?? confirm.skipped ?? null,
      conveyor_number: afterNumber,
      conveyor_review_state: afterMeta.metadata_review_state ?? null,
      conveyor_number_source: afterMeta.document_number_source ?? null,
      source_supports_as1755: sourceSupportsAs1755,
      ingest: { http: ingest.status, ready: ingestReady, polls: ingestPolls, ms: ingestMs, state: lastIngestion },
      section_path_non_null: sectionPaths.length,
      section_path_sample: sectionPaths.slice(0, 8),
      isolation_pass: isolationPass,
      isolation_message: clip(isolationData.message),
      qa: results,
      provider_route_pass: providerPass,
      timings: {
        DOCUMENT_UPLOAD_P95_MS: "n/a",
        DOCUMENT_INGESTION_P95_MS: ingestReady ? ingestMs : "n/a",
        DOCUMENT_RETRIEVAL_P95_MS: p95(retrievalMs),
        DOCUMENT_QA_P95_MS: p95(qaMs),
      },
    },
    null,
    2,
  ),
);
