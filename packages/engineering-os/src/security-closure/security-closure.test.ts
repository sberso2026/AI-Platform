import { describe, expect, it } from "vitest";
import {
  assertBreakGlassPrivileges,
  openBreakGlassSession,
  recordBreakGlassUse,
  revokeBreakGlass,
} from "./break-glass";
import {
  assertPlatformRestorePassed,
  executeBoundedPlatformRestore,
} from "./backup-restore";
import {
  assertClassificationAwareAiOrThrow,
  evaluateClassificationAwareAiPolicy,
} from "./classification-ai-policy";
import {
  assertIncidentFixturesComplete,
  PHASE_14D_INCIDENT_FIXTURES,
} from "./incident-fixtures";
import {
  assertPrivilegedMfaOrThrow,
  evaluatePrivilegedMfa,
} from "./privileged-mfa";
import { sanitizeLogRecord } from "./sensitive-logging";
import {
  CriticalDependencyVulnerabilityUnresolved,
  engineeringOsSecurityGaGatePassed,
  getSecurityClosureDeclaration,
  securityClosureRequiredBeforeGa,
} from "./flags";

describe("Phase 14D security closure", () => {
  it("S01 fail-closes privileged MFA without AAL2", () => {
    expect(
      evaluatePrivilegedMfa({
        platformAdmin: true,
        aal: "aal1",
        amr: ["password"],
      }).allowed,
    ).toBe(false);
    expect(
      evaluatePrivilegedMfa({
        roleSlug: "owner",
        aal: "aal2",
        amr: ["password", "totp"],
      }).allowed,
    ).toBe(true);
    expect(() =>
      assertPrivilegedMfaOrThrow({ roleSlug: "owner", aal: "aal1" }),
    ).toThrow(/Privileged operation denied/);
  });

  it("S01 break-glass requires reason, approver, audit, and revocation trail", () => {
    const requestedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    let session = openBreakGlassSession({
      request: {
        requestId: "bg-1",
        principalId: "ops-1",
        eligibility: "security_on_call",
        reason: "SEV1 production outage investigation",
        requestedPrivileges: ["platform_admin.support"],
        requestedAt,
        expiresAt,
      },
      approvedBy: "sec-2",
      actorId: "ops-1",
    });
    session = recordBreakGlassUse(session, "ops-1", "read_tenant_isolation_metrics");
    session = revokeBreakGlass(session, "sec-2", "incident contained");
    expect(session.auditTrail.some((e) => e.action === "used")).toBe(true);
    expect(session.auditTrail.some((e) => e.action === "post_use_review")).toBe(true);
    expect(session.active).toBe(false);
    expect(() => assertBreakGlassPrivileges(["root.shell"])).toThrow();
  });

  it("S03 incident fixtures cover required scenarios", () => {
    assertIncidentFixturesComplete();
    expect(PHASE_14D_INCIDENT_FIXTURES).toHaveLength(5);
  });

  it("S05 classification-aware AI fails closed for RESTRICTED and UNKNOWN", () => {
    expect(
      evaluateClassificationAwareAiPolicy({
        classification: "RESTRICTED",
        providerId: "openai",
        providerApproved: true,
        trainingUseRequested: false,
        operation: "summarize",
        tenantRef: "t1",
        workspaceRef: "w1",
      }).allowed,
    ).toBe(false);
    expect(
      evaluateClassificationAwareAiPolicy({
        classification: "UNKNOWN",
        providerId: "openai",
        providerApproved: true,
        trainingUseRequested: false,
        operation: "summarize",
        tenantRef: "t1",
        workspaceRef: "w1",
      }).allowed,
    ).toBe(false);
    expect(() =>
      assertClassificationAwareAiOrThrow({
        classification: "ENGINEERING_SENSITIVE",
        providerId: "openai",
        providerApproved: true,
        trainingUseRequested: false,
        operation: "summarize",
        tenantRef: "t1",
        workspaceRef: "w1",
      }),
    ).toThrow(/sensitive_requires_explicit_provider_policy/);
    expect(
      evaluateClassificationAwareAiPolicy({
        classification: "ENGINEERING_SENSITIVE",
        providerId: "openai",
        providerApproved: true,
        trainingUseRequested: false,
        operation: "summarize",
        tenantRef: "t1",
        workspaceRef: "w1",
        sensitiveProviderPolicyAllow: true,
      }).allowed,
    ).toBe(true);
  });

  it("S05 omits sensitive payloads from logs", () => {
    const sanitized = sanitizeLogRecord({
      classification: "ENGINEERING_SENSITIVE",
      message: "model inference",
      fields: { prompt: "secret engineering content", api_key: "sk-test" },
      auditRefs: { requestId: "r1" },
    });
    expect(sanitized.payloadOmitted).toBe(true);
    expect(sanitized.fields).toEqual({});
    expect(sanitized.auditRefs.requestId).toBe("r1");
  });

  it("S06 bounded restore certifies integrity and truthful RPO/RTO status", () => {
    const snapshot = {
      tenantRef: "tenant-a",
      workspaceRef: "ws-a",
      schemaVersion: "batch_90_anchor",
      rowFingerprints: { profiles: "abc", tenants: "def" },
      criticalStateReadable: true,
    };
    const result = executeBoundedPlatformRestore({
      manifest: {
        backupId: "bk-fixture-1",
        createdAt: new Date().toISOString(),
        source: "fixture",
        includesDatabase: true,
        includesObjectStorage: true,
        includesCriticalConfig: true,
        migrationLineageAnchor: "batch_90_anchor",
      },
      preRestore: snapshot,
      postRestore: snapshot,
      startedAtMs: 1000,
      finishedAtMs: 1500,
    });
    assertPlatformRestorePassed(result);
    expect(result.rpoStatus).toBe("DEFINED_NOT_TESTED");
    expect(result.rtoStatus).toBe("MEASURED");
    expect(result.measuredRestoreDurationMs).toBe(500);
  });

  it("declares GA security gate passed after closure", () => {
    const d = getSecurityClosureDeclaration();
    expect(d.engineeringOsSecurityGaGatePassed).toBe(true);
    expect(securityClosureRequiredBeforeGa).toBe(false);
    expect(engineeringOsSecurityGaGatePassed).toBe(true);
    expect(CriticalDependencyVulnerabilityUnresolved).toBe(false);
    expect(d.PrivilegedMfaPolicyReady).toBe(true);
    expect(d.PlatformRestoreTestPassed).toBe(true);
  });
});
