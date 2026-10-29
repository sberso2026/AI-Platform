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
const PROJECT_REF = "wcydlhqiqdwgoaqrlget";
const OUT = resolve("docs/pilot/EOS-TQ-UX-1R");
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;

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
      Prefer: "return=representation",
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

async function sessionFor(userEmail) {
  const generated = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
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
    userId: session.user?.id,
    email: userEmail,
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
    json = { raw: text.slice(0, 800) };
  }
  return { status: response.status, ms: Date.now() - started, json, text };
}

function uuidHits(text) {
  return String(text ?? "").match(UUID_RE) ?? [];
}

const founder = await sessionFor(email);
if (founder.error) {
  console.log(JSON.stringify({ auth_error: founder }));
  process.exit(1);
}

const identity = await appFetch(founder.cookie, "/api/platform/build-identity");
const projects = await appFetch(founder.cookie, "/api/engineering/projects");
const projectList = Array.isArray(projects.json?.data) ? projects.json.data : [];
const project = projectList.find((row) => /gold coast|pilot|kgp|rtb/i.test(String(row.project_name ?? row.name ?? ""))) ?? projectList[0];
const projectId = project?.id ?? null;
const documents = await appFetch(founder.cookie, "/api/engineering/documents");
const documentList = Array.isArray(documents.json?.data) ? documents.json.data : [];
const documentId = documentList[0]?.id ?? null;
const directory = await appFetch(founder.cookie, "/api/engineering/technical-queries/directory");
const people = Array.isArray(directory.json?.data) ? directory.json.data : [];
function isHumanName(name) {
  const n = String(name ?? "");
  if (!n || /@/.test(n)) return false;
  if (/eos\.|invite|cert-|viewer/i.test(n)) return false;
  if (/\d{8,}/.test(n)) return false;
  return /[A-Za-z]{2,}/.test(n);
}
const actionBy =
  people.find((p) => p.id && p.id !== founder.userId && isHumanName(p.name)) ??
  people.find((p) => p.id && p.id !== founder.userId) ??
  people[0];
const actionByProfile = actionBy?.id
  ? await rest(`profiles?id=eq.${actionBy.id}&select=id,email,full_name`)
  : { data: [] };
const actionByEmail = Array.isArray(actionByProfile.data) ? actionByProfile.data[0]?.email : null;
const assignee = actionByEmail ? await sessionFor(actionByEmail) : { error: "no_assignee_email" };

const due = "2026-09-14";
const queryText =
  "Thioflex 600 flowable sealant is not suitable around the pipe sleeper isolation joint. Please advise whether Flamex XT is acceptable.";
const suggested =
  "Use Flamex XT subject to confirmation against the project specification and approved materials requirements.";

const createStart = Date.now();
const created = await appFetch(founder.cookie, "/api/engineering/technical-queries", {
  method: "POST",
  body: JSON.stringify({
    title: "Sealant suitability at pipe sleeper isolation joint",
    question: queryText,
    suggestedSolution: suggested,
    responseDue: due,
    projectId,
    documentId,
    assignedTo: actionBy?.id,
    submit: true,
    priority: "high",
    classification: "specification_clarification",
  }),
});
const createMs = Date.now() - createStart;
const createdData = created.json?.data ?? {};
const tqId = createdData.query?.id ?? createdData.id;
const presentation = createdData.presentation ?? {};
const createError = created.status >= 400 ? created.json?.error ?? created.json : null;

if (documentId && tqId) {
  await appFetch(founder.cookie, "/api/engineering/technical-queries", {
    method: "PATCH",
    body: JSON.stringify({ id: tqId, action: "link", toType: "document", toId: documentId }),
  });
}

const registerAll = await appFetch(founder.cookie, "/api/engineering/technical-queries");
const registerMine = await appFetch(
  assignee.cookie ?? founder.cookie,
  `/api/engineering/technical-queries?view=mine${projectId ? `&projectId=${projectId}` : ""}`,
);
const detail = await appFetch(founder.cookie, `/api/engineering/technical-queries/${tqId}`);
const detailPresentation = detail.json?.data?.presentation ?? {};
const originalQuery = detailPresentation.query;

