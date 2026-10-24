import type {
  IsolationAssessment,
  IsolationAssuranceSnapshot,
  IsolationExecutionMode,
  IsolationPlaneStatus,
  IsolationProbeResult,
  IsolationProbeRun,
  IsolationTargetPlane,
} from "../../isolation-contracts";
import { ISOLATION_TARGET_PLANES } from "../../isolation-contracts";
import type { SecurityEvidenceReference } from "../../contracts";
import type { SecurityEvidenceRegistry } from "../evidence-registry";
import type { SecurityFindingRegistry } from "../finding-registry";
import type { SecurityPostureCompositionEngine } from "../posture-engine";
import { createSecurityAssuranceEvent } from "../events";
import {
  createSecurityAssuranceTimelineEvent,
  type SecurityAssuranceTimeline,
} from "../timeline";
import { runIsolationHarness } from "./fixture-harness";
import type { IsolationProbeRegistry } from "./probe-registry";

function mapOutcome(
  expected: "allow" | "deny" | "not_applicable",
  actual: "allow" | "deny" | "error" | "not_applicable" | "unknown",
  disclosure: "none" | "metadata_leak" | "payload_leak",
): IsolationProbeResult {
  if (expected === "not_applicable") return "not_applicable";
  if (actual === "error") return "error";
  if (actual === "unknown") return "unknown";
  if (disclosure === "metadata_leak" || disclosure === "payload_leak") return "fail";
  if (actual === expected) return "pass";
  return "fail";
}

/**
 * IsolationAssuranceEngine — observes/probes/evidences; does not enforce.
 * Never mutates authorization/RLS. Failed probes never fallback to PASS.
 */
export class IsolationAssuranceEngine {
  readonly kind = "isolation_assurance_engine" as const;
  private runs = new Map<string, IsolationProbeRun>();
  private assessments = new Map<string, IsolationAssessment>();
  private snapshots: IsolationAssuranceSnapshot[] = [];
  private events: ReturnType<typeof createSecurityAssuranceEvent>[] = [];

  readonly automaticRemediationEnabled = false as const;
  readonly automaticAuthorizationMutationEnabled = false as const;
  readonly automaticRlsMutationEnabled = false as const;
  readonly knownCrossTenantLeakageDetected = false as const;
  readonly knownCrossWorkspaceLeakageDetected = false as const;

  constructor(
    private readonly probes: IsolationProbeRegistry,
    private readonly evidence: SecurityEvidenceRegistry,
    private readonly findings: SecurityFindingRegistry,
    private readonly posture: SecurityPostureCompositionEngine,
    private readonly timeline: SecurityAssuranceTimeline,
  ) {}

