import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT,
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
const CORRELATION = "22222222-2222-2222-2222-222222222222";
const TRACE = "11111111-1111-1111-1111-111111111111";
const REQUEST_ID = "33333333-3333-3333-3333-333333333333";

const ENV = {
  RTB_M365_APPLICATION_ID: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  RTB_M365_CLIENT_SECRET: FAKE_CLIENT_SECRET,
};

function fakeIdToken(): string {
  const payload = Buffer.from(JSON.stringify({
    tid: "11111111-2222-3333-4444-555555555555",
    oid: "oid-user-1",
  })).toString("base64url");
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

const secrets = [FAKE_CLIENT_SECRET, FAKE_AUTH_CODE, FAKE_ACCESS_TOKEN, FAKE_REFRESH_TOKEN, FAKE_ID_TOKEN_LEAK];

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
    }, { "x-ms-request-id": REQUEST_ID });

    await expect(exchangeMicrosoftAuthorizationCode({
      code: FAKE_AUTH_CODE,
      redirectUri: "http://localhost:3007/api/engineering/m365/oauth/callback",
      env: ENV,
      fetchImpl,
      onFailureDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    })).rejects.toMatchObject({
      name: "MicrosoftTokenExchangeFailure",
      message: "token_http_400",
    });

    expect(diagnostics).toHaveLength(1);
    const diagnostic = diagnostics[0] as {
      httpStatus: number;
      oauthError: string | null;
      aadstsCodes: string[];
      errorDescriptionSanitized: string | null;
      correlationId: string | null;
      traceId: string | null;
      timestamp: string | null;
      msRequestId: string | null;
    };
    expect(diagnostic.httpStatus).toBe(400);
    expect(diagnostic.oauthError).toBe("invalid_client");
    expect(diagnostic.aadstsCodes).toContain("AADSTS7000215");
    expect(diagnostic.errorDescriptionSanitized).toContain("AADSTS7000215");
    expect(diagnostic.correlationId).toBe(CORRELATION);
    expect(diagnostic.traceId).toBe(TRACE);
    expect(diagnostic.timestamp).toBe("2026-10-03 15:00:00Z");
    expect(diagnostic.msRequestId).toBe(REQUEST_ID);
    const blob = `${serialized(diagnostics)}${logs.join("")}`;
    for (const secret of secrets) expect(blob).not.toContain(secret);
    expect(logs.join("")).not.toContain(FAKE_AUTH_CODE);
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
    });
    const result = await exchangeMicrosoftAuthorizationCode({
      code: FAKE_AUTH_CODE,
      redirectUri: "http://localhost:3007/api/engineering/m365/oauth/callback",
      env: ENV,
      fetchImpl,
      onFailureDiagnostic,
    });
    expect(result.tokenPresent).toBe(true);
    expect(result.identity.microsoftTenantId).toBe("11111111-2222-3333-4444-555555555555");
    expect(onFailureDiagnostic).not.toHaveBeenCalled();
    expect(logs.join("")).toBe("");
    const blob = serialized(result);
    expect(blob).not.toContain(FAKE_ACCESS_TOKEN);
    expect(blob).not.toContain(FAKE_REFRESH_TOKEN);
    expect(blob).not.toContain(FAKE_CLIENT_SECRET);
    expect(blob).not.toContain(FAKE_AUTH_CODE);
  });

  it("keeps fail-closed token_rejected for 401 and never emits raw Microsoft JSON", async () => {
    const diagnostics: unknown[] = [];
    const fetchImpl: typeof fetch = async () => jsonResponse(401, {
      error: "invalid_client",
      error_description: `unauthorized client_secret=${FAKE_CLIENT_SECRET}`,
      error_codes: [7000215],
    });
    await expect(exchangeMicrosoftAuthorizationCode({
      code: FAKE_AUTH_CODE,
      redirectUri: "http://localhost:3007/api/engineering/m365/oauth/callback",
      env: ENV,
      fetchImpl,
      onFailureDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    })).rejects.toBeInstanceOf(MicrosoftTokenExchangeFailure);
    await expect(exchangeMicrosoftAuthorizationCode({
      code: FAKE_AUTH_CODE,
      redirectUri: "http://localhost:3007/api/engineering/m365/oauth/callback",
      env: ENV,
      fetchImpl,
      onFailureDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    })).rejects.toThrow(/token_rejected/);
    expect(serialized(diagnostics)).not.toContain(FAKE_CLIENT_SECRET);
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
        error_description: `AADSTS7000215 client_secret=${FAKE_CLIENT_SECRET} code=${FAKE_AUTH_CODE}`,
        error_codes: [7000215],
        correlation_id: CORRELATION,
        trace_id: TRACE,
      }),
    );
    emitMicrosoftTokenExchangeFailure(diagnostic, {
      RTB_REVIEW_RUNTIME: "staging",
      EOS_M365_TOKEN_DIAGNOSTIC_PATH: path,
    });
    const written = readFileSync(path, "utf8");
    expect(written).toContain(EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT);
    expect(written).toContain("invalid_client");
    expect(written).toContain("AADSTS7000215");
    expect(written).toContain(CORRELATION);
    expect(written).toContain(TRACE);
    for (const secret of secrets) expect(written).not.toContain(secret);
    expect(logs.join("")).toContain(EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT);
    rmSync(dir, { recursive: true, force: true });
  });

  it("redacts secret-bearing Microsoft error_description text before output", () => {
    const sanitized = sanitizeMicrosoftTokenErrorDescription(
      `AADSTS7000215: Invalid client secret provided. client_secret=${FAKE_CLIENT_SECRET} code=${FAKE_AUTH_CODE} Bearer ${FAKE_ACCESS_TOKEN}`,
    );
    expect(sanitized).toContain("AADSTS7000215");
    for (const secret of secrets) expect(sanitized).not.toContain(secret);
    expect(sanitized).not.toMatch(/Bearer\s+FAKE_/);
  });
});