const responseText =
  "Flamex XT is acceptable at the pipe sleeper isolation joint subject to the project specification and approved materials register.";
const responderCookie = assignee.cookie && !assignee.error ? assignee.cookie : founder.cookie;
const responded = await appFetch(responderCookie, "/api/engineering/technical-queries", {
  method: "PATCH",
  body: JSON.stringify({
    id: tqId,
    action: "submit_response",
    response: responseText,
    responseBasis: "Project specification and approved materials requirements.",
    followUpActions: "Confirm material against the approved register before installation.",
  }),
});

const clarification = await appFetch(founder.cookie, "/api/engineering/technical-queries", {
  method: "PATCH",
  body: JSON.stringify({
    id: tqId,
    action: "request_clarification",
    comment: "Please confirm Flamex XT against the approved materials register before closeout.",
  }),
});

const respondedAgain = await appFetch(responderCookie, "/api/engineering/technical-queries", {
  method: "PATCH",
  body: JSON.stringify({
    id: tqId,
    action: "submit_response",
    response: `${responseText} Confirmed against the approved materials register.`,
    responseBasis: "Project specification and approved materials register.",
  }),
});

const accepted = await appFetch(founder.cookie, "/api/engineering/technical-queries", {
  method: "PATCH",
  body: JSON.stringify({ id: tqId, action: "accept" }),
});

const actionCreated = await appFetch(founder.cookie, "/api/engineering/actions", {
  method: "POST",
  body: JSON.stringify({
    title: "Confirm Flamex XT against approved materials register",
    originatingObjectType: "technical_query",
    originatingObjectId: tqId,
    projectId,
  }),
});
const followUpId = actionCreated.json?.data?.id;
if (followUpId) {
  await appFetch(founder.cookie, "/api/engineering/technical-queries", {
    method: "PATCH",
    body: JSON.stringify({ id: tqId, action: "link", toType: "action", toId: followUpId }),
  });
}

const closed = await appFetch(founder.cookie, "/api/engineering/technical-queries", {
  method: "PATCH",
  body: JSON.stringify({
    id: tqId,
    action: "close",
    closeoutComments: "Response accepted. Follow-up action linked. Evidence retained.",
    evidenceComplete: true,
    actionsCompleted: true,
    referencesRetained: true,
  }),
});

const finalDetail = await appFetch(founder.cookie, `/api/engineering/technical-queries/${tqId}`);
const printPage = await appFetch(founder.cookie, `/engineering/technical-queries/${tqId}/print`);
const registerHtml = await appFetch(founder.cookie, "/engineering/technical-queries");
const newHtml = await appFetch(founder.cookie, "/engineering/technical-queries/new");
const detailHtml = await appFetch(founder.cookie, `/engineering/technical-queries/${tqId}`);
const mineHtml = await appFetch(founder.cookie, "/engineering/technical-queries?view=mine");

const unauthGet = await fetch(`${host}/api/engineering/technical-queries/${tqId}`);
const unauthPatch = await fetch(`${host}/api/engineering/technical-queries`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: tqId, action: "close", closeoutComments: "unauthorized" }),
});

