import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT,
  MICROSOFT_TOKEN_ENDPOINT_CLASSIFICATION,
  MicrosoftTokenExchangeFailure,
  emitMicrosoftTokenExchangeFailure,
  exchangeMicrosoftAuthorizationCode,
  parseMicrosoftTokenEndpointFailure,
  sanitizeMicrosoftTokenErrorDescription,
} from "./oauth";

const FAKE_CLIENT_SECRET = "FAKE_CLIENT_SECRET_VALUE_DO_NOT_LEAK";
const FAKE_AUTH_CODE = "FAKE_AUTH_CODE_DO_NOT_LEAK";
const FAKE_ACCESS_TOKEN = "FAKE_ACCESS_TOKEN_DO_NOT_LEAK";
const FAKE_REFRESH_TOKEN = "FAKE_REFRESH_TOKEN_DO_NOT_LEAK";
const FAKE_ID_TOKEN_LEAK = "FAKE_ID_TOKEN_DO_NOT_LEAK";
const FAKE_OAUTH_STATE = "FAKE_OAUTH_STATE_DO_NOT_LEAK";
const RAW_BODY_CANARY = "RAW_TOKEN_BODY_CANARY_DO_NOT_LEAK";
const CORRELATION = "22222222-2222-2222-2222-222222222222";
const TRACE = "11111111-1111-1111-1111-111111111111";
const REQUEST_ID = "33333333-3333-3333-3333-333333333333";

const ENV = {
  RTB_M365_APPLICATION_ID: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  RTB_M365_CLIENT_SECRET: FAKE_CLIENT_SECRET,
};

function fakeIdToken(claims: Record<string, unknown> = { tid: "11111111-2222-3333-4444-555555555555", oid: "oid-user-1" }): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `eyJhbGciOiJub25lIn0.${payload}.sig`;
}

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function serialized(value: unknown): string {
  return JSON.stringify(value);
}

const secrets = [
  FAKE_CLIENT_SECRET,
  FAKE_AUTH_CODE,
  FAKE_ACCESS_TOKEN,
  FAKE_REFRESH_TOKEN,
  FAKE_ID_TOKEN_LEAK,
  FAKE_OAUTH_STATE,
  RAW_BODY_CANARY,
];

function assertNoSecretMaterial(blob: string) {
  for (const secret of secrets) expect(blob).not.toContain(secret);
  expect(blob).not.toMatch(/eyJhbGciOiJub25lIn0\./);
}

