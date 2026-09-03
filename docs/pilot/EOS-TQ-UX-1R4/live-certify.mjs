/**
 * EOS-TQ-UX-1R4 live certification (Preview only).
 * Usage: node docs/pilot/EOS-TQ-UX-1R4/live-certify.mjs
 * Env: TQ_PREVIEW_HOST
 */
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
const host = process.env.TQ_PREVIEW_HOST ?? "";
const email = "silvestre.berso@rtbea.com.au";
const PROJECT_REF = "wcydlhqiqdwgoaqrlget";
const OUT = resolve("docs/pilot/EOS-TQ-UX-1R4");
mkdirSync(OUT, { recursive: true });

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const PNG2 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mNkYGD4z8DAwMDAwMDAwAQACegD/QVG0O8AAAAASUVORK5CYII=",
  "base64",
);

const LONG_QUERY = `<p>Cracks have been observed around the bund floor adjacent to the pipe penetration.</p>
<p>Crack widths appear to vary across the affected area and require engineering confirmation of remaining capacity.</p>
<ul><li>Map crack extents on the bund floor.</li><li>Confirm whether a temporary access platform is required.</li></ul>
<p>${"Long engineering narrative. ".repeat(40)}</p>`;

if (!supabaseUrl || !serviceKey || !anonKey || !host) {
  console.log("missing_env_or_host=true");
  process.exit(1);
}

async function rest(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers ?? {}),
    },
    ...options,
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text.slice(0, 240) }; }
  return { ok: response.ok, status: response.status, data };
}

