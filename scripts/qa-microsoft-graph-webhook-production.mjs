/**
 * Production smoke checks for Microsoft Graph webhook endpoint.
 * Does not print secrets. Uses SMOKE_BASE_URL (default: https://pilot.rtbea.com.au).
 */
const base = (process.env.SMOKE_BASE_URL ?? "https://pilot.rtbea.com.au").replace(/\/$/, "");
const path = "/api/webhooks/microsoft-graph";
const url = `${base}${path}`;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function bodyLooksSafe(text) {
  const lower = text.toLowerCase();
  const banned = [
    "client_secret",
    "access_token",
    "refresh_token",
    "bearer ",
    "pi_teams_client_secret",
    "pi_teams_webhook_client_state",
  ];
  return !banned.some((b) => lower.includes(b));
}

async function main() {
  const results = [];

  // 1. GET must not 404
  {
    const res = await fetch(url, { method: "GET" });
    const text = await res.text();
    assert(res.status !== 404, `GET returned 404: ${text.slice(0, 200)}`);
    assert(bodyLooksSafe(text), "GET response appears to expose secrets");
    results.push(`GET ${res.status}`);
  }

  // 2. validationToken handshake
  {
    const token = "rtb-validation-test";
    const res = await fetch(`${url}?validationToken=${encodeURIComponent(token)}`, {
      method: "POST",
    });
    const text = await res.text();
    const ct = res.headers.get("content-type") ?? "";
    assert(res.status === 200, `validationToken status ${res.status}: ${text.slice(0, 200)}`);
    assert(ct.includes("text/plain"), `expected text/plain, got ${ct}`);
    assert(text === token, `expected body '${token}', got '${text.slice(0, 80)}'`);
    assert(bodyLooksSafe(text), "validation response looks unsafe");
    results.push("POST validationToken 200 text/plain");
  }

  // 3. POST without clientState / empty payload
  {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const text = await res.text();
    assert(res.status !== 404, "empty POST returned 404");
    assert([400, 401, 403, 422].includes(res.status), `empty POST status ${res.status}`);
    assert(bodyLooksSafe(text), "empty POST response looks unsafe");
    assert(!text.includes("at "), `stack trace suspected in response`);
    results.push(`POST empty ${res.status}`);
  }

  // 4. POST with wrong clientState
  {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        value: [
          {
            subscriptionId: "smoke-sub",
            clientState: "definitely-wrong-client-state",
            changeType: "updated",
            resource: "communications/onlineMeetings/smoke",
          },
        ],
      }),
    });
    const text = await res.text();
    assert(res.status !== 404, "wrong clientState returned 404");
    assert(res.status !== 500, `wrong clientState returned 500: ${text.slice(0, 200)}`);
    assert([401, 403, 422].includes(res.status), `wrong clientState status ${res.status}`);
    assert(bodyLooksSafe(text), "wrong clientState response looks unsafe");
    results.push(`POST wrong clientState ${res.status}`);
  }

  console.log("qa-microsoft-graph-webhook-production PASS");
  for (const line of results) console.log(`- ${line}`);
}

main().catch((error) => {
  console.error("qa-microsoft-graph-webhook-production FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
