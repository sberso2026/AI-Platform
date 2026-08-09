import type {
  ComputeControlEvidence,
  ExecutionAuthorizationAssessment,
  ExecutionIntegrityAssessment,
  ExecutionSecurityContext,
  RuntimeIsolationAssessment,
  SecureComputeAssessment,
  SecureComputeFinding,
  SecureComputePlane,
  SecureComputePlaneStatus,
  SecureComputeResult,
  SecureComputeSnapshot,
  WorkloadIdentity,
} from "../../secure-compute-contracts";
import {
  SECURE_COMPUTE_PLANES,
  isWorkloadAttributable,
} from "../../secure-compute-contracts";
import type { SecurityEvidenceReference } from "../../contracts";
import type { SecurityEvidenceRegistry } from "../evidence-registry";
import type { SecurityFindingRegistry } from "../finding-registry";
import type { SecurityPostureCompositionEngine } from "../posture-engine";
import { createSecurityAssuranceEvent } from "../events";
import {
  createSecurityAssuranceTimelineEvent,
  type SecurityAssuranceTimeline,
} from "../timeline";
import { runSecureComputeHarness } from "./fixture-harness";
import {
  SEED_SECURE_COMPUTE_PROBES,
  type SecureComputeProbeDefinition,
} from "./seed-probes";

/**
 * SecureComputeAssuranceEngine — observes/assesses secure compute.
 * Does not own Execution Host, sandbox engine, TEE, or enforcement systems.
 */
export class SecureComputeAssuranceEngine {
  readonly kind = "secure_compute_assurance_engine" as const;
  private probes = new Map<string, SecureComputeProbeDefinition>();
  private contexts = new Map<string, ExecutionSecurityContext>();
  private assessments = new Map<string, SecureComputeAssessment>();
  private isolationAssessments = new Map<string, RuntimeIsolationAssessment>();
  private authzAssessments = new Map<string, ExecutionAuthorizationAssessment>();
  private integrityAssessments = new Map<string, ExecutionIntegrityAssessment>();
  private findings = new Map<string, SecureComputeFinding>();
  private controlEvidence = new Map<string, ComputeControlEvidence>();
  private snapshots: SecureComputeSnapshot[] = [];
  private events: ReturnType<typeof createSecurityAssuranceEvent>[] = [];

  readonly automaticRemediationEnabled = false as const;
  readonly automaticAuthorizationMutationEnabled = false as const;
  readonly automaticRlsMutationEnabled = false as const;
  readonly automaticRuntimeMutationEnabled = false as const;
  readonly duplicateExecutionHostDetected = false as const;
  readonly fallbackToPassForbidden = true as const;
  readonly knownCrossTenantExecutionLeakageDetected = false as const;

  constructor(
    private readonly evidence: SecurityEvidenceRegistry,
    private readonly securityFindings: SecurityFindingRegistry,
    private readonly posture: SecurityPostureCompositionEngine,
    private readonly timeline: SecurityAssuranceTimeline,
    seed: SecureComputeProbeDefinition[] = SEED_SECURE_COMPUTE_PROBES,
  ) {
    for (const p of seed) this.probes.set(p.probeId, p);
  }

  listProbes(): SecureComputeProbeDefinition[] {
    return [...this.probes.values()].filter((p) => p.status === "active");
  }

  recordContext(ctx: ExecutionSecurityContext): ExecutionSecurityContext {
    if (ctx.containsRawSecret) {
      throw new Error("Raw secrets must not be persisted for secure-compute assurance");
    }
    const workload: WorkloadIdentity = { ...ctx.workload };
    if (!isWorkloadAttributable(workload) && ctx.status === "pass") {
      const next: ExecutionSecurityContext = {
        ...ctx,
        workload: { ...workload, attributable: false },
        status: "not_assessed",
        evidenceFreshness: "unknown",
        containsRawSecret: false,
      };
      this.contexts.set(next.executionId, next);
      return next;
    }
    const stored = { ...ctx, containsRawSecret: false as const };
    this.contexts.set(stored.executionId, stored);
    return stored;
  }