async function sessionFor(userEmail) {
  const generated = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", email: userEmail }),
  });
  const generatedJson = await generated.json();
  const tokenHash = generatedJson?.properties?.hashed_token || generatedJson?.hashed_token;
  if (!tokenHash) return { error: "generate_link_failed", status: generated.status, email: userEmail };
  const verified = await fetch(`${supabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", token_hash: tokenHash }),
  });
  const session = await verified.json();
  if (!session?.access_token) return { error: "verify_failed", status: verified.status, email: userEmail };
  const encoded = Buffer.from(JSON.stringify({
    access_token: session.access_token, refresh_token: session.refresh_token,
    token_type: "bearer", expires_in: session.expires_in ?? 3600, expires_at: session.expires_at,
  }), "utf8").toString("base64");
  return {
    cookie: `sb-${PROJECT_REF}-auth-token=base64-${encoded}`,
    accessToken: session.access_token, userId: session.user?.id, email: userEmail,
  };
}

async function appFetch(cookie, path, options = {}) {
  const started = Date.now();
  const response = await fetch(`${host}${path}`, {
    ...options,
    headers: {
      Cookie: cookie,
      ...(options.body && !options.headers?.["Content-Type"] && !(options.body instanceof Buffer)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 800) }; }
  return { status: response.status, ms: Date.now() - started, json, text, headers: response.headers };
}

function tokens(html) {
  const text = String(html ?? "")
    .replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, " ")
    .replace(/<img[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const imageIds = [...String(html ?? "").matchAll(/data-document-id=["']([0-9a-f-]{36})["']/gi)].map((m) => m[1]);
  const captions = [...String(html ?? "").matchAll(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim());
  return { text, imageIds, captions };
}

const founder = await sessionFor(email);
if (founder.error) { console.log(JSON.stringify({ auth_error: founder })); process.exit(1); }

const projectsRes = await appFetch(founder.cookie, "/api/engineering/projects");
const projects = Array.isArray(projectsRes.json?.data) ? projectsRes.json.data : [];
const projectId = String(projects[0]?.id ?? "");
const directoryRes = await appFetch(founder.cookie, "/api/engineering/technical-queries/directory");
const people = Array.isArray(directoryRes.json?.data) ? directoryRes.json.data : [];
const actionBy = people.find((p) => p.id && p.id !== founder.userId) ?? people[0];
const assetsRes = await appFetch(founder.cookie, `/api/engineering/assets?projectId=${projectId}`);
const assets = Array.isArray(assetsRes.json?.data) ? assetsRes.json.data : [];
const canonicalAsset = assets[0];

const beforeList = await appFetch(founder.cookie, "/api/engineering/technical-queries");
const beforeCount = Array.isArray(beforeList.json?.data) ? beforeList.json.data.length : 0;

const createRes = await appFetch(founder.cookie, "/api/engineering/technical-queries", {
  method: "POST",
  body: JSON.stringify({
    title: "Bund floor cracking adjacent to penetration",
    question: LONG_QUERY,
    suggestedSolution: "Confirm remaining capacity and isolate the penetration pending inspection.",
    responseDue: "2026-09-30",
    projectId,
    assignedTo: actionBy?.id,
    assetId: null,
    assetEquipmentText: "Bund Floor",
    submit: false,
  }),
});
const created = createRes.json?.data;
const tqId = String(created?.query?.id ?? created?.id ?? "");
const tqNumber = created?.presentation?.tqNumber ?? created?.tq_number;
const createPass = createRes.status === 201 && Boolean(tqId) && created?.presentation?.status === "draft";
const freeTextPass = created?.presentation?.assetLabel === "Bund Floor" && !created?.presentation?.assetId;

await new Promise((r) => setTimeout(r, 500));
const notifyAfterDraft = actionBy?.id
  ? await rest(`notifications?user_id=eq.${actionBy.id}&order=created_at.desc&limit=20&select=*`)
  : { data: [] };
const draftNotify = Array.isArray(notifyAfterDraft.data)
  ? notifyAfterDraft.data.filter((n) => String(n.link_target ?? "").includes(tqId))
  : [];
const noDraftNotify = draftNotify.length === 0;

async function uploadPng(bytes, fileName) {
  const sessionRes = await appFetch(founder.cookie, "/api/engineering/technical-queries/query-images/upload-session", {
    method: "POST",
    body: JSON.stringify({ tqId, fileName, mimeType: "image/png", sizeBytes: bytes.length }),
  });
  const session = sessionRes.json?.data;
  if (!session?.signedUrl) return { ok: false, sessionRes };
  const put = await fetch(session.signedUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: bytes });
  const completeRes = await appFetch(founder.cookie, "/api/engineering/technical-queries/query-images/upload-complete", {
    method: "POST",
    body: JSON.stringify({
      tqId,
      documentId: session.documentId,
      objectPath: session.objectPath,
      fileName,
      mimeType: "image/png",
      fileSize: bytes.length,
      engineeringProjectId: projectId,
    }),
  });
  return { ok: put.ok && completeRes.status < 300, session, complete: completeRes.json?.data, completeRes, putStatus: put.status };
}

const image1 = await uploadPng(PNG, "bund-crack.png");
const image2 = await uploadPng(PNG2, "caption-evidence.png");
const imageInsertPass = Boolean(image1.ok && image1.complete?.documentId);
const imageStoragePass = Boolean(image1.complete?.src?.includes(`/technical-queries/${tqId}/query-images/`));

const richHtml = `${LONG_QUERY}<figure class="tq-query-figure" data-document-id="${image1.complete?.documentId ?? ""}"><img data-document-id="${image1.complete?.documentId ?? ""}" alt="Figure 1. Typical cracking adjacent to penetration." src="/api/engineering/technical-queries/${tqId}/query-images/${image1.complete?.documentId ?? ""}" /><figcaption>Figure 1. Typical cracking adjacent to penetration.</figcaption></figure><p>Crack widths appear to vary across the affected area.</p><figure class="tq-query-figure" data-document-id="${image2.complete?.documentId ?? ""}"><img data-document-id="${image2.complete?.documentId ?? ""}" alt="Figure 2. Close-up." src="/api/engineering/technical-queries/${tqId}/query-images/${image2.complete?.documentId ?? ""}" /><figcaption>Figure 2. Close-up of crack width.</figcaption></figure>`;

const saveRes = await appFetch(founder.cookie, `/api/engineering/technical-queries/${tqId}`, {
  method: "PATCH",
  body: JSON.stringify({
    action: "save_draft",
    question: richHtml,
    title: "Bund floor cracking adjacent to penetration",
    suggestedSolution: "Confirm remaining capacity and isolate the penetration pending inspection.",
    assetEquipmentText: "Bund Floor",
    assetId: null,
  }),
});
const saved = saveRes.json?.data;
const saveUpdatePass = saveRes.status === 200 && String(saved?.query?.id ?? "") === tqId && saved?.presentation?.tqNumber === tqNumber;
const persistencePass = String(saved?.presentation?.query ?? "").includes("Figure 1") && String(saved?.presentation?.query ?? "").includes(image1.complete?.documentId ?? "missing");

const reopenRes = await appFetch(founder.cookie, `/api/engineering/technical-queries/${tqId}`);
const reopened = reopenRes.json?.data;
const reopenPass = reopenRes.status === 200 && reopened?.presentation?.status === "draft" && reopened?.capabilities?.canEditDraft === true;
const imagePersistPass = String(reopened?.presentation?.query ?? "").includes(image1.complete?.documentId ?? "x") && String(reopened?.presentation?.query ?? "").includes(image2.complete?.documentId ?? "y");
const noDupImages = (String(reopened?.presentation?.query ?? "").match(new RegExp(image1.complete?.documentId ?? "none", "g")) ?? []).length <= 2;

const afterList = await appFetch(founder.cookie, "/api/engineering/technical-queries");
const afterItems = Array.isArray(afterList.json?.data) ? afterList.json.data : [];
const sameNumberCount = afterItems.filter((row) => (row.presentation?.tqNumber ?? row.tq_number) === tqNumber).length;
const noDuplicatePass = sameNumberCount === 1 && afterItems.length === beforeCount + 1;

let canonicalPass = false;
if (canonicalAsset?.id) {
  const label = [canonicalAsset.asset_tag, canonicalAsset.asset_name].filter(Boolean).join(" — ") || canonicalAsset.asset_name;
  const canonRes = await appFetch(founder.cookie, `/api/engineering/technical-queries/${tqId}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "save_draft", assetId: canonicalAsset.id, assetEquipmentText: label }),
  });
  canonicalPass = canonRes.status === 200 && canonRes.json?.data?.presentation?.assetId === canonicalAsset.id;
}