const viewers = await rest(
  "tenant_memberships?select=user_id,status,roles(slug),profiles(email)&status=eq.active",
);
const viewerRow = (Array.isArray(viewers.data) ? viewers.data : []).find((row) => {
  const role = Array.isArray(row.roles) ? row.roles[0] : row.roles;
  const viewerEmail = Array.isArray(row.profiles) ? row.profiles[0]?.email : row.profiles?.email;
  return role?.slug === "viewer" && viewerEmail && viewerEmail !== email;
});
let unauthorized = { skipped: true, reason: "no_viewer_user" };
if (viewerRow) {
  const viewerEmail = Array.isArray(viewerRow.profiles) ? viewerRow.profiles[0]?.email : viewerRow.profiles?.email;
  const viewer = await sessionFor(viewerEmail);
  if (!viewer.error) {
    const editQuery = await appFetch(viewer.cookie, "/api/engineering/technical-queries", {
      method: "PATCH",
      body: JSON.stringify({ id: tqId, action: "update_draft", question: "overwrite" }),
    });
    const reassign = await appFetch(viewer.cookie, "/api/engineering/technical-queries", {
      method: "PATCH",
      body: JSON.stringify({ id: tqId, action: "assign", assignedTo: viewer.userId }),
    });
    const submitResp = await appFetch(viewer.cookie, "/api/engineering/technical-queries", {
      method: "PATCH",
      body: JSON.stringify({ id: tqId, action: "submit_response", response: "unauthorized" }),
    });
    const accept = await appFetch(viewer.cookie, "/api/engineering/technical-queries", {
      method: "PATCH",
      body: JSON.stringify({ id: tqId, action: "accept" }),
    });
    const close = await appFetch(viewer.cookie, "/api/engineering/technical-queries", {
      method: "PATCH",
      body: JSON.stringify({ id: tqId, action: "close" }),
    });
    unauthorized = {
      skipped: false,
      email: viewerEmail,
      statuses: [editQuery.status, reassign.status, submitResp.status, accept.status, close.status],
      blocked: [editQuery.status, reassign.status, submitResp.status, accept.status, close.status].every(
        (status) => status === 401 || status === 403,
      ),
    };
  }
}

const tqRow = await rest(`engineering_technical_queries?id=eq.${tqId}&select=*`);
const tenantId = tqRow.data?.[0]?.tenant_id;
const workspaceId = tqRow.data?.[0]?.workspace_id;
const otherTenant = await rest("engineering_technical_queries?select=id,tenant_id&limit=1");
const otherTenantHit = (Array.isArray(otherTenant.data) ? otherTenant.data : []).find(
  (row) => row.tenant_id && row.tenant_id !== tenantId,
);
const founderSeesOther = otherTenantHit
  ? await appFetch(founder.cookie, `/api/engineering/technical-queries/${otherTenantHit.id}`)
  : { status: 404, json: { skipped: true } };

const otherProject = projectList.find((row) => row.id && row.id !== projectId);
const otherProjectList = otherProject
  ? await appFetch(founder.cookie, `/api/engineering/technical-queries?projectId=${otherProject.id}`)
  : { json: { data: [] } };
const leakedToOtherProject = Array.isArray(otherProjectList.json?.data)
  ? otherProjectList.json.data.some((row) => (row.id ?? row.query?.id) === tqId)
  : false;
const otherWorkspaceTq = await rest(
  `engineering_technical_queries?select=id,workspace_id,tenant_id&workspace_id=neq.${workspaceId || "00000000-0000-0000-0000-000000000000"}&limit=5`,
);
const otherWorkspaceHit = (Array.isArray(otherWorkspaceTq.data) ? otherWorkspaceTq.data : []).find(
  (row) => row.workspace_id && row.workspace_id !== workspaceId,
);
const founderSeesOtherWorkspace = otherWorkspaceHit
  ? await appFetch(founder.cookie, `/api/engineering/technical-queries/${otherWorkspaceHit.id}`)
  : { status: 404, json: { skipped: true } };
const otherTenantDoc = await rest(
  `engineering_documents?select=id,tenant_id&tenant_id=neq.${tenantId || "00000000-0000-0000-0000-000000000000"}&limit=1`,
);
const otherDocHit = Array.isArray(otherTenantDoc.data) ? otherTenantDoc.data[0] : null;
const founderSeesOtherDoc = otherDocHit
  ? await appFetch(founder.cookie, `/api/engineering/documents/${otherDocHit.id}`)
  : { status: 404, json: { skipped: true } };

const notifications = await rest(
  `notifications?select=id,type,title,created_at,link_target,user_id&order=created_at.desc&limit=80`,
);
const tqNumber = presentation.tqNumber || "";
const tqNotifications = (Array.isArray(notifications.data) ? notifications.data : []).filter((row) => {
  const title = String(row.title ?? "");
  const link = String(row.link_target ?? "");
  const createdAt = Date.parse(row.created_at ?? "") || 0;
  return (
    createdAt >= createStart - 5000 &&
    (title.includes(tqNumber) || link.includes(String(tqId ?? "")) || /technical.query|TQ-/i.test(title))
  );
});

