import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../../digital-thread/fixture";
import { createMemoryInformationStore } from "../../information-intelligence/memory-store";
import { EngineeringInformationService } from "../../information-intelligence/service";
import { createMemoryWorkContextStore } from "../../work-context/memory-store";
import { EngineeringWorkContextService } from "../../work-context/service";
import { createMemoryM365Store } from "./memory-store";
import { MockGraphPort } from "./graph";
import { createTestM365ConnectorService } from "./service";
import type { TrustedMicrosoftIdentity } from "./onboarding";
import {
  EOS_M365_OAUTH_CALLBACK_FAILURE_EVENT,
  EOS_M365_OAUTH_CALLBACK_FAILURE_FILENAME,
  EOS_M365_OAUTH_DIAGNOSTIC_WRITE_FAILURE_EVENT,
  EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT,
  EOS_M365_TOKEN_EXCHANGE_FAILURE_FILENAME,
  MICROSOFT_TOKEN_ENDPOINT_CLASSIFICATION,
  MicrosoftTokenExchangeFailure,
  emitMicrosoftOAuthCallbackFailure,
  runAuthorizedMicrosoftOAuthCallback,
} from "./oauth";

const FAKE_CLIENT_SECRET = "FAKE_CLIENT_SECRET_VALUE_DO_NOT_LEAK";
const FAKE_AUTH_CODE = "FAKE_AUTH_CODE_DO_NOT_LEAK";
const FAKE_ACCESS_TOKEN = "FAKE_ACCESS_TOKEN_DO_NOT_LEAK";
const FAKE_REFRESH_TOKEN = "FAKE_REFRESH_TOKEN_DO_NOT_LEAK";
const FAKE_ID_TOKEN_LEAK = "FAKE_ID_TOKEN_DO_NOT_LEAK";
const FAKE_OAUTH_STATE = "FAKE_OAUTH_STATE_DO_NOT_LEAK";
const secrets = [FAKE_CLIENT_SECRET, FAKE_AUTH_CODE, FAKE_ACCESS_TOKEN, FAKE_REFRESH_TOKEN, FAKE_ID_TOKEN_LEAK, FAKE_OAUTH_STATE];

const identity: TrustedMicrosoftIdentity = {
  microsoftTenantId: "11111111-2222-3333-4444-555555555555",
  signedInUserId: "oid-admin-1",
  organisationName: "Contoso Engineering",
  adminConsentGranted: true,
  source: "microsoft_token",
};

function admin() {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action: "settings.write", seatRequired: true },
  });
}

function stubClient() {
  return { from() { return this; } } as never;
}

function assertNoSecrets(blob: string) {
  for (const secret of secrets) expect(blob).not.toContain(secret);
  expect(blob).not.toMatch(/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\./);
}