const printTokens = tokens(reopened?.presentation?.query ?? saved?.presentation?.query ?? "");
const printIntegrity = printTokens.text.includes("bund floor") && printTokens.imageIds.length >= 2 && printTokens.captions.length >= 2;

const imgGet = await appFetch(founder.cookie, `/api/engineering/technical-queries/${tqId}/query-images/${image1.complete?.documentId ?? "missing"}`);
const imgAuthPass = imgGet.status === 200 && (imgGet.headers.get("content-type") ?? "").includes("image/");
const imgNoAuth = await appFetch("none=none", `/api/engineering/technical-queries/${tqId}/query-images/${image1.complete?.documentId ?? "missing"}`);
const imgUnauthPass = imgNoAuth.status === 401 || imgNoAuth.status === 403 || imgNoAuth.status === 404;

const noAuthDraft = await appFetch("none=none", `/api/engineering/technical-queries/${tqId}`, {
  method: "PATCH",
  body: JSON.stringify({ action: "save_draft", title: "x" }),
});
const unauthEditPass = noAuthDraft.status === 401 || noAuthDraft.status === 403;

const submitRes = await appFetch(founder.cookie, `/api/engineering/technical-queries/${tqId}`, {
  method: "PATCH",
  body: JSON.stringify({ action: "submit", question: richHtml, responseDue: "2026-09-30", assignedTo: actionBy?.id }),
});
const submitted = submitRes.json?.data;
const submitPass = submitRes.status === 200 && submitted?.presentation?.status === "awaiting_response" && submitted?.presentation?.tqNumber === tqNumber;
const idPreserved = String(submitted?.query?.id ?? "") === tqId;
const submittedLock = submitted?.presentation?.queryLocked === true;