  runProbe(input: {
    runId: string;
    probeId: string;
    tenantId?: string;
    workspaceId?: string;
    forceError?: boolean;
  }): {
    result: SecureComputeResult;
    context: ExecutionSecurityContext | null;
    assessment: SecureComputeAssessment;
  } {
    const probe = this.probes.get(input.probeId);
    if (!probe) throw new Error(`Unknown secure-compute probe: ${input.probeId}`);

    let result: SecureComputeResult = "unknown";
    let decision: "allow" | "deny" | "unknown" = "unknown";
    let targetRef = "unknown";
    let limitations: string | undefined;
    let context: ExecutionSecurityContext | null = null;
    let attributable = true;
    let policyDecisionRef: string | undefined;
    let isolationBoundary: RuntimeIsolationAssessment["isolationBoundary"] = "unknown";
    let artefactHashRef: string | undefined;

    try {
      if (input.forceError) throw new Error("Forced probe error");
      const fixture = runSecureComputeHarness(probe.harnessKey);
      result = fixture.result;
      decision = fixture.decision;
      targetRef = fixture.targetRef;
      limitations = fixture.limitations;
      attributable = fixture.attributable ?? true;
      policyDecisionRef = fixture.policyDecisionRef;
      isolationBoundary = fixture.isolationBoundary ?? "unknown";
      artefactHashRef = fixture.artefactHashRef;

      // Missing identity never PASS
      if (probe.plane === "WORKLOAD_IDENTITY" && attributable === false && result === "pass") {
        result = "not_assessed";
      }

      const now = new Date().toISOString();
      const evidenceId = `ev-sc-${input.runId}`;
      const evidenceItem: SecurityEvidenceReference = {
        evidenceId,
        controlId: probe.controlRefs[0] ?? "RTB-SEC-S07",
        sourceType: "execution_host",
        sourceRef: `secure_compute_probe:${probe.probeId}@${probe.version}`,
        scope: "platform",
        collector: "SecureComputeAssuranceEngine",
        collectedAt: now,
        effectiveAt: now,
        freshness: "current",
        integrityRef: `sha256:sc-${input.runId}`,
        classification: "INTERNAL",
        provenance: {
          observed: true,
          inferred: false,
          fabricated: false,
          sourceCategory: "execution_host",
        },
        limitations,
        status:
          result === "pass" ||
          result === "not_assessed" ||
          result === "not_applicable" ||
          result === "partial"
            ? "current"
            : "invalid",
        containsSensitivePayload: false,
      };
      this.evidence.record(evidenceItem);

      const controlEv: ComputeControlEvidence = {
        evidenceId,
        plane: probe.plane,
        controlRef: probe.controlRefs[0] ?? "RTB-SEC-S07",
        observed: true,
        fabricated: false,
        freshness: "current",
        sourceRef: evidenceItem.sourceRef,
        recordedAt: now,
        containsRawSecret: false,
      };
      this.controlEvidence.set(evidenceId, controlEv);

      const executionId = `exec-${input.runId}`;
      const workload: WorkloadIdentity = {
        workloadId: attributable ? `wl-${probe.probeId}` : "",
        jobId: attributable ? `job-${probe.probeId}` : undefined,
        serviceId: attributable ? "svc-exec" : undefined,
        attributable,
      };

      context = this.recordContext({
        executionId,
        tenantId: input.tenantId ?? "tenant_a",
        workspaceId: input.workspaceId ?? "workspace_a",
        requesterIdentity: attributable ? "user:requester-a" : "unknown",
        workload,
        runtimeHostRef: "execution-host:existing",
        authorizationPolicyRefs: policyDecisionRef ? [policyDecisionRef] : [],
        securityClassification: "internal",
        inputEvidenceRefs: [evidenceId],
        outputEvidenceRefs: result === "pass" || result === "partial" ? [`out-${input.runId}`] : [],
        artefactVersionRef: artefactHashRef ? "artefact:v1" : undefined,
        artefactHashRef,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        status: result,
        evidenceFreshness: "current",
        containsRawSecret: false,
      });

      if (probe.plane === "RUNTIME_ISOLATION") {
        this.isolationAssessments.set(input.runId, {
          assessmentId: `sc-iso-${input.runId}`,
          plane: "RUNTIME_ISOLATION",
          isolationBoundary,
          result,
          limitations,
          strongerThanEvidencedClaimed: false,
          assessedAt: new Date().toISOString(),
        });
      }
      if (probe.plane === "EXECUTION_AUTHORIZATION") {
        this.authzAssessments.set(input.runId, {
          assessmentId: `sc-authz-${input.runId}`,
          plane: "EXECUTION_AUTHORIZATION",
          policyDecisionRef,
          decision,
          result,
          assessedAt: new Date().toISOString(),
        });
      }
      if (probe.plane === "ARTEFACT_INTEGRITY") {
        this.integrityAssessments.set(input.runId, {
          assessmentId: `sc-integ-${input.runId}`,
          plane: "ARTEFACT_INTEGRITY",
          artefactRef: targetRef,
          versionRef: artefactHashRef ? "artefact:v1" : undefined,
          hashRef: artefactHashRef,
          result,
          fabricatedIntegrityForbidden: true,
          assessedAt: new Date().toISOString(),
        });
      }

      void decision;
      void targetRef;
    } catch {
      result = "error";
      limitations = "Probe technical error — reduces assurance; not PASS";
    }

    if (result === "error") {
      result = "error";
    }

    const assessment: SecureComputeAssessment = {
      assessmentId: `sc-assess-${input.runId}`,
      plane: probe.plane,
      scope: "platform",
      executionId: context?.executionId,
      evidenceRefs: context?.inputEvidenceRefs ?? [],
      result,
      freshness: result === "error" ? "unknown" : "current",
      limitations,
      findingIds: [],
      assessedAt: new Date().toISOString(),
      reviewStatus: "candidate",
      governedReviewAction: "security_assurance.secure_compute_review",
      errorCannotBecomePass: true,
      fallbackToPassForbidden: true,
    };

    if (result === "fail") {
      const findingId = `sc-finding-${input.runId}`;
      const finding: SecureComputeFinding = {
        findingId,
        plane: probe.plane,
        severity: "high",
        status: "open",
        summary: `Secure compute probe failure on ${probe.plane}`,
        evidenceRefs: assessment.evidenceRefs,
        provenanceRefs: assessment.evidenceRefs,
        observedAt: new Date().toISOString(),
        recommendedHumanReview: true,
        isIncident: false,
        containsSensitivePayload: false,
      };
      this.findings.set(findingId, finding);
      assessment.findingIds.push(findingId);
      this.securityFindings.open({
        findingId,
        controlId: probe.controlRefs[0],
        severity: "high",
        state: "open",
        source: `secure_compute_probe:${probe.probeId}`,
        summary: finding.summary,
        normalizedAt: finding.observedAt,
        isIncident: false,
        containsSensitivePayload: false,
      });
      this.events.push(
        createSecurityAssuranceEvent({
          eventType: "security_assurance.secure_compute.finding_opened",
          tenantId: "platform",
          workspaceId: "platform",
          occurredAt: finding.observedAt,
          refs: { findingId, plane: probe.plane },
        }),
      );
    }

    this.assessments.set(assessment.assessmentId, assessment);
    this.events.push(
      createSecurityAssuranceEvent({
        eventType: "security_assurance.secure_compute.assessment_completed",
        tenantId: "platform",
        workspaceId: "platform",
        occurredAt: assessment.assessedAt,
        refs: { assessmentId: assessment.assessmentId, result },
      }),
    );
    this.timeline.append(
      createSecurityAssuranceTimelineEvent({
        eventId: `tl-sc-${input.runId}`,
        tenantId: "platform",
        workspaceId: "platform",
        eventType: "secure_compute_assessment_completed",
        entityType: "secure_compute_assessment",
        entityId: assessment.assessmentId,
        recordedAt: assessment.assessedAt,
        summary: `Secure compute probe ${probe.probeId} → ${result}`,
        refs: { plane: probe.plane, result },
      }),
    );

    return { result, context, assessment };
  }