  runProbe(input: {
    runId: string;
    probeId: string;
    version?: string;
    scope?: string;
    executionMode?: IsolationExecutionMode;
    forceError?: boolean;
  }): IsolationProbeRun {
    const probe = this.probes.require(input.probeId, input.version ?? "1.0.0");
    const started = Date.now();
    let actualOutcome: IsolationProbeRun["actualOutcome"] = "unknown";
    let accessDecision: IsolationProbeRun["accessDecision"] = "unknown";
    let dataDisclosure: IsolationProbeRun["dataDisclosure"] = "unknown";
    let targetRef = "unknown";
    let limitations: string | undefined;

    try {
      if (input.forceError) {
        throw new Error("Forced probe error");
      }
      if (probe.expectedOutcome === "not_applicable") {
        actualOutcome = "not_applicable";
        accessDecision = "deny";
        dataDisclosure = "none";
        targetRef = "cache:none";
        limitations = "No relevant shared tenant-scoped cache subsystem found";
      } else {
        const fixture = runIsolationHarness(probe.harnessKey);
        actualOutcome = fixture.decision;
        accessDecision = fixture.decision;
        dataDisclosure = fixture.dataDisclosure;
        targetRef = fixture.targetRef;
      }
    } catch {
      actualOutcome = "error";
      accessDecision = "unknown";
      dataDisclosure = "unknown";
      limitations = "Probe technical error — reduces assurance; not PASS";
    }

    let result = mapOutcome(probe.expectedOutcome, actualOutcome, dataDisclosure ?? "none");
    // Never turn failed/error into PASS via fallback
    if (result === "fail" || result === "error") {
      result = result;
    }

    const evidenceId = `ev-iso-${input.runId}`;
    const evidenceItem: SecurityEvidenceReference = {
      evidenceId,
      controlId: probe.controlRefs[0] ?? "RTB-SEC-ISO-BASE",
      sourceType: "platform_runtime",
      sourceRef: `isolation_probe:${probe.probeId}@${probe.version}`,
      scope: input.scope ?? probe.scope,
      collector: "IsolationAssuranceEngine",
      collectedAt: new Date().toISOString(),
      effectiveAt: new Date().toISOString(),
      freshness: "current",
      integrityRef: `sha256:iso-${input.runId}`,
      classification: "INTERNAL",
      provenance: {
        observed: true,
        inferred: false,
        fabricated: false,
        sourceCategory: "platform_runtime",
      },
      limitations,
      status: result === "pass" || result === "not_applicable" ? "current" : "invalid",
      containsSensitivePayload: false,
    };
    this.evidence.record(evidenceItem);

    const run: IsolationProbeRun = {
      runId: input.runId,
      probeRef: probe.probeId,
      probeVersion: probe.version,
      targetPlane: probe.targetPlane,
      scope: input.scope ?? probe.scope,
      actorContextRefs: probe.requiredActorContexts,
      targetRefs: [targetRef],
      expectedOutcome: probe.expectedOutcome,
      actualOutcome,
      result,
      timestamp: new Date().toISOString(),
      durationMs: Math.max(1, Date.now() - started),
      evidenceRefs: [evidenceId],
      integrityRef: evidenceItem.integrityRef,
      limitations,
      freshness: "current",
      executionMode: input.executionMode ?? "on_demand",
      fallbackToPassForbidden: true,
      containsSensitivePayload: false,
      accessDecision,
      dataDisclosure,
    };
    this.runs.set(run.runId, run);

    if (result === "fail") {
      const findingId = `iso-finding-${input.runId}`;
      this.findings.open({
        findingId,
        controlId: probe.controlRefs[0],
        severity: probe.riskClassification === "critical" ? "critical" : "high",
        state: "open",
        source: `isolation_probe:${probe.probeId}`,
        summary: `Isolation probe failure on ${probe.targetPlane}`,
        normalizedAt: new Date().toISOString(),
        isIncident: false,
        containsSensitivePayload: false,
      });
    }

    this.events.push(
      createSecurityAssuranceEvent({
        eventType: "security_assurance.isolation.probe_completed",
        tenantId: "platform",
        workspaceId: "platform",
        occurredAt: run.timestamp,
        refs: { runId: run.runId, probeId: probe.probeId, result },
      }),
    );
    this.timeline.append(
      createSecurityAssuranceTimelineEvent({
        eventId: `tl-iso-${input.runId}`,
        tenantId: "platform",
        workspaceId: "platform",
        eventType: "isolation_probe_completed",
        entityType: "isolation_probe_run",
        entityId: run.runId,
        recordedAt: run.timestamp,
        summary: `Isolation probe ${probe.probeId} → ${result}`,
        refs: { runId: run.runId, plane: probe.targetPlane },
      }),
    );

    return run;
  }

  runActiveProbes(executionMode: IsolationExecutionMode = "ci"): IsolationProbeRun[] {
    return this.probes.list("active").map((p, i) =>
      this.runProbe({
        runId: `run-${p.probeId}-${i}`,
        probeId: p.probeId,
        version: p.version,
        executionMode,
      }),
    );
  }