function tokenFailure(layer: "NETWORK_EXCEPTION" | "MICROSOFT_HTTP_ERROR"): MicrosoftTokenExchangeFailure {
  return new MicrosoftTokenExchangeFailure("token_http_400", {
    layer,
    httpStatus: 400,
    oauthError: "invalid_client",
    aadstsCodes: ["AADSTS7000215"],
    errorDescriptionSanitized: "invalid client",
    correlationId: null,
    traceId: null,
    timestamp: "2026-10-04T03:00:00.000Z",
    msRequestId: null,
    endpoint: MICROSOFT_TOKEN_ENDPOINT_CLASSIFICATION,
    errorName: "HttpError",
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("EOS-A16C Microsoft OAuth callback-boundary diagnostic", () => {
  it("writes the staging callback diagnostic file on Windows tmpdir and reads it back", () => {
    const logs: string[] = [];
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      logs.push(String(message));
    });
    const path = join(tmpdir(), EOS_M365_OAUTH_CALLBACK_FAILURE_FILENAME);
    emitMicrosoftOAuthCallbackFailure({
      stage: "TOKEN_EXCHANGE",
      error: new Error(`synthetic_callback_failure client_secret=${FAKE_CLIENT_SECRET} code=${FAKE_AUTH_CODE} state=${FAKE_OAUTH_STATE}`),
    }, {
      RTB_REVIEW_RUNTIME: "staging",
      EOS_M365_CALLBACK_DIAGNOSTIC_PATH: path,
    });
    expect(existsSync(path)).toBe(true);
    const written = readFileSync(path, "utf8");
    const parsed = JSON.parse(written) as { event: string; stage: string };
    expect(parsed.event).toBe(EOS_M365_OAUTH_CALLBACK_FAILURE_EVENT);
    expect(parsed.stage).toBe("TOKEN_EXCHANGE");
    expect(logs.join("")).toContain(EOS_M365_OAUTH_CALLBACK_FAILURE_EVENT);
    assertNoSecrets(`${written}${logs.join("")}`);
    unlinkSync(path);
  });

  it("emits CALLBACK_FAILURE at TOKEN_EXCHANGE when the token-exchange function throws a generic Error", async () => {
    const diagnostics: Array<{ stage: string }> = [];
    const dir = mkdtempSync(join(tmpdir(), "eos-m365-cb-"));
    const path = join(dir, "callback-failure.json");
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      diagnostics.push(JSON.parse(String(message)) as { stage: string });
    });
    await expect(runAuthorizedMicrosoftOAuthCallback({
      code: FAKE_AUTH_CODE,
      adminConsent: "",
      tenant: "",
      redirectUri: "http://localhost:3007/api/engineering/m365/oauth/callback",
      env: { RTB_REVIEW_RUNTIME: "staging", EOS_M365_CALLBACK_DIAGNOSTIC_PATH: path },
      exchangeImpl: async () => {
        throw new Error(`exchange_failed client_secret=${FAKE_CLIENT_SECRET} access_token=${FAKE_ACCESS_TOKEN}`);
      },
      completeMicrosoftSignIn: async () => undefined,
    })).rejects.toThrow(/exchange_failed/);
    const written = JSON.parse(readFileSync(path, "utf8")) as { event: string; stage: string; nestedTokenExchangeFailure: boolean };
    expect(written.event).toBe(EOS_M365_OAUTH_CALLBACK_FAILURE_EVENT);
    expect(written.stage).toBe("TOKEN_EXCHANGE");
    expect(written.nestedTokenExchangeFailure).toBe(false);
    expect(diagnostics[0]?.stage).toBe("TOKEN_EXCHANGE");
    assertNoSecrets(`${readFileSync(path, "utf8")}${JSON.stringify(diagnostics)}`);
    rmSync(dir, { recursive: true, force: true });
  });

  it("references only the safe nested token-exchange layer when MicrosoftTokenExchangeFailure is thrown", async () => {
    const dir = mkdtempSync(join(tmpdir(), "eos-m365-cb-"));
    const path = join(dir, "callback-failure.json");
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(runAuthorizedMicrosoftOAuthCallback({
      code: FAKE_AUTH_CODE,
      adminConsent: "",
      tenant: "",
      redirectUri: "http://localhost:3007/api/engineering/m365/oauth/callback",
      env: { RTB_REVIEW_RUNTIME: "staging", EOS_M365_CALLBACK_DIAGNOSTIC_PATH: path },
      exchangeImpl: async () => {
        throw tokenFailure("MICROSOFT_HTTP_ERROR");
      },
      completeMicrosoftSignIn: async () => undefined,
    })).rejects.toBeInstanceOf(MicrosoftTokenExchangeFailure);
    const written = JSON.parse(readFileSync(path, "utf8")) as {
      stage: string;
      nestedTokenExchangeFailure: boolean;
      nestedLayer: string;
      errorClass: string;
    };
    expect(written.stage).toBe("TOKEN_EXCHANGE");
    expect(written.nestedTokenExchangeFailure).toBe(true);
    expect(written.nestedLayer).toBe("MICROSOFT_HTTP_ERROR");
    expect(written.errorClass).toBe("MicrosoftTokenExchangeFailure");
    expect(readFileSync(path, "utf8")).not.toContain(EOS_M365_TOKEN_EXCHANGE_FAILURE_EVENT);
    expect(EOS_M365_TOKEN_EXCHANGE_FAILURE_FILENAME).not.toEqual(EOS_M365_OAUTH_CALLBACK_FAILURE_FILENAME);
    assertNoSecrets(readFileSync(path, "utf8"));
    rmSync(dir, { recursive: true, force: true });
  });

  it("identifies CONNECTION_COMPLETION when token exchange succeeds and sign-in throws before persistence", async () => {
    const dir = mkdtempSync(join(tmpdir(), "eos-m365-cb-"));
    const path = join(dir, "callback-failure.json");
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(runAuthorizedMicrosoftOAuthCallback({
      code: FAKE_AUTH_CODE,
      adminConsent: "",
      tenant: "",
      redirectUri: "http://localhost:3007/api/engineering/m365/oauth/callback",
      env: { RTB_REVIEW_RUNTIME: "staging", EOS_M365_CALLBACK_DIAGNOSTIC_PATH: path },
      exchangeImpl: async () => ({ identity, tokenPresent: true }),
      completeMicrosoftSignIn: async () => {
        throw new Error("workspace_required");
      },
    })).rejects.toThrow(/workspace_required/);
    expect(JSON.parse(readFileSync(path, "utf8")).stage).toBe("CONNECTION_COMPLETION");
    rmSync(dir, { recursive: true, force: true });
  });

  it("identifies CONNECTION_PERSISTENCE when saveConnection throws", async () => {
    const dir = mkdtempSync(join(tmpdir(), "eos-m365-cb-"));
    const path = join(dir, "callback-failure.json");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const workStore = createMemoryWorkContextStore();
    const infoStore = createMemoryInformationStore();
    const m365Store = createMemoryM365Store();
    m365Store.saveConnection = async () => {
      throw new Error("persistence_failed");
    };
    const work = new EngineeringWorkContextService(stubClient(), workStore);
    const information = new EngineeringInformationService(stubClient(), infoStore);
    const connector = createTestM365ConnectorService({
      work,
      information,
      store: m365Store,
      graph: new MockGraphPort(),
      onboardingApp: { applicationId: "rtb-multitenant-app", credentialSecretId: "secret:rtb-m365-multitenant", configured: true },
    });
    await expect(runAuthorizedMicrosoftOAuthCallback({
      code: FAKE_AUTH_CODE,
      adminConsent: "",
      tenant: "",
      redirectUri: "http://localhost:3007/api/engineering/m365/oauth/callback",
      env: { RTB_REVIEW_RUNTIME: "staging", EOS_M365_CALLBACK_DIAGNOSTIC_PATH: path },
      exchangeImpl: async () => ({ identity, tokenPresent: true }),
      completeMicrosoftSignIn: (nextIdentity, onStage) => connector.completeMicrosoftSignIn(admin(), CRUSHER_FEED_TENANT, nextIdentity, onStage),
    })).rejects.toThrow(/persistence_failed/);
    expect(JSON.parse(readFileSync(path, "utf8")).stage).toBe("CONNECTION_PERSISTENCE");
    rmSync(dir, { recursive: true, force: true });
  });

  it("emits EOS_M365_OAUTH_DIAGNOSTIC_WRITE_FAILURE when the callback diagnostic file cannot be written", () => {
    const logs: string[] = [];
    emitMicrosoftOAuthCallbackFailure({
      stage: "TOKEN_EXCHANGE",
      error: new Error("synthetic_write_failure"),
    }, {
      RTB_REVIEW_RUNTIME: "staging",
      EOS_M365_CALLBACK_DIAGNOSTIC_PATH: join(tmpdir(), "eos-m365-callback-write-fail.json"),
    }, {
      writeFile: () => {
        throw new Error(`EACCES client_secret=${FAKE_CLIENT_SECRET}`);
      },
      consoleError: (message: unknown) => {
        logs.push(String(message));
      },
    });
    expect(logs.some((row) => row.includes(EOS_M365_OAUTH_DIAGNOSTIC_WRITE_FAILURE_EVENT))).toBe(true);
    expect(logs.some((row) => row.includes(EOS_M365_OAUTH_CALLBACK_FAILURE_EVENT))).toBe(true);
    assertNoSecrets(logs.join(""));
  });

  it("does not write a callback diagnostic on successful completion", async () => {
    const logs: string[] = [];
    vi.spyOn(console, "error").mockImplementation((message: unknown) => {
      logs.push(String(message));
    });
    const dir = mkdtempSync(join(tmpdir(), "eos-m365-cb-"));
    const path = join(dir, "callback-failure.json");
    await runAuthorizedMicrosoftOAuthCallback({
      code: FAKE_AUTH_CODE,
      adminConsent: "",
      tenant: "",
      redirectUri: "http://localhost:3007/api/engineering/m365/oauth/callback",
      env: { RTB_REVIEW_RUNTIME: "staging", EOS_M365_CALLBACK_DIAGNOSTIC_PATH: path },
      exchangeImpl: async () => ({ identity, tokenPresent: true }),
      completeMicrosoftSignIn: async () => ({ setupState: "CONNECTED_NO_SITE" }),
    });
    expect(existsSync(path)).toBe(false);
    expect(logs.join("")).not.toContain(EOS_M365_OAUTH_CALLBACK_FAILURE_EVENT);
    rmSync(dir, { recursive: true, force: true });
  });
});