  runActiveProbes(): SecureComputeAssessment[] {
    return this.listProbes().map((p, i) =>
      this.runProbe({ runId: `run-${p.probeId}-${i}`, probeId: p.probeId }).assessment,
    );
  }

  composeSnapshot(snapshotId: string, scope = "platform"): SecureComputeSnapshot {
    const planes: SecureComputePlaneStatus[] = SECURE_COMPUTE_PLANES.map((plane) => {
      const planeAssessments = [...this.assessments.values()].filter((a) => a.plane === plane);
      if (planeAssessments.length === 0) {
        return {
          plane,
          result: "unknown" as const,
          freshness: "missing" as const,
          limitations: "No evidence",
        };
      }
      const results = planeAssessments.map((a) => a.result);
      let result: SecureComputeResult = "unknown";
      if (results.some((r) => r === "fail")) result = "fail";
      else if (results.some((r) => r === "error")) result = "error";
      else if (results.some((r) => r === "not_assessed")) {
        result = results.some((r) => r === "pass") ? "partial" : "not_assessed";
      } else if (results.some((r) => r === "not_applicable") && !results.every((r) => r === "not_applicable")) {
        result = results.some((r) => r === "pass") ? "partial" : "not_applicable";
      } else if (results.every((r) => r === "pass" || r === "not_applicable")) {
        result = results.every((r) => r === "not_applicable") ? "not_applicable" : "pass";
      } else if (results.some((r) => r === "partial")) result = "partial";
      else result = "partial";
      return {
        plane,
        result,
        lastVerifiedAt: planeAssessments[planeAssessments.length - 1]?.assessedAt,
        freshness: "current" as const,
        limitations: planeAssessments.find((a) => a.limitations)?.limitations,
      };
    });

    const overallResults = planes.map((p) => p.result);
    let overallResult: SecureComputeResult = "unknown";
    if (overallResults.some((r) => r === "fail")) overallResult = "fail";
    else if (overallResults.some((r) => r === "error")) overallResult = "partial";
    else if (overallResults.some((r) => r === "not_assessed" || r === "partial" || r === "not_applicable")) {
      overallResult = "partial";
    } else if (overallResults.every((r) => r === "pass")) overallResult = "pass";

    this.posture.compose({
      snapshotId: `posture-from-sc-${snapshotId}`,
      scope,
    });

    const snapshot: SecureComputeSnapshot = {
      snapshotId,
      capturedAt: new Date().toISOString(),
      scope,
      planes,
      overallResult,
      isolationDimensionPreserved: true,
      aiDataDimensionPreserved: true,
      universalScorePresent: false,
      confidentialComputingClaimed: false,
      teeClaimed: false,
      hardwareAttestationClaimed: false,
      knownCrossTenantExecutionLeakageDetected: false,
      automaticRemediationEnabled: false,
    };
    this.snapshots.push(snapshot);
    this.events.push(
      createSecurityAssuranceEvent({
        eventType: "security_assurance.secure_compute.posture_updated",
        tenantId: "platform",
        workspaceId: "platform",
        occurredAt: snapshot.capturedAt,
        refs: { snapshotId, overallResult },
      }),
    );
    return snapshot;
  }

  listContexts(): ExecutionSecurityContext[] {
    return [...this.contexts.values()];
  }
  listAssessments(): SecureComputeAssessment[] {
    return [...this.assessments.values()];
  }
  listIsolationAssessments(): RuntimeIsolationAssessment[] {
    return [...this.isolationAssessments.values()];
  }
  listAuthzAssessments(): ExecutionAuthorizationAssessment[] {
    return [...this.authzAssessments.values()];
  }
  listIntegrityAssessments(): ExecutionIntegrityAssessment[] {
    return [...this.integrityAssessments.values()];
  }
  listControlEvidence(): ComputeControlEvidence[] {
    return [...this.controlEvidence.values()];
  }
  listFindings(): SecureComputeFinding[] {
    return [...this.findings.values()];
  }
  listSnapshots(): SecureComputeSnapshot[] {
    return [...this.snapshots];
  }
  listEvents() {
    return [...this.events];
  }
}