async function exchange(
  fetchImpl: typeof fetch,
  env: NodeJS.ProcessEnv = ENV,
  onFailureDiagnostic?: (diagnostic: unknown) => void,
) {
  return exchangeMicrosoftAuthorizationCode({
    code: FAKE_AUTH_CODE,
    redirectUri: "http://localhost:3007/api/engineering/m365/oauth/callback",
    env,
    fetchImpl,
    onFailureDiagnostic,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("EOS-A16C Microsoft token-exchange diagnostic hardening", () => {
  it("captures invalid_client, AADSTS7000215, HTTP status, correlation/trace, and a sanitized description", async () => {
    const diagnostics: unknown[] = [];
    const logs: string[] = [];
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      logs.push(String(message));
    });
    const description = [
      "AADSTS7000215: Invalid client secret provided.",
      `client_secret=${FAKE_CLIENT_SECRET}`,
      `code=${FAKE_AUTH_CODE}`,
      `access_token=${FAKE_ACCESS_TOKEN}`,
      `refresh_token=${FAKE_REFRESH_TOKEN}`,
      `id_token=${FAKE_ID_TOKEN_LEAK}`,
      `state=${FAKE_OAUTH_STATE}`,
      `Trace ID: ${TRACE}`,
      `Correlation ID: ${CORRELATION}`,
      "Timestamp: 2026-10-03 15:00:00Z",
    ].join(" ");
    const fetchImpl: typeof fetch = async () => jsonResponse(400, {
      error: "invalid_client",
      error_description: description,
      error_codes: [7000215],
      timestamp: "2026-10-03 15:00:00Z",
      trace_id: TRACE,
      correlation_id: CORRELATION,
      access_token: FAKE_ACCESS_TOKEN,
      refresh_token: FAKE_REFRESH_TOKEN,
      id_token: FAKE_ID_TOKEN_LEAK,
      raw_body_canary: RAW_BODY_CANARY,
    }, { "x-ms-request-id": REQUEST_ID });

    await expect(exchange(fetchImpl, ENV, (diagnostic) => diagnostics.push(diagnostic))).rejects.toMatchObject({
      name: "MicrosoftTokenExchangeFailure",
      message: "token_http_400",
    });

    expect(diagnostics).toHaveLength(1);
    const diagnostic = diagnostics[0] as {
      layer: string;
      httpStatus: number;
      oauthError: string | null;
      aadstsCodes: string[];
      errorDescriptionSanitized: string | null;
      correlationId: string | null;
      traceId: string | null;
      timestamp: string | null;
      msRequestId: string | null;
      endpoint: string;
    };
    expect(diagnostic.layer).toBe("MICROSOFT_HTTP_ERROR");
    expect(diagnostic.endpoint).toBe(MICROSOFT_TOKEN_ENDPOINT_CLASSIFICATION);
    expect(diagnostic.httpStatus).toBe(400);
    expect(diagnostic.oauthError).toBe("invalid_client");
    expect(diagnostic.aadstsCodes).toContain("AADSTS7000215");
    expect(diagnostic.errorDescriptionSanitized).toContain("AADSTS7000215");
    expect(diagnostic.correlationId).toBe(CORRELATION);
    expect(diagnostic.traceId).toBe(TRACE);
    expect(diagnostic.timestamp).toBe("2026-10-03 15:00:00Z");
    expect(diagnostic.msRequestId).toBe(REQUEST_ID);
    expect(logs.join("")).toContain(EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT);
    expect(logs.join("")).toContain("MICROSOFT_HTTP_ERROR");
    assertNoSecretMaterial(`${serialized(diagnostics)}${logs.join("")}`);
  });

  it("does not log token contents on a successful token response", async () => {
    const logs: string[] = [];
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      logs.push(String(message));
    });
    const onFailureDiagnostic = vi.fn();
    const fetchImpl: typeof fetch = async () => jsonResponse(200, {
      token_type: "Bearer",
      access_token: FAKE_ACCESS_TOKEN,
      refresh_token: FAKE_REFRESH_TOKEN,
      id_token: fakeIdToken(),
      raw_body_canary: RAW_BODY_CANARY,
    });
    const result = await exchange(fetchImpl, ENV, onFailureDiagnostic);
    expect(result.tokenPresent).toBe(true);
    expect(result.identity.microsoftTenantId).toBe("11111111-2222-3333-4444-555555555555");
    expect(onFailureDiagnostic).not.toHaveBeenCalled();
    expect(logs.join("")).toBe("");
    const blob = serialized(result);
    expect(blob).not.toContain(EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT);
    assertNoSecretMaterial(blob);
  });

  it("keeps fail-closed token_rejected for 401 and never emits raw Microsoft JSON", async () => {
    const diagnostics: unknown[] = [];
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchImpl: typeof fetch = async () => jsonResponse(401, {
      error: "invalid_client",
      error_description: `unauthorized client_secret=${FAKE_CLIENT_SECRET}`,
      error_codes: [7000215],
      raw_body_canary: RAW_BODY_CANARY,
    });
    await expect(exchange(fetchImpl, ENV, (diagnostic) => diagnostics.push(diagnostic))).rejects.toBeInstanceOf(MicrosoftTokenExchangeFailure);
    await expect(exchange(fetchImpl, ENV, (diagnostic) => diagnostics.push(diagnostic))).rejects.toThrow(/token_rejected/);
    expect((diagnostics[0] as { layer: string }).layer).toBe("MICROSOFT_HTTP_ERROR");
    assertNoSecretMaterial(serialized(diagnostics));
  });

  it("writes a staging diagnostic file without credential material", () => {
    const dir = mkdtempSync(join(tmpdir(), "eos-m365-diag-"));
    const path = join(dir, "token-failure.json");
    const logs: string[] = [];
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      logs.push(String(message));
    });
    const diagnostic = parseMicrosoftTokenEndpointFailure(
      jsonResponse(400, {}, { "x-ms-request-id": REQUEST_ID }),
      JSON.stringify({
        error: "invalid_client",
        error_description: `AADSTS7000215 client_secret=${FAKE_CLIENT_SECRET} code=${FAKE_AUTH_CODE} state=${FAKE_OAUTH_STATE}`,
        error_codes: [7000215],
        correlation_id: CORRELATION,
        trace_id: TRACE,
        raw_body_canary: RAW_BODY_CANARY,
      }),
    );
    emitMicrosoftTokenExchangeFailure(diagnostic, {
      RTB_REVIEW_RUNTIME: "staging",
      EOS_M365_TOKEN_DIAGNOSTIC_PATH: path,
    });
    const written = readFileSync(path, "utf8");
    expect(written).toContain(EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT);
    expect(written).toContain("MICROSOFT_HTTP_ERROR");
    expect(written).toContain("invalid_client");
    expect(written).toContain("AADSTS7000215");
    expect(written).toContain(CORRELATION);
    expect(written).toContain(TRACE);
    assertNoSecretMaterial(written);
    expect(logs.join("")).toContain(EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT);
    rmSync(dir, { recursive: true, force: true });
  });

  it("redacts secret-bearing Microsoft error_description text before output", () => {
    const sanitized = sanitizeMicrosoftTokenErrorDescription(
      `AADSTS7000215: Invalid client secret provided. client_secret=${FAKE_CLIENT_SECRET} code=${FAKE_AUTH_CODE} state=${FAKE_OAUTH_STATE} Bearer ${FAKE_ACCESS_TOKEN}`,
    );
    expect(sanitized).toContain("AADSTS7000215");
    assertNoSecretMaterial(String(sanitized));
    expect(sanitized).not.toMatch(/Bearer\s+FAKE_/);
  });
});