const timeline = await rest(
  `engineering_timeline_events?object_id=eq.${tqId}&select=event_type,title,occurred_at,actor_id,tenant_id,workspace_id,project_id&order=occurred_at.asc`,
);

const finalPresentation = finalDetail.json?.data?.presentation ?? {};
const history = finalDetail.json?.data?.history ?? [];
const references = finalDetail.json?.data?.references ?? [];
const identityFields = [
  presentation.initiator?.name,
  presentation.actionBy?.name,
  presentation.reviewer?.name,
  presentation.approver?.name,
  presentation.responder?.name,
  presentation.owner?.name,
  finalPresentation.initiator?.name,
  finalPresentation.actionBy?.name,
  finalPresentation.reviewer?.name,
  finalPresentation.approver?.name,
  finalPresentation.responder?.name,
  finalPresentation.owner?.name,
].filter(Boolean);
const visibleUuidHits = identityFields.filter((name) => uuidHits(name).length > 0);

const report = {
  host,
  identity: identity.json,
  tqId,
  tqNumber: presentation.tqNumber || finalPresentation.tqNumber,
  projectName: project?.project_name ?? null,
  actionByName: actionBy?.name ?? null,
  initiatorName: presentation.initiator?.name ?? finalPresentation.initiator?.name ?? null,
  statuses: {
    create: created.status,
    register: registerAll.status,
    mine: registerMine.status,
    detail: detail.status,
    respond: responded.status,
    clarification: clarification.status,
    respondAgain: respondedAgain.status,
    accept: accepted.status,
    close: closed.status,
    print: printPage.status,
  },
  createError,
  assigneeAuth: assignee.error ? assignee.error : "ok",
  actionByEmail: actionByEmail ? "present" : null,
  latencies: {
    registerMs: registerAll.ms,
    detailMs: detail.ms,
    createMs,
  },
  presentation,
  finalPresentation,
  originalQueryPreserved: originalQuery === queryText,
  assigned: Boolean(presentation.assigned || finalPresentation.assigned),
  mineContains:
    Array.isArray(registerMine.json?.data) &&
    registerMine.json.data.some((row) => row.id === tqId || row.presentation?.tqNumber === presentation.tqNumber),
  registerContains:
    Array.isArray(registerAll.json?.data) &&
    registerAll.json.data.some((row) => row.id === tqId || row.query?.id === tqId),
  response: responded.json?.data?.query?.response ?? responded.json?.data?.presentation?.clientResponse,
  closeStatus: closed.status,
  finalStatus: finalPresentation.statusLabel,
  printHasQuery: /Query \/ Information Required/i.test(printPage.text),
  printHasSuggested: /Suggested Solution/i.test(printPage.text),
  printHasResponse: /Technical Response/i.test(printPage.text),
  printHasChromeHint: /Uncontrolled when printed/i.test(printPage.text),
  printHasNumber: String(printPage.text).includes(String(presentation.tqNumber ?? finalPresentation.tqNumber ?? "")),
  unauthorized,
  unauthGet: unauthGet.status,
  unauthPatch: unauthPatch.status,
  founderSeesOtherTenant: founderSeesOther.status,
  founderSeesOtherWorkspace: founderSeesOtherWorkspace.status,
  founderSeesOtherDoc: founderSeesOtherDoc.status,
  leakedToOtherProject,
  otherProjectId: otherProject?.id ?? null,
  tenantId,
  workspaceId,
  notificationCount: tqNotifications.length,
  notifications: tqNotifications.map((row) => ({ type: row.type, title: row.title })),
  auditCount: Array.isArray(timeline.data) ? timeline.data.length : 0,
  audit: Array.isArray(timeline.data)
    ? timeline.data.map((row) => ({ event: row.event_type, title: row.title, occurredAt: row.occurred_at }))
    : [],
  historyCount: history.length,
  referenceCount: references.length,
  uuidVisibleCount: visibleUuidHits.length,
  uuidSamples: visibleUuidHits.slice(0, 8),
};

mkdirSync(OUT, { recursive: true });
writeFileSync(resolve(OUT, "live-results.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
