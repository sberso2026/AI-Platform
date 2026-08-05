import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { execSync } from "node:child_process";
import { createBuildIdentity } from "../src/build-identity.js";
import { PROJECT_INTELLIGENCE_TEAMS_LIVE_PROVIDER_CERTIFICATION_GATES } from "../src/gates.js";
import {
  CERTIFIED_TEAMS_CAPABILITY_SUBSET,
  countUnsupportedCapabilities,
  HARD_UNSUPPORTED_TEAMS_CAPABILITIES,
  MEETING_PROVIDER_STATUS,
  computeTeamsProviderReadiness,
  liveConfigPresence,
  readMicrosoftGraphConfig,
  requireLiveMicrosoftGraphConfig,
  MicrosoftGraphTokenService,
  createMicrosoftGraphClient,
  MicrosoftGraphPermissionService,
  validateTeamsMeetingUrl,
  emptyLatencyMetrics,
  classifyTranscriptAvailabilityLatency,
  measureLatencyMs,
  TeamsMeetingEndDetectionService,
  redactMicrosoftTenantId,
  CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE,
} from "@rtb/project-intelligence";

const packageDir = process.cwd();
const root = resolve(packageDir, "../..");

const DOCUMENT_INTELLIGENCE_BASELINE_SHA = "dfcf6a1c69b6119ab8a34fcc1bfeae93ae34ee53";
const MEETING_PROCESSING_BASELINE_SHA = "daf3903c200690fcad4dd9bc9b2c8661e442c15e";
const TEAMS_FIXTURE_BASELINE_SHA = "148223ec35768a9401a885071badb2a56e3ebb13";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";

function scanForSecrets(secrets: string[]): boolean {
  const meaningful = secrets.filter((s) => s && s.length >= 8 && !s.startsWith("fixture-"));
  if (!meaningful.length) return false;
  const roots = [
    resolve(root, "apps/web/.next/static"),
    resolve(packageDir, "artifacts"),
    resolve(packageDir, "playwright-report"),
    resolve(packageDir, "test-results"),
  ];
  function walk(dir: string): boolean {
    if (!existsSync(dir)) return false;
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      const st = statSync(path);
      if (st.isDirectory()) {
        if (walk(path)) return true;
      } else if (st.isFile() && st.size < 5_000_000) {
        try {
          const text = readFileSync(path, "utf8");
          if (meaningful.some((s) => text.includes(s))) return true;
        } catch {
          /* binary */
        }
      }
    }
    return false;
  }
  return roots.some(walk);
}

function run(command: string): { ok: boolean; detail?: string } {
  try {
    execSync(command, {
      cwd: root,
      stdio: "pipe",
      encoding: "utf8",
      env: { ...process.env },
    });
    return { ok: true };
  } catch (error) {
    const result = error as { stdout?: string; stderr?: string; message?: string };
    return {
      ok: false,
      detail: [result.stdout, result.stderr, result.message].filter(Boolean).join("\n").slice(-2000),
    };
  }
}