describe("EOS-A16C Microsoft token-exchange diagnostic coverage", () => {
  it("emits NETWORK_EXCEPTION when fetch throws before an HTTP response", async () => {
    const diagnostics: Array<{ layer: string; endpoint: string; errorName: string | null }> = [];
    const logs: string[] = [];
    const dir = mkdtempSync(join(tmpdir(), "eos-m365-diag-"));
    const path = join(dir, "token-failure.json");
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      logs.push(String(message));
    });
    const fetchImpl: typeof fetch = async () => {
      throw new TypeError(`fetch failed code=${FAKE_AUTH_CODE} client_secret=${FAKE_CLIENT_SECRET} state=${FAKE_OAUTH_STATE}`);
    };
    await expect(exchange(fetchImpl, {
      ...ENV,
      RTB_REVIEW_RUNTIME: "staging",
      EOS_M365_TOKEN_DIAGNOSTIC_PATH: path,
    }, (diagnostic) => diagnostics.push(diagnostic as typeof diagnostics[number]))).rejects.toMatchObject({
      name: "MicrosoftTokenExchangeFailure",
      message: "token_network_exception",
    });
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.layer).toBe("NETWORK_EXCEPTION");
    expect(diagnostics[0]?.endpoint).toBe(MICROSOFT_TOKEN_ENDPOINT_CLASSIFICATION);
    expect(diagnostics[0]?.errorName).toBe("TypeError");
    expect(logs.join("")).toContain(EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT);
    expect(logs.join("")).toContain("NETWORK_EXCEPTION");
    const written = readFileSync(path, "utf8");
    expect(written).toContain("NETWORK_EXCEPTION");
    assertNoSecretMaterial(`${serialized(diagnostics)}${logs.join("")}${written}`);
    rmSync(dir, { recursive: true, force: true });
  });

  it("emits TOKEN_RESPONSE_PARSE_ERROR for HTTP 200 invalid JSON", async () => {
    const diagnostics: Array<{ layer: string; errorDescriptionSanitized: string | null }> = [];
    const logs: string[] = [];
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      logs.push(String(message));
    });
    const fetchImpl: typeof fetch = async () => new Response(`{${RAW_BODY_CANARY}`, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    await expect(exchange(fetchImpl, ENV, (diagnostic) => diagnostics.push(diagnostic as typeof diagnostics[number]))).rejects.toBeInstanceOf(MicrosoftTokenExchangeFailure);
    expect(diagnostics[0]?.layer).toBe("TOKEN_RESPONSE_PARSE_ERROR");
    expect(diagnostics[0]?.errorDescriptionSanitized).toBe("invalid_json");
    expect(logs.join("")).toContain("TOKEN_RESPONSE_PARSE_ERROR");
    assertNoSecretMaterial(`${serialized(diagnostics)}${logs.join("")}`);
  });

  it("emits TOKEN_RESPONSE_PARSE_ERROR when HTTP 200 JSON is missing id_token", async () => {
    const diagnostics: Array<{ layer: string; errorDescriptionSanitized: string | null }> = [];
    const logs: string[] = [];
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      logs.push(String(message));
    });
    const fetchImpl: typeof fetch = async () => jsonResponse(200, {
      token_type: "Bearer",
      access_token: FAKE_ACCESS_TOKEN,
      refresh_token: FAKE_REFRESH_TOKEN,
      raw_body_canary: RAW_BODY_CANARY,
    });
    await expect(exchange(fetchImpl, ENV, (diagnostic) => diagnostics.push(diagnostic as typeof diagnostics[number]))).rejects.toMatchObject({
      message: "microsoft_identity_missing",
    });
    expect(diagnostics[0]?.layer).toBe("TOKEN_RESPONSE_PARSE_ERROR");
    expect(diagnostics[0]?.errorDescriptionSanitized).toBe("id_token_missing");
    assertNoSecretMaterial(`${serialized(diagnostics)}${logs.join("")}`);
  });

  it("emits TOKEN_RESPONSE_PARSE_ERROR for a malformed id_token", async () => {
    const diagnostics: Array<{ layer: string; errorDescriptionSanitized: string | null }> = [];
    const logs: string[] = [];
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      logs.push(String(message));
    });
    const fetchImpl: typeof fetch = async () => jsonResponse(200, {
      access_token: FAKE_ACCESS_TOKEN,
      id_token: "not-a-jwt",
      raw_body_canary: RAW_BODY_CANARY,
    });
    await expect(exchange(fetchImpl, ENV, (diagnostic) => diagnostics.push(diagnostic as typeof diagnostics[number]))).rejects.toBeInstanceOf(MicrosoftTokenExchangeFailure);
    expect(diagnostics[0]?.layer).toBe("TOKEN_RESPONSE_PARSE_ERROR");
    expect(diagnostics[0]?.errorDescriptionSanitized).toBe("id_token_malformed");
    expect(logs.join("")).toContain("TOKEN_RESPONSE_PARSE_ERROR");
    assertNoSecretMaterial(`${serialized(diagnostics)}${logs.join("")}`);
  });

  it("emits POST_TOKEN_VALIDATION_ERROR when decoded id_token is missing required claims", async () => {
    const diagnostics: Array<{ layer: string; errorDescriptionSanitized: string | null }> = [];
    const logs: string[] = [];
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      logs.push(String(message));
    });
    const fetchImpl: typeof fetch = async () => jsonResponse(200, {
      access_token: FAKE_ACCESS_TOKEN,
      id_token: fakeIdToken({ oid: "oid-user-1" }),
      raw_body_canary: RAW_BODY_CANARY,
    });
    await expect(exchange(fetchImpl, ENV, (diagnostic) => diagnostics.push(diagnostic as typeof diagnostics[number]))).rejects.toMatchObject({
      message: "microsoft_tenant_missing",
    });
    expect(diagnostics[0]?.layer).toBe("POST_TOKEN_VALIDATION_ERROR");
    expect(diagnostics[0]?.errorDescriptionSanitized).toBe("required_claim_missing");
    expect(logs.join("")).toContain("POST_TOKEN_VALIDATION_ERROR");
    expect(logs.join("")).not.toContain("oid-user-1");
    assertNoSecretMaterial(`${serialized(diagnostics)}${logs.join("")}`);
  });
});
