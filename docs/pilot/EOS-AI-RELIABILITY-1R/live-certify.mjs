import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
const ASNZS = "c1cc8331-8b39-4e5f-871b-b1d237e7101e";
const CONVEYOR = "008ff87c-ede6-4007-b94d-480ef54a77e0";
const PROJECT_REF = "wcydlhqiqdwgoaqrlget";
const OUT = resolve("docs/pilot/EOS-AI-RELIABILITY-1R");

if (!supabaseUrl || !serviceKey || !anonKey) {
  console.log("missing_env=true");
  process.exit(1);
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
  if (!tokenHash) return { error: "generate_link_failed", status: generated.status };
  const verified = await fetch(`${supabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", token_hash: tokenHash }),
  });
  const session = await verified.json();
  if (!session?.access_token) return { error: "verify_failed", status: verified.status };
  const encoded = Buffer.from(JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: "bearer",
    expires_in: session.expires_in ?? 3600,
    expires_at: session.expires_at,
  }), "utf8").toString("base64");
  return { cookie: `sb-${PROJECT_REF}-auth-token=base64-${encoded}` };
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
    json = { raw: text.slice(0, 500) };
  }
  return { status: response.status, ms: Date.now() - started, json, text };
}

function clip(value) {
  return String(value ?? "").replace(/\s+/g, " ").slice(0, 280);
}

function hay(result) {
  const data = result.json?.data ?? result.json ?? {};
  const evidence = Array.isArray(data.evidence) ? data.evidence : [];
  const evidenceText = evidence.map((row) => `${row.documentNumber ?? ""} ${row.title ?? ""} ${row.sectionPath ?? ""} ${row.pageStart ?? ""} ${row.excerpt ?? ""} ${row.sourceLocation ?? ""}`).join("\n");
  return {
    data,
    evidence,
    message: String(data.message ?? data.grounded?.answer ?? ""),
    meta: data.meta ?? {},
    limitations: data.limitations ?? [],
    diagnostic: data.diagnosticLimitations ?? [],
    blob: `${data.message ?? ""}\n${evidenceText}`,
    evidenceText,
  };
}

function parseCandidates(diagnostic) {
  const rows = [];
  for (const line of diagnostic) {
    if (!String(line).startsWith("candidate:")) continue;
    const parts = String(line).split(":");
    const get = (prefix) => {
      const found = parts.find((part) => part.startsWith(`${prefix}=`));
      return found ? found.slice(prefix.length + 1) : "";
    };
    const num = (prefix) => {
      const value = get(prefix);
      return value === "" ? null : Number(value);
    };
    rows.push({
      rank: Number(parts[1]),
      chunk_id: parts[2],
      page: get("page") === "" ? null : Number(get("page")),
      section_path: get("section") || null,
      fts_score: num("fts"),
      distinctive_term_score: num("distinctive"),
      fallback_score: num("fallback"),
      semantic_score: num("semantic"),
      fusion_score: num("fusion"),
      rerank_score: num("rerank"),
      combined_score: num("combined"),
      selected: parts.includes("selected"),
      rejection_reason: parts.at(-1) === "selected" || parts.at(-1) === "rejected" ? null : parts.at(-1) || null,
    });
  }
  return rows;
}

function ask(cookie, query, documentId) {
  return appFetch(cookie, "/api/engineering/ai", {
    method: "POST",
    body: JSON.stringify({
      message: query,
      documentId,
      objectType: "document",
      objectId: documentId,
      scope: "document",
      agentSlug: "engineering-director",
    }),
  });
}

function passGuardThickness(blob) {
  return /1\.5\s*mm/i.test(blob) && /sheet metal/i.test(blob) && (/page\s*14/i.test(blob) || /\b14\b/.test(blob));
}

function citesAs1755(blob) {
  return /AS\s*1755/i.test(blob);
}

function clickable(evidence) {
  return evidence.some((row) => String(row.sourceLocation ?? "").includes(`/engineering/documents/${CONVEYOR}`));
}

function inventedExtra(blob) {
  return /shall be not less than 2\.5|3\.0\s*mm thick|must also be fire rated/i.test(blob);
}

mkdirSync(OUT, { recursive: true });
const auth = await sessionCookie();
if (auth.error) {
  console.log(JSON.stringify({ auth_error: auth.error, status: auth.status }));
  process.exit(1);
}

const hostHeaders = await fetch(host, { method: "HEAD", redirect: "manual" });
const deploymentHeader = hostHeaders.headers.get("x-vercel-id") || hostHeaders.headers.get("x-vercel-cache") || null;

const CONTROL = "what is the minimum sheet metal guard thickness";
const PERTURBED = "in the design of sheet metal guard, what is the minimum sheet metal guard thickness?";

const variants = [
  CONTROL,
  PERTURBED,
  "How thick must a sheet metal guard be?",
  "Tell me the required thickness of a sheet metal guard.",
  "Minimum thickness required for sheet metal guarding.",
  "Sheet metal guard thickness requirement.",
  "I am designing a conveyor guard from sheet metal. What thickness should I specify?",
  "Does this standard specify a thickness for sheet metal guarding?",
  "Find the dimensional requirement applicable to sheet metal guards.",
  "For a sheet metal guard, identify the applicable minimum material thickness.",
  "According to this document, what thickness is required for a sheet-metal guard?",
  "Please confirm the minimum thickness and show me the source.",
];

const regressions = [
  {
    id: "platform_width",
    documentId: CONVEYOR,
    q: "What is the minimum platform width to access the conveyor?",
    expect: [/4\.2\.1/, /600\s*mm/i],
  },
  {
    id: "crossover",
    documentId: CONVEYOR,
    q: "What is the requirement for conveyor crossover?",
    expect: [/4\.2\.3|7\.2\.2/],
  },
  {
    id: "nut_test_method",
    documentId: ASNZS,
    q: "What is the test method for determining the mechanical properties of high-strength nuts?",
    expect: [/3\.4/, /4291\.2/],
  },
  {
    id: "bolt_straightness",
    documentId: ASNZS,
    q: "What is the tolerance for M20 bolt shank straightness?",
    expect: [/figure\s*2\.3/i, /0\.0025/],
  },
];

const absent = [
  "What is the allowable wind load on the mast arm of this standard?",
  "What seismic design category applies to the control building?",
  "What aircraft wing spar alloy is specified in this document?",
  "What nuclear containment wall thickness is required?",
  "What is the IEC 61850 busbar protection setting for this switchroom?",
];

const results = [];
for (const query of variants) {
  const response = await ask(auth.cookie, query, CONVEYOR);
  const parsed = hay(response);
  const retrievalOk = passGuardThickness(parsed.blob) && citesAs1755(parsed.blob) && clickable(parsed.evidence) && !inventedExtra(parsed.blob);
  const generationOk = Boolean(parsed.meta.generationAvailable) && !parsed.meta.generationFailed && parsed.meta.generationProvider && parsed.meta.generationProvider !== "mock";
  const degraded = parsed.meta.retrievalMode === "retrieval_only" || Boolean(parsed.meta.generationFailed);
  results.push({
    id: query === CONTROL ? "control" : query === PERTURBED ? "perturbed" : "variant",
    query,
    http: response.status,
    ms: response.ms,
    retrievalOk,
    generationOk,
    degraded,
    generationProvider: parsed.meta.generationProvider ?? null,
    generationFailed: Boolean(parsed.meta.generationFailed),
    generationFailureLayer: parsed.meta.generationFailureLayer ?? null,
    generationFailureCause: parsed.meta.generationFailureCause ?? null,
    retrievalMode: parsed.meta.retrievalMode ?? parsed.data.retrievalMode ?? null,
    abstained: Boolean(parsed.data.grounded?.abstained ?? parsed.meta.abstained),
    evidenceCount: parsed.evidence.length,
    citations: parsed.evidence.map((row) => ({
      number: row.documentNumber ?? null,
      page: row.pageStart ?? null,
      section: row.sectionPath ?? null,
      href: row.sourceLocation ?? null,
      excerpt: clip(row.excerpt),
    })),
    message: clip(parsed.message),
    diagnostic: parsed.diagnostic,
    candidates: parseCandidates(parsed.diagnostic),
    rank1_margin: parsed.diagnostic.find((line) => String(line).startsWith("rank1_margin:")) ?? null,
    leakAsnzs: /4291\.2/.test(parsed.blob),
  });
}

const regressionResults = [];
for (const item of regressions) {
  const response = await ask(auth.cookie, item.q, item.documentId);
  const parsed = hay(response);
  regressionResults.push({
    id: item.id,
    http: response.status,
    pass: item.expect.every((re) => re.test(parsed.blob)),
    generationProvider: parsed.meta.generationProvider ?? null,
    generationFailed: Boolean(parsed.meta.generationFailed),
    evidenceCount: parsed.evidence.length,
    message: clip(parsed.message),
    citations: parsed.evidence.slice(0, 4).map((row) => ({
      number: row.documentNumber ?? null,
      page: row.pageStart ?? null,
      section: row.sectionPath ?? null,
      href: row.sourceLocation ?? null,
    })),
  });
}

const abstentionResults = [];
for (const query of absent) {
  const response = await ask(auth.cookie, query, CONVEYOR);
  const parsed = hay(response);
  const invented = /1\.5\s*mm|600\s*mm|shall be not less than/i.test(parsed.message) && parsed.evidence.length === 0;
  const pass = (Boolean(parsed.data.grounded?.abstained) || parsed.evidence.length === 0 || /enough authorised evidence|ABSTAIN|Insufficient/i.test(parsed.message)) && !invented;
  abstentionResults.push({
    query,
    pass,
    invented,
    evidenceCount: parsed.evidence.length,
    abstained: Boolean(parsed.data.grounded?.abstained ?? parsed.meta.abstained),
    message: clip(parsed.message),
  });
}

const leak = await ask(auth.cookie, "What is the test method for determining the mechanical properties of high-strength nuts?", CONVEYOR);
const leakParsed = hay(leak);
const leakCount = /4291\.2/.test(leakParsed.blob) && !/enough authorised evidence|ABSTAIN/i.test(leakParsed.message) ? 1 : 0;

const currentDoc = await appFetch(auth.cookie, `/api/engineering/documents/${CONVEYOR}`);
const currentNumber = currentDoc.json?.data?.document_number ?? currentDoc.json?.data?.documentNumber ?? null;

const control = results.find((row) => row.id === "control");
const perturbed = results.find((row) => row.id === "perturbed");
const variantPassCount = results.filter((row) => row.retrievalOk).length;
const generationPassAll = results.filter((row) => row.id === "control" || row.id === "perturbed" || row.retrievalOk).every((row) => row.generationOk);
function uniqueCitationKeys(evidence) {
  return evidence.map((row) => `${row.pageStart ?? ""}|${clip(row.excerpt).slice(0, 72)}`);
}
function citationsDeduped(evidence) {
  const keys = uniqueCitationKeys(evidence);
  return keys.length <= 1 || new Set(keys).size === keys.length;
}
const uniqueMargin = (row) => {
  const value = String(row?.rank1_margin ?? "").replace(/^rank1_margin:/, "");
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};
const providers = [...new Set(results.map((row) => row.generationProvider).filter(Boolean))];

const report = {
  host,
  deployment_hint: deploymentHeader,
  current_document_number: currentNumber,
  control,
  perturbed,
  variants: results,
  regressions: regressionResults,
  abstentions: abstentionResults,
  leak: {
    count: leakCount,
    message: clip(leakParsed.message),
    evidence: leakParsed.evidence.map((row) => row.documentNumber ?? row.title),
  },
  LIVE_CONTROL_QUERY_PASS: Boolean(control?.retrievalOk),
  LIVE_PERTURBED_QUERY_PASS: Boolean(perturbed?.retrievalOk),
  LIVE_QUERY_VARIANT_COUNT: results.length,
  LIVE_QUERY_VARIANT_PASS_COUNT: variantPassCount,
  LIVE_QUERY_VARIANT_SUCCESS_RATE: Number((variantPassCount / results.length).toFixed(4)),
  LIVE_RETRIEVAL_PASS: results.every((row) => row.retrievalOk),
  LIVE_GENERATION_PASS: generationPassAll,
  LIVE_GENERATION_PROVIDER: providers.join(",") || null,
  CONTROL_CORRECT_CHUNK_RANK: control?.candidates?.find((row) => row.selected)?.rank ?? control?.candidates?.[0]?.rank ?? null,
  PERTURBED_CORRECT_CHUNK_RANK: perturbed?.candidates?.find((row) => row.selected)?.rank ?? perturbed?.candidates?.[0]?.rank ?? null,
  CONTROL_RANK_1_MARGIN: control?.rank1_margin ?? null,
  PERTURBED_RANK_1_MARGIN: perturbed?.rank1_margin ?? null,
  CONTROL_UNIQUE_RANK_1_MARGIN: uniqueMargin(control),
  PERTURBED_UNIQUE_RANK_1_MARGIN: uniqueMargin(perturbed),
  CITATION_DEDUPLICATION_PASS: citationsDeduped(control?.citations ?? []) && citationsDeduped(perturbed?.citations ?? []),
  PLATFORM_WIDTH_REGRESSION_PASS: Boolean(regressionResults.find((row) => row.id === "platform_width")?.pass),
  CROSSOVER_REGRESSION_PASS: Boolean(regressionResults.find((row) => row.id === "crossover")?.pass),
  NUT_TEST_METHOD_REGRESSION_PASS: Boolean(regressionResults.find((row) => row.id === "nut_test_method")?.pass),
  BOLT_STRAIGHTNESS_REGRESSION_PASS: Boolean(regressionResults.find((row) => row.id === "bolt_straightness")?.pass),
  LIVE_ABSTENTION_PASS: abstentionResults.every((row) => row.pass),
  CURRENT_DOCUMENT_SCOPE_PASS: currentNumber && /AS\s*1755/i.test(String(currentNumber)) && leakCount === 0,
  CROSS_DOCUMENT_LEAK_COUNT: leakCount,
};

writeFileSync(resolve(OUT, "live-certify.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  LIVE_CONTROL_QUERY_PASS: report.LIVE_CONTROL_QUERY_PASS,
  LIVE_PERTURBED_QUERY_PASS: report.LIVE_PERTURBED_QUERY_PASS,
  LIVE_QUERY_VARIANT_COUNT: report.LIVE_QUERY_VARIANT_COUNT,
  LIVE_QUERY_VARIANT_PASS_COUNT: report.LIVE_QUERY_VARIANT_PASS_COUNT,
  LIVE_QUERY_VARIANT_SUCCESS_RATE: report.LIVE_QUERY_VARIANT_SUCCESS_RATE,
  LIVE_RETRIEVAL_PASS: report.LIVE_RETRIEVAL_PASS,
  LIVE_GENERATION_PASS: report.LIVE_GENERATION_PASS,
  LIVE_GENERATION_PROVIDER: report.LIVE_GENERATION_PROVIDER,
  CONTROL_CORRECT_CHUNK_RANK: report.CONTROL_CORRECT_CHUNK_RANK,
  PERTURBED_CORRECT_CHUNK_RANK: report.PERTURBED_CORRECT_CHUNK_RANK,
  CONTROL_RANK_1_MARGIN: report.CONTROL_RANK_1_MARGIN,
  PERTURBED_RANK_1_MARGIN: report.PERTURBED_RANK_1_MARGIN,
  CONTROL_UNIQUE_RANK_1_MARGIN: report.CONTROL_UNIQUE_RANK_1_MARGIN,
  PERTURBED_UNIQUE_RANK_1_MARGIN: report.PERTURBED_UNIQUE_RANK_1_MARGIN,
  CITATION_DEDUPLICATION_PASS: report.CITATION_DEDUPLICATION_PASS,
  PLATFORM_WIDTH_REGRESSION_PASS: report.PLATFORM_WIDTH_REGRESSION_PASS,
  CROSSOVER_REGRESSION_PASS: report.CROSSOVER_REGRESSION_PASS,
  NUT_TEST_METHOD_REGRESSION_PASS: report.NUT_TEST_METHOD_REGRESSION_PASS,
  BOLT_STRAIGHTNESS_REGRESSION_PASS: report.BOLT_STRAIGHTNESS_REGRESSION_PASS,
  LIVE_ABSTENTION_PASS: report.LIVE_ABSTENTION_PASS,
  CURRENT_DOCUMENT_SCOPE_PASS: report.CURRENT_DOCUMENT_SCOPE_PASS,
  CROSS_DOCUMENT_LEAK_COUNT: report.CROSS_DOCUMENT_LEAK_COUNT,
  control_provider: control?.generationProvider,
  control_degraded: control?.degraded,
  perturbed_degraded: perturbed?.degraded,
  failed_variants: results.filter((row) => !row.retrievalOk).map((row) => row.query),
}, null, 2));