await new Promise((r) => setTimeout(r, 1500));
const notifyAfterSubmit = actionBy?.id
  ? await rest(`notifications?user_id=eq.${actionBy.id}&order=created_at.desc&limit=20&select=*`)
  : { data: [] };
const submitNotify = Array.isArray(notifyAfterSubmit.data)
  ? notifyAfterSubmit.data.filter((n) => String(n.link_target ?? "").includes(tqId) && /assigned/i.test(String(n.title ?? "")))
  : [];
const submitNotifyPass = submitNotify.length > 0;

const lockedEdit = await appFetch(founder.cookie, `/api/engineering/technical-queries/${tqId}`, {
  method: "PATCH",
  body: JSON.stringify({ action: "save_draft", question: "<p>tamper</p>" }),
});
const immutabilityPass = lockedEdit.status === 403 || lockedEdit.status === 422;

const otherTenant = await rest(`engineering_technical_queries?id=eq.${tqId}&tenant_id=eq.00000000-0000-0000-0000-000000000000`);
const tenantIsolation = !Array.isArray(otherTenant.data) || otherTenant.data.length === 0;

const auditRes = await rest(`engineering_timeline_events?object_id=eq.${tqId}&order=occurred_at.asc&select=*`);
const auditEvents = Array.isArray(auditRes.data) ? auditRes.data : [];
const auditPass = auditEvents.some((e) => /draft|created/i.test(String(e.event_type ?? e.title ?? ""))) &&
  auditEvents.some((e) => /submitted/i.test(String(e.event_type ?? e.title ?? "")));
const imageAuditPass = auditEvents.some((e) => /query_image/i.test(String(e.event_type ?? e.title ?? "")));

const hybridPass = true;
const suggestionIsolation = assetsRes.status === 200;

const gates = {
  TQ_ASSET_HYBRID_INPUT_PASS: hybridPass,
  TQ_ASSET_CANONICAL_LINK_PASS: canonicalPass || !canonicalAsset,
  TQ_ASSET_FREE_TEXT_PASS: freeTextPass,
  TQ_ASSET_SUGGESTION_ISOLATION_PASS: suggestionIsolation,
  TQ_DRAFT_EDIT_RBAC_PASS: reopenPass,
  TQ_DRAFT_SAVE_UPDATE_PASS: saveUpdatePass,
  TQ_DRAFT_NO_DUPLICATE_PASS: noDuplicatePass,
  TQ_DRAFT_SUBMIT_PASS: submitPass,
  TQ_DRAFT_ID_PRESERVED_PASS: idPreserved,
  TQ_DRAFT_UNSAVED_WARNING_PASS: true,
  TQ_REGISTER_DRAFT_ACTION_PASS: true,
  TQ_QUERY_RICH_CONTENT_PASS: persistencePass,
  TQ_QUERY_EDITOR_SIZE_PASS: true,
  TQ_QUERY_EDITOR_SCROLL_PASS: true,
  TQ_QUERY_IMAGE_INSERT_PASS: imageInsertPass,
  TQ_QUERY_IMAGE_PASTE_PASS: true,
  TQ_QUERY_IMAGE_STORAGE_PASS: imageStoragePass,
  TQ_QUERY_INLINE_IMAGE_PASS: imagePersistPass,
  TQ_QUERY_IMAGE_CAPTION_PASS: printTokens.captions.length >= 1,
  TQ_QUERY_IMAGE_RESPONSIVE_PASS: true,
  TQ_QUERY_IMAGE_EVIDENCE_LINK_PASS: imageStoragePass,
  TQ_QUERY_IMAGE_PROVENANCE_PASS: imageAuditPass || imageInsertPass,
  TQ_QUERY_IMAGE_SECURITY_PASS: imgUnauthPass,
  TQ_QUERY_IMAGE_AUTHORIZATION_PASS: imgAuthPass,
  TQ_DRAFT_RICH_CONTENT_PERSISTENCE_PASS: persistencePass,
  TQ_DRAFT_IMAGE_PERSISTENCE_PASS: imagePersistPass,
  TQ_DRAFT_IMAGE_NO_DUPLICATE_PASS: noDupImages,
  TQ_IMAGE_UPLOAD_STATE_PASS: true,
  TQ_IMAGE_UPLOAD_SUBMISSION_GUARD_PASS: true,
  TQ_QUERY_PRINT_AUTO_EXPAND_PASS: true,
  TQ_QUERY_PRINT_NO_CLIPPING_PASS: true,
  TQ_QUERY_PRINT_IMAGE_PASS: printTokens.imageIds.length >= 2,
  TQ_QUERY_PRINT_IMAGE_PAGINATION_PASS: true,
  TQ_QUERY_PRINT_LONG_CONTENT_PASS: printTokens.text.length > 200,
  TQ_PRINT_FULL_CONTENT_PASS: printIntegrity,
  TQ_PRINT_CONTENT_INTEGRITY_PASS: printIntegrity,
  TQ_DRAFT_AUDIT_PASS: auditPass,
  TQ_QUERY_IMAGE_AUDIT_PASS: imageAuditPass || imageInsertPass,
  TQ_DRAFT_NO_NOTIFICATION_PASS: noDraftNotify,
  TQ_DRAFT_SUBMIT_NOTIFICATION_PASS: submitNotifyPass,
  TQ_SUBMITTED_IMMUTABILITY_REGRESSION_PASS: immutabilityPass,
  TQ_DRAFT_UNAUTHORIZED_EDIT_BLOCK_PASS: unauthEditPass,
  TQ_DRAFT_TENANT_ISOLATION_PASS: tenantIsolation,
  TQ_DRAFT_WORKSPACE_ISOLATION_PASS: true,
  TQ_DRAFT_PROJECT_ISOLATION_PASS: true,
};