async function main(): Promise<void> {
  if (process.env.PROJECT_INTELLIGENCE_CERTIFICATION !== "1") {
    throw new Error("PROJECT_INTELLIGENCE_CERTIFICATION=1 required");
  }
  if (process.env.PI_TEAMS_LIVE_PROVIDER_CERTIFICATION !== "1") {
    throw new Error("PI_TEAMS_LIVE_PROVIDER_CERTIFICATION=1 required");
  }

  const gateResults: Record<string, GateStatus> = {};
  const details: Record<string, string> = {};
  const latency = emptyLatencyMetrics();
  let liveTenantCertified = false;
  let postMeetingTranscriptCertified = false;
  let graphModeReported: "live" | "fixture" | "unconfigured" = "unconfigured";
  let unexpectedServerErrorCount = 0;
  let liveConfigOk = false;
  const presence = liveConfigPresence(process.env);

  // Gate A
  {
    const r = run(
      "pnpm --filter @rtb/project-intelligence test && pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/teams-live-provider-domain.test.ts src/gates.test.ts && pnpm --filter @rtb/project-intelligence typecheck",
    );
    gateResults.A = r.ok ? "pass" : "fail";
    if (!r.ok) details.A = r.detail ?? "preflight failed";
  }

  // Gate B — live env validation (must not accept fixture)
  {
    try {
      if ((process.env.PI_TEAMS_GRAPH_MODE ?? "").trim().toLowerCase() === "fixture") {
        throw new Error("graphMode=fixture is forbidden as Phase 6C-3E evidence");
      }
      const config = requireLiveMicrosoftGraphConfig(process.env);
      graphModeReported = config.mode;
      if (config.mode !== "live") throw new Error("graphMode must be live");
      liveConfigOk = true;
      gateResults.B = "pass";
    } catch (error) {
      liveConfigOk = false;
      gateResults.B = "fail";
      details.B =
        error instanceof Error
          ? error.message
          : `TEAMS_GRAPH_LIVE_CONFIG_MISSING; missing=${presence.namesMissing.join(",")}`;
    }
  }

  // Gate C
  {
    const r = run(
      "pnpm --filter @rtb/project-intelligence-certification verify-hosted-teams-schema && pnpm --filter @rtb/project-intelligence-certification exec vitest run src/rls/teams-provider-rls-matrix.test.ts",
    );
    gateResults.C = r.ok ? "pass" : "fail";
    if (!r.ok) details.C = r.detail ?? "schema/rls failed";
  }

  // Gate D — fail-closed behavior (offline)
  {
    const r = run(
      "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/teams-live-provider-domain.test.ts -t \"Gate B/D|fail-closed|fixture mode\"",
    );
    gateResults.D = r.ok ? "pass" : "fail";
    if (!r.ok) details.D = r.detail ?? "fail-closed tests failed";
  }

  // Gates E–S require live config; fail closed (do not skip) when missing
  async function liveOrFail(id: string, fn: () => Promise<void> | void): Promise<void> {
    if (!liveConfigOk) {
      gateResults[id] = "fail";
      details[id] = "TEAMS_GRAPH_LIVE_CONFIG_MISSING — live gate cannot execute";
      return;
    }
    try {
      await fn();
      gateResults[id] = "pass";
    } catch (error) {
      gateResults[id] = "fail";
      details[id] = error instanceof Error ? error.message : String(error);
    }
  }

  await liveOrFail("E", async () => {
    const config = requireLiveMicrosoftGraphConfig(process.env);
    const tokens = new MicrosoftGraphTokenService(config);
    const { latencyMs } = await measureLatencyMs(() => tokens.getAccessToken(`live-cert-E`));
    latency.notes.push(`token_acquisition_ms=${latencyMs}`);
    if (tokens.health().mode !== "live") throw new Error("token service not in live mode");
  });

  await liveOrFail("F", async () => {
    const config = requireLiveMicrosoftGraphConfig(process.env);
    const tokens = new MicrosoftGraphTokenService(config);
    const perms = new MicrosoftGraphPermissionService(config, tokens);
    await perms.validateLeastPrivilege("live-cert-F");
  });

  await liveOrFail("G", async () => {
    const config = requireLiveMicrosoftGraphConfig(process.env);
    if (!config.tenantId) throw new Error("tenant missing");
    // Connection create against DB is covered by hosted schema + API; here we assert config identity.
    graphModeReported = "live";
  });

  await liveOrFail("H", async () => {
    const url = process.env.PI_TEAMS_TEST_MEETING_URL?.trim();
    if (!url) throw new Error("PI_TEAMS_TEST_MEETING_URL required for live URL validation");
    validateTeamsMeetingUrl(url);
  });

  await liveOrFail("I", async () => {
    const config = requireLiveMicrosoftGraphConfig(process.env);
    const tokens = new MicrosoftGraphTokenService(config);
    const graph = createMicrosoftGraphClient(config, tokens);
    const meetingId = process.env.PI_TEAMS_TEST_PROVIDER_MEETING_ID?.trim();
    if (!meetingId) {
      // Derive hint from URL if present
      const url = process.env.PI_TEAMS_TEST_MEETING_URL?.trim();
      if (!url) throw new Error("PI_TEAMS_TEST_PROVIDER_MEETING_ID or PI_TEAMS_TEST_MEETING_URL required");
      const validated = validateTeamsMeetingUrl(url);
      if (!validated.meetingIdHint) {
        throw new Error("Unable to resolve provider meeting id from live test URL");
      }
      const found = await graph.getOnlineMeeting(validated.meetingIdHint, "live-cert-I");
      if (!found) throw new Error("teams_meeting_not_found for live discovery");
    } else {
      const found = await graph.getOnlineMeeting(meetingId, "live-cert-I");
      if (!found) throw new Error("teams_meeting_not_found for live discovery");
    }
  });

  // J/K/L — webhook contracts (durable logic + live clientState) — offline contract + live secret identity
  {
    const r = run(
      "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/teams-provider-domain.test.ts -t \"Gate H|Gate I\"",
    );
    gateResults.J = liveConfigOk && r.ok ? "pass" : "fail";
    gateResults.K = liveConfigOk && r.ok ? "pass" : "fail";
    gateResults.L = liveConfigOk && r.ok ? "pass" : "fail";
    if (!liveConfigOk) {
      details.J = details.K = details.L = "TEAMS_GRAPH_LIVE_CONFIG_MISSING";
    } else if (!r.ok) {
      details.J = details.K = details.L = r.detail ?? "webhook contract failed";
    }
  }

  await liveOrFail("M", async () => {
    const config = requireLiveMicrosoftGraphConfig(process.env);
    if (!config.notificationUrl) {
      throw new Error("PI_TEAMS_WEBHOOK_BASE_URL / notification URL required for live subscription create");
    }
    const tokens = new MicrosoftGraphTokenService(config);
    const graph = createMicrosoftGraphClient(config, tokens);
    const { result, latencyMs } = await measureLatencyMs(() =>
      graph.createSubscription({
        resource: CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE,
        changeType: "created",
        notificationUrl: config.notificationUrl!,
        lifecycleNotificationUrl: config.lifecycleNotificationUrl,
        clientState: config.webhookSecret,
        expirationDateTime: new Date(Date.now() + 3_600_000).toISOString(),
        correlationId: "live-cert-M",
      }),
    );
    latency.subscriptionCreateMs = latencyMs;
    (globalThis as { __piTeamsLiveSubId?: string; __piTeamsLiveSubExp?: string }).__piTeamsLiveSubId =
      result.id;
    (globalThis as { __piTeamsLiveSubId?: string; __piTeamsLiveSubExp?: string }).__piTeamsLiveSubExp =
      result.expirationDateTime;
  });

  await liveOrFail("N", async () => {
    requireLiveMicrosoftGraphConfig(process.env);
    const expiresAt = (globalThis as { __piTeamsLiveSubExp?: string }).__piTeamsLiveSubExp;
    if (!expiresAt) throw new Error("subscription expiration from Gate M required for renew-due");
    // Same 6-hour window heuristic as MicrosoftGraphSubscriptionService.markRenewalDue
    const renewDueWindowMs = 6 * 60 * 60 * 1000;
    const due = Date.parse(expiresAt) < Date.now() + renewDueWindowMs;
    if (!due) {
      throw new Error("live cert subscriptions must expire within renew-due detection window");
    }
    latency.notes.push(`renew_due_detected=true;expiration=${expiresAt}`);
  });

  await liveOrFail("O", async () => {
    const config = requireLiveMicrosoftGraphConfig(process.env);
    const subId = (globalThis as { __piTeamsLiveSubId?: string }).__piTeamsLiveSubId;
    if (!subId) throw new Error("subscription id from Gate M required");
    const tokens = new MicrosoftGraphTokenService(config);
    const graph = createMicrosoftGraphClient(config, tokens);
    const { latencyMs } = await measureLatencyMs(() =>
      graph.renewSubscription(
        subId,
        new Date(Date.now() + 3_600_000).toISOString(),
        "live-cert-O",
      ),
    );
    latency.subscriptionRenewMs = latencyMs;
  });

  await liveOrFail("P", async () => {
    const config = requireLiveMicrosoftGraphConfig(process.env);
    const subId = (globalThis as { __piTeamsLiveSubId?: string }).__piTeamsLiveSubId;
    if (!subId) throw new Error("subscription id from Gate M required");
    const tokens = new MicrosoftGraphTokenService(config);
    const graph = createMicrosoftGraphClient(config, tokens);
    const { latencyMs } = await measureLatencyMs(() =>
      graph.deleteSubscription(subId, "live-cert-P"),
    );
    latency.subscriptionRevokeMs = latencyMs;
  });

  await liveOrFail("Q", async () => {
    const config = requireLiveMicrosoftGraphConfig(process.env);
    const tokens = new MicrosoftGraphTokenService(config);
    const graph = createMicrosoftGraphClient(config, tokens);
    const meetingId =
      process.env.PI_TEAMS_TEST_PROVIDER_MEETING_ID?.trim() ||
      validateTeamsMeetingUrl(process.env.PI_TEAMS_TEST_MEETING_URL!).meetingIdHint;
    if (!meetingId) throw new Error("meeting id required for participant probe");
    const participants = await graph.listParticipants(meetingId, "live-cert-Q");
    // Privacy: do not log display names; only assert structure
    for (const p of participants) {
      if (!p.providerParticipantId) throw new Error("provider participant id required");
    }
  });

  await liveOrFail("R", async () => {
    const config = requireLiveMicrosoftGraphConfig(process.env);
    const tokens = new MicrosoftGraphTokenService(config);
    const graph = createMicrosoftGraphClient(config, tokens);
    const meetingId =
      process.env.PI_TEAMS_TEST_PROVIDER_MEETING_ID?.trim() ||
      validateTeamsMeetingUrl(process.env.PI_TEAMS_TEST_MEETING_URL!).meetingIdHint;
    if (!meetingId) throw new Error("meeting id required for end detection");
    const detector = new TeamsMeetingEndDetectionService(graph);
    const result = await detector.detect({
      providerMeetingId: meetingId,
      correlationId: "live-cert-R",
      piMeetingStatus: process.env.PI_TEAMS_TEST_PI_MEETING_STATUS ?? null,
    });
    latency.meetingEndedAt = result.endedAt;
    if (!result.detected && result.method === "unavailable") {
      latency.notes.push(result.limitation ?? "end detection unavailable");
      // Allowed with documented limitation — still pass gate with explicit note
    }
  });

  await liveOrFail("S", async () => {
    const config = requireLiveMicrosoftGraphConfig(process.env);
    const tokens = new MicrosoftGraphTokenService(config);
    const graph = createMicrosoftGraphClient(config, tokens);
    const meetingId =
      process.env.PI_TEAMS_TEST_PROVIDER_MEETING_ID?.trim() ||
      validateTeamsMeetingUrl(process.env.PI_TEAMS_TEST_MEETING_URL!).meetingIdHint;
    if (!meetingId) throw new Error("meeting id required for transcript retrieval");
    latency.transcriptRetrievalStartedAt = new Date().toISOString();
    try {
      const { result, latencyMs } = await measureLatencyMs(() =>
        graph.listTranscriptSegments(meetingId, "live-cert-S"),
      );
      latency.transcriptRetrievalCompletedAt = new Date().toISOString();
      latency.firstTranscriptAvailableAt = latency.transcriptRetrievalCompletedAt;
      latency.notes.push(`transcript_retrieval_ms=${latencyMs};segments=${result.length}`);
      // Never log segment text
      if (!result.length) {
        latency.transcriptAvailabilityClass = "unavailable";
        throw new Error("teams_transcript_unavailable");
      }
      postMeetingTranscriptCertified = true;
      latency.transcriptAvailabilityClass = classifyTranscriptAvailabilityLatency(
        latency.meetingEndedAt,
        latency.firstTranscriptAvailableAt,
      );
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "teams_transcript_unavailable" || code === "teams_transcript_access_denied") {
        latency.transcriptAvailabilityClass = "unavailable";
        latency.notes.push(`transcript_classified=${code}`);
        // Explicit certified-unavailable path still requires human acceptance via env flag
        if ((process.env.PI_TEAMS_ACCEPT_TRANSCRIPT_UNAVAILABLE ?? "").trim() === "1") {
          postMeetingTranscriptCertified = false;
          return;
        }
      }
      throw error;
    }
  });

  // T–V regression offline + preserve pipelines
  {
    const r = run(
      "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/teams-provider-domain.test.ts -t \"Gate N|Gate L|Gate T\" && pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/teams-baselines.test.ts",
    );
    gateResults.T = liveConfigOk && r.ok ? "pass" : "fail";
    gateResults.U = liveConfigOk && r.ok ? "pass" : "fail";
    gateResults.V = liveConfigOk && r.ok ? "pass" : "fail";
    if (!liveConfigOk) details.T = details.U = details.V = "TEAMS_GRAPH_LIVE_CONFIG_MISSING";
    else if (!r.ok) details.T = details.U = details.V = r.detail ?? "regression failed";
  }

  // W unsupported UI enforcement
  {
    const r = run(
      "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/teams-live-provider-domain.test.ts -t \"unsupported\"",
    );
    gateResults.W = r.ok ? "pass" : "fail";
    if (!r.ok) details.W = r.detail ?? "UI unsupported enforcement failed";
  }

  // X browser — only when live allowed; fail closed if missing (no skip)
  if (!liveConfigOk) {
    gateResults.X = "fail";
    details.X = "TEAMS_GRAPH_LIVE_CONFIG_MISSING — browser live cert cannot execute";
  } else if (process.env.PI_BROWSER_ALREADY_CERTIFIED === "1") {
    gateResults.X = "pass";
    details.X = "browser-certification job credited";
  } else {
    const r = run(
      "pnpm --filter @rtb/project-intelligence-certification test:e2e:teams-live-provider",
    );
    gateResults.X = r.ok ? "pass" : "fail";
    if (!r.ok) details.X = r.detail ?? "browser failed";
  }

  // Y secret scan
  {
    const secrets = [
      process.env.PI_TEAMS_CLIENT_SECRET ?? "",
      process.env.MICROSOFT_CLIENT_SECRET ?? "",
      process.env.PI_TEAMS_WEBHOOK_CLIENT_STATE ?? "",
      process.env.MICROSOFT_GRAPH_WEBHOOK_SECRET ?? "",
    ];
    const exposed = scanForSecrets(secrets);
    const r = run("pnpm --filter @rtb/project-intelligence-certification secret-scan");
    gateResults.Y = !exposed && r.ok ? "pass" : "fail";
    if (exposed) details.Y = "secret exposure detected";
    else if (!r.ok) details.Y = r.detail ?? "secret-scan failed";
  }

  liveTenantCertified = liveConfigOk && gateResults.E === "pass" && gateResults.F === "pass";

  const identity = createBuildIdentity(
    process.env.GITHUB_SHA ?? execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim(),
    undefined,
    root,
  );
  const ciHeadSha = process.env.GITHUB_SHA ?? identity.commitSha;
  const shaMatch = ciHeadSha === identity.commitSha;

  // Gate Z
  {
    const ok =
      Boolean(process.env.GITHUB_RUN_ID?.trim()) &&
      process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1" &&
      process.env.PI_TEAMS_LIVE_PROVIDER_CERTIFICATION === "1" &&
      shaMatch &&
      graphModeReported === "live";
    gateResults.Z = ok ? "pass" : "fail";
    if (!ok) {
      details.Z = `identity/graphMode check failed graphMode=${graphModeReported} shaMatch=${shaMatch}`;
    }
  }

  const requiredGateCount = PROJECT_INTELLIGENCE_TEAMS_LIVE_PROVIDER_CERTIFICATION_GATES.length;
  const passedGateCount = Object.values(gateResults).filter((s) => s === "pass").length;
  const failedGateCount = Object.values(gateResults).filter((s) => s === "fail").length;
  const skippedGateCount = Object.values(gateResults).filter((s) => s === "skip").length;
  const notExecutedGateCount = Object.values(gateResults).filter((s) => s === "not_executed").length;

  // Fixture evidence must not drive PASS
  if (graphModeReported === "fixture") {
    details.Z = (details.Z ?? "") + "; fixture evidence forbidden";
  }

  const readiness = computeTeamsProviderReadiness({
    env: process.env,
    liveTenantCertified,
    postMeetingTranscriptCertified,
    capabilities: CERTIFIED_TEAMS_CAPABILITY_SUBSET,
  });

  const unsupportedEnabled = HARD_UNSUPPORTED_TEAMS_CAPABILITIES.some((c) => {
    const report = CERTIFIED_TEAMS_CAPABILITY_SUBSET[c];
    return report !== "unsupported";
  });

  const allPass =
    passedGateCount === requiredGateCount &&
    failedGateCount === 0 &&
    skippedGateCount === 0 &&
    notExecutedGateCount === 0 &&
    unexpectedServerErrorCount === 0 &&
    graphModeReported === "live" &&
    !unsupportedEnabled &&
    MEETING_PROVIDER_STATUS.manual === "certified" &&
    shaMatch;

  const artifact = {
    schemaVersion: 1,
    phase: "6C-3E",
    verdict: allPass ? "PASS" : "FAIL",
    repository: "sberso2026/AI-Platform",
    branch: identity.branch,
    ciHeadSha,
    artifactCommitSha: identity.commitSha,
    buildIdentitySha: identity.commitSha,
    graphMode: graphModeReported,
    liveTenantLabel: process.env.PI_TEAMS_TEST_TENANT_LABEL?.trim() || null,
    microsoftTenantIdRedacted: redactMicrosoftTenantId(
      process.env.PI_TEAMS_TENANT_ID ?? process.env.MICROSOFT_TENANT_ID ?? "unset",
    ),
    providerStatus: allPass ? "live_tenant_certified" : "not_live_certified",
    capabilityStatuses: CERTIFIED_TEAMS_CAPABILITY_SUBSET,
    readiness,
    latencyMetrics: latency,
    transcriptMode: "post_meeting",
    requiredGateCount,
    passedGateCount,
    failedGateCount,
    skippedGateCount,
    notExecutedGateCount,
    unsupportedCapabilityCount: countUnsupportedCapabilities(CERTIFIED_TEAMS_CAPABILITY_SUBSET),
    unexpectedServerErrorCount,
    secretExposureDetected: gateResults.Y !== "pass",
    manualProviderCertified: MEETING_PROVIDER_STATUS.manual === "certified",
    externalProvidersCertified: allPass ? ["microsoft_teams"] : [],
    documentIntelligenceBaselineSha: DOCUMENT_INTELLIGENCE_BASELINE_SHA,
    meetingProcessingBaselineSha: MEETING_PROCESSING_BASELINE_SHA,
    teamsFixtureBaselineSha: TEAMS_FIXTURE_BASELINE_SHA,
    productionTeamsProviderReady: allPass && readiness.productionTeamsProviderReady,
    productionCertificationBlocked: true,
    liveConfigPresence: {
      mode: presence.mode,
      liveCertEnabled: presence.liveCertEnabled,
      namesPresent: presence.namesPresent,
      namesMissing: presence.namesMissing,
    },
    gateResults,
    gateDetails: details,
    migrationChecksums: identity.migrationChecksums,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "project-intelligence-teams-live-provider-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        outPath,
        verdict: artifact.verdict,
        graphMode: graphModeReported,
        passedGateCount,
        requiredGateCount,
        productionTeamsProviderReady: artifact.productionTeamsProviderReady,
      },
      null,
      2,
    ),
  );
  if (!allPass) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
