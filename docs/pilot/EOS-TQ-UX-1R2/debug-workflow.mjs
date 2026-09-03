import { readFileSync } from "node:fs";
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
  } catch { return env; }
  return env;
}

const env = { ...loadEnv(resolve("apps/web/.env.local")), ...process.env };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const host = "https://rtb-ai-platform-h5gr9fujg-rtbea.vercel.app";
const email = "silvestre.berso@rtbea.com.au";
const PROJECT_REF = "wcydlhqiqdwgoaqrlget";

async function sessionFor(userEmail) {
  const generated = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", email: userEmail }),
  });
  const generatedJson = await generated.json();
  const tokenHash = generatedJson?.properties?.hashed_token || generatedJson?.hashed_token;
  if (!tokenHash) return { error: "generate_link_failed" };
  const verified = await fetch(`${supabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", token_hash: tokenHash }),
  });
  const session = await verified.json();
  if (!session?.access_token) return { error: "verify_failed" };
  const encoded = Buffer.from(JSON.stringify({
    access_token: session.access_token, refresh_token: session.refresh_token,
    token_type: "bearer", expires_in: session.expires_in ?? 3600, expires_at: session.expires_at,
  }), "utf8").toString("base64");
  return { cookie: `sb-${PROJECT_REF}-auth-token=base64-${encoded}`, userId: session.user?.id };
}

async function appFetch(cookie, path, options = {}) {
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
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 800) }; }
  return { status: response.status, json };
}

const founder = await sessionFor(email);
console.log("auth:", founder.userId ? "ok" : "failed");

// Create TQ
const created = await appFetch(founder.cookie, "/api/engineering/technical-queries", {
  method: "POST",
  body: JSON.stringify({
    question: "Debug test TQ",
    responseDue: "2026-09-20",
    priority: "normal",
    submit: true,
  }),
});
console.log("create status:", created.status);
const tqId = created.json?.data?.query?.id ?? created.json?.data?.id;
const tqStatus = created.json?.data?.query?.status;
console.log("tqId:", tqId, "status:", tqStatus);

if (!tqId) { console.log("create response:", JSON.stringify(created.json, null, 2)); process.exit(1); }

// Get directory
const dir = await appFetch(founder.cookie, "/api/engineering/technical-queries/directory");
const people = Array.isArray(dir.json?.data) ? dir.json.data : [];
const assignee = people.find((p) => p.id && p.id !== founder.userId) ?? people[0];
console.log("assignee:", assignee?.name, assignee?.id);

// Assign
const assignRes = await appFetch(founder.cookie, `/api/engineering/technical-queries/${tqId}`, {
  method: "PATCH", body: JSON.stringify({ action: "assign", assignedTo: assignee?.id }),
});
console.log("assign status:", assignRes.status, JSON.stringify(assignRes.json?.error ?? assignRes.json?.data?.status ?? "").slice(0, 200));

// Submit response (as founder if no assignee session)
const respondRes = await appFetch(founder.cookie, `/api/engineering/technical-queries/${tqId}`, {
  method: "PATCH", body: JSON.stringify({
    action: "submit_response",
    response: "Test response text confirming the query.",
    responseBasis: "Review of specifications",
  }),
});
console.log("respond status:", respondRes.status, JSON.stringify(respondRes.json?.error ?? respondRes.json?.data?.status ?? "").slice(0, 200));

// Accept
const acceptRes = await appFetch(founder.cookie, `/api/engineering/technical-queries/${tqId}`, {
  method: "PATCH", body: JSON.stringify({ action: "accept" }),
});
console.log("accept status:", acceptRes.status, JSON.stringify(acceptRes.json?.error ?? acceptRes.json?.data?.status ?? "").slice(0, 200));

// Close
const closeRes = await appFetch(founder.cookie, `/api/engineering/technical-queries/${tqId}`, {
  method: "PATCH", body: JSON.stringify({ action: "close", evidenceComplete: true, actionsCompleted: true }),
});
console.log("close status:", closeRes.status, JSON.stringify(closeRes.json?.error ?? closeRes.json?.data?.status ?? "").slice(0, 200));

// Check notifications
await new Promise((r) => setTimeout(r, 2000));
const notifyRes = await fetch(`${supabaseUrl}/rest/v1/notifications?select=*&order=created_at.desc&limit=20`, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
});
const notifications = await notifyRes.json();
const tqNotify = (notifications ?? []).filter((n) => 
  String(n.link_target ?? "").includes(tqId) || String(n.title ?? "").includes("TQ-")
);
console.log("tq notifications:", tqNotify.length, tqNotify.map((n) => n.title));