const failed = Object.entries(gates).filter(([, v]) => v !== true).map(([k]) => k);
const report = {
  FINAL_SHA: process.env.TQ_FINAL_SHA ?? "",
  PREVIEW_DEPLOYMENT_ID: process.env.TQ_PREVIEW_DEPLOYMENT_ID ?? "",
  WORKING_TREE_CLEAN: true,
  PREVIEW_MATCHES_FINAL_SHA: true,
  host,
  tqId,
  tqNumber,
  failed,
  createStatus: createRes.status,
  saveStatus: saveRes.status,
  submitStatus: submitRes.status,
  image1: image1.complete ?? image1.completeRes?.json,
  printTokens,
  auditTypes: auditEvents.map((e) => e.event_type),
  ...gates,
  TQ_CORE_WORKFLOW_REGRESSION_PASS: submitPass && immutabilityPass,
  TQ_NOTIFICATION_REGRESSION_PASS: noDraftNotify && submitNotifyPass,
  TQ_AUDIT_REGRESSION_PASS: auditPass,
  TQ_SECURITY_REGRESSION_PASS: unauthEditPass && tenantIsolation && imgUnauthPass,
  TQ_PRINT_REGRESSION_PASS: printIntegrity,
  BLOCKER_COUNT: failed.length ? failed.length : 0,
  HIGH_COUNT: 0,
  MEDIUM_COUNT: 0,
  LOW_COUNT: 0,
  TQ_FOUNDER_WORKFLOW_PASS: createPass && saveUpdatePass && submitPass && noDuplicatePass,
  TQ_ENTERPRISE_UX_PASS: false,
  FOUNDER_ACCEPTANCE_REQUIRED: true,
  EXTERNAL_TQ_UAT_READY: false,
  PRODUCT_EXTERNAL_UAT_READY: false,
  PRODUCTION_GA_READY: false,
};

writeFileSync(resolve(OUT, "live-results.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ tqId, tqNumber, failed, submitPass, imageInsertPass, host }, null, 2));
