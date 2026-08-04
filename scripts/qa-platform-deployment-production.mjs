/**
 * Phase 6C-3E.0 — AI Platform production deployment smoke.
 * Does not print secrets. Uses SMOKE_BASE_URL (required).
 */
const base = (process.env.SMOKE_BASE_URL ?? "").replace(/\/$/, "");
if (!base) {
  console.error("qa-platform-deployment-production FAIL");
  console.error("SMOKE_BASE_URL is required");
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function bodyLooksSafe(text) {
  const lower = String(text).toLowerCase();
  const banned = [
    "client_secret",
    "access_token",
    "refresh_token",
    "bearer ",
    "service_role",
    "pi_teams_client_secret",
    "pi_teams_webhook_client_state",
  ];
  return !banned.some((b) => lower.includes(b));
}

async function getJson(path) {
  const res = await fetch(`${base}${path}`, { method: "GET" });
  const text = await res.text();
  assert(bodyLooksSafe(text), `${path} response appears to expose secrets`);
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json */
  }
  return { res, text, json };
}

async function main() {
  const results = [];

  // DNS / HTTPS implied by successful fetch
  {
    const { res, json } = await getJson("/api/health");
    assert(res.status === 200, `health status ${res.status}`);
    assert(json?.status === "healthy", "health status not healthy");
    results.push("health 200");
  }

  {
    const { res, json } = await getJson("/api/platform/build-identity");
    assert(res.status === 200, `build-identity status ${res.status}`);
    assert(json?.ok === true, "build-identity ok false");
    assert(typeof json?.commitSha === "string" && json.commitSha.length > 0, "commitSha missing");
    results.push(`build-identity 200 commit=${String(json.commitSha).slice(0, 12)}`);
  }

  {
    const { res, json } = await getJson("/api/deployment/status");
    assert(res.status === 200, `deployment status ${res.status}`);
    assert(json?.webhook?.path === "/api/webhooks/microsoft-graph", "webhook path missing");
    results.push("deployment-status 200");
  }

  {
    const res = await fetch(`${base}/api/webhooks/microsoft-graph`, { method: "GET" });
    const text = await res.text();
    assert(res.status !== 404, "webhook GET returned 404");
    assert(bodyLooksSafe(text), "webhook GET unsafe");
    results.push(`webhook GET ${res.status}`);
  }

  {
    const token = "rtb-validation-test";
    const res = await fetch(
      `${base}/api/webhooks/microsoft-graph?validationToken=${encodeURIComponent(token)}`,
      { method: "POST" },
    );
    const text = await res.text();
    const ct = res.headers.get("content-type") ?? "";
    assert(res.status === 200, `validationToken status ${res.status}`);
    assert(ct.includes("text/plain"), `expected text/plain got ${ct}`);
    assert(text === token, `expected body token, got '${text.slice(0, 80)}'`);
    results.push("webhook validationToken 200");
  }

  {
    const res = await fetch(`${base}/deployment`, { method: "GET", redirect: "follow" });
    assert(res.status !== 404, "deployment page 404");
    assert(res.status < 500, `deployment page ${res.status}`);
    results.push(`deployment page ${res.status}`);
  }

  console.log("qa-platform-deployment-production PASS");
  console.log(`origin_host=${new URL(base).host}`);
  for (const line of results) console.log(`- ${line}`);
}

main().catch((error) => {
  console.error("qa-platform-deployment-production FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