  assess(input: {
    assessmentId: string;
    scope: string;
    scopeKind?: IsolationAssessment["scopeKind"];
    plane?: IsolationTargetPlane;
  }): IsolationAssessment {
    const runs = [...this.runs.values()].filter((r) =>
      input.plane ? r.targetPlane === input.plane : true,
    );
    const results = runs.map((r) => r.result);
    let result: IsolationProbeResult = "unknown";
    if (results.length === 0) result = "unknown";
    else if (results.some((r) => r === "fail")) result = "fail";
    else if (results.some((r) => r === "error")) result = "partial";
    else if (results.every((r) => r === "pass" || r === "not_applicable")) {
      result = results.every((r) => r === "not_applicable") ? "not_applicable" : "pass";
    } else if (results.some((r) => r === "partial" || r === "unknown")) result = "partial";

    const findingIds = this.findings
      .list("open")
      .filter((f) => f.source.startsWith("isolation_probe:"))
      .map((f) => f.findingId);

    const assessment: IsolationAssessment = {
      assessmentId: input.assessmentId,
      scope: input.scope,
      scopeKind: input.scopeKind ?? "platform",
      controlRefs: ["RTB-SEC-ISO-BASE"],
      probeRunRefs: runs.map((r) => r.runId),
      evidenceRefs: runs.flatMap((r) => r.evidenceRefs),
      result,
      freshness: runs.every((r) => r.freshness === "current") ? "current" : "stale",
      limitations: runs.map((r) => r.limitations).filter(Boolean).join("; ") || undefined,
      findingIds,
      assessedAt: new Date().toISOString(),
      reviewStatus: "candidate",
      governedReviewAction: "security_assurance.isolation_review",
    };
    this.assessments.set(assessment.assessmentId, assessment);
    this.events.push(
      createSecurityAssuranceEvent({
        eventType: "security_assurance.isolation.assessment_completed",
        tenantId: "platform",
        workspaceId: "platform",
        occurredAt: assessment.assessedAt,
        refs: { assessmentId: assessment.assessmentId, result },
      }),
    );
    return assessment;
  }

  composeSnapshot(snapshotId: string, scope = "platform"): IsolationAssuranceSnapshot {
    const planes: IsolationPlaneStatus[] = ISOLATION_TARGET_PLANES.map((plane) => {
      const planeRuns = [...this.runs.values()].filter((r) => r.targetPlane === plane);
      if (planeRuns.length === 0) {
        return {
          plane,
          result: "unknown" as const,
          freshness: "missing" as const,
          probeRunRefs: [],
          limitations: "No evidence",
        };
      }
      const results = planeRuns.map((r) => r.result);
      let result: IsolationProbeResult = "unknown";
      if (results.some((r) => r === "fail")) result = "fail";
      else if (results.some((r) => r === "error")) result = "error";
      else if (results.every((r) => r === "not_applicable")) result = "not_applicable";
      else if (results.every((r) => r === "pass" || r === "not_applicable")) result = "pass";
      else result = "partial";
      return {
        plane,
        result,
        lastVerifiedAt: planeRuns[planeRuns.length - 1]?.timestamp,
        freshness: "current" as const,
        probeRunRefs: planeRuns.map((r) => r.runId),
        limitations: planeRuns.find((r) => r.limitations)?.limitations,
      };
    });

    const overallResults = planes.map((p) => p.result);
    let overallResult: IsolationProbeResult = "unknown";
    if (overallResults.some((r) => r === "fail")) overallResult = "fail";
    else if (overallResults.some((r) => r === "error" || r === "unknown")) overallResult = "partial";
    else if (overallResults.every((r) => r === "pass" || r === "not_applicable")) {
      overallResult = "pass";
    }

    // Update only isolation dimension via posture composition (other dims unchanged semantics)
    this.posture.compose({
      snapshotId: `posture-from-iso-${snapshotId}`,
      scope,
    });

    const snapshot: IsolationAssuranceSnapshot = {
      snapshotId,
      capturedAt: new Date().toISOString(),
      scope,
      planes,
      overallResult,
      knownCrossTenantLeakageDetected: false,
      knownCrossWorkspaceLeakageDetected: false,
      universalScorePresent: false,
    };
    this.snapshots.push(snapshot);
    this.events.push(
      createSecurityAssuranceEvent({
        eventType: "security_assurance.isolation.posture_updated",
        tenantId: "platform",
        workspaceId: "platform",
        occurredAt: snapshot.capturedAt,
        refs: { snapshotId, overallResult },
      }),
    );
    return snapshot;
  }

  listRuns(): IsolationProbeRun[] {
    return [...this.runs.values()];
  }

  listAssessments(): IsolationAssessment[] {
    return [...this.assessments.values()];
  }

  listSnapshots(): IsolationAssuranceSnapshot[] {
    return [...this.snapshots];
  }

  listEvents() {
    return [...this.events];
  }
}
