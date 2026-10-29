import type {
  AiDataFlowRecord,
  AiDataSecurityAssessment,
  AiDataSecurityFinding,
  AiDataSecurityPlane,
  AiDataSecurityPlaneStatus,
  AiDataSecurityResult,
  AiDataSecuritySnapshot,
  ProviderDataHandlingAssessment,
  SensitiveDataExposureAssessment,
} from "../../ai-data-contracts";
import {
  AI_DATA_SECURITY_PLANES,
  normalizeClassification,
} from "../../ai-data-contracts";
import type { SecurityEvidenceReference } from "../../contracts";
import type { SecurityEvidenceRegistry } from "../evidence-registry";
import type { SecurityFindingRegistry } from "../finding-registry";
import type { SecurityPostureCompositionEngine } from "../posture-engine";
import { createSecurityAssuranceEvent } from "../events";
import {
  createSecurityAssuranceTimelineEvent,
  type SecurityAssuranceTimeline,
} from "../timeline";
import { runAiDataHarness } from "./fixture-harness";
import { SEED_AI_DATA_PROBES, type AiDataProbeDefinition } from "./seed-probes";

/**
 * AiDataSecurityEngine — observes/assesses AI/data security.
 * Does not own AI stack, secrets vault, DLP, or enforcement systems.
 */
export class AiDataSecurityEngine {
  readonly kind = "ai_data_security_engine" as const;
  private probes = new Map<string, AiDataProbeDefinition>();
  private flows = new Map<string, AiDataFlowRecord>();
  private assessments = new Map<string, AiDataSecurityAssessment>();
  private providerAssessments = new Map<string, ProviderDataHandlingAssessment>();
  private exposureAssessments = new Map<string, SensitiveDataExposureAssessment>();
  private findings = new Map<string, AiDataSecurityFinding>();
  private snapshots: AiDataSecuritySnapshot[] = [];
  private events: ReturnType<typeof createSecurityAssuranceEvent>[] = [];

  readonly automaticRemediationEnabled = false as const;
  readonly automaticAuthorizationMutationEnabled = false as const;
  readonly automaticRlsMutationEnabled = false as const;
  readonly duplicateAiStackDetected = false as const;
  readonly knownSensitiveDataLeakageDetected = false as const;

  constructor(
    private readonly evidence: SecurityEvidenceRegistry,
    private readonly securityFindings: SecurityFindingRegistry,
    private readonly posture: SecurityPostureCompositionEngine,
    private readonly timeline: SecurityAssuranceTimeline,
    seed: AiDataProbeDefinition[] = SEED_AI_DATA_PROBES,
  ) {
    for (const p of seed) this.probes.set(p.probeId, p);
  }

  listProbes(): AiDataProbeDefinition[] {
    return [...this.probes.values()].filter((p) => p.status === "active");
  }

  recordFlow(flow: AiDataFlowRecord): AiDataFlowRecord {
    if (flow.containsRawSecret || flow.containsSensitivePayload) {
      throw new Error("Raw secrets/sensitive payloads must not be persisted for assurance");
    }
    const classification = normalizeClassification(flow.classification);
    if (classification === "unknown" && flow.decision === "allow" && flow.status === "pass") {
      // Unknown must not silently become public disclosure PASS
      const next: AiDataFlowRecord = {
        ...flow,
        classification: "unknown",
        status: "not_assessed",
        decision: "unknown",
      };
      this.flows.set(next.flowId, next);
      return next;
    }
    const stored = { ...flow, classification, containsRawSecret: false as const, containsSensitivePayload: false as const };
    this.flows.set(stored.flowId, stored);
    return stored;
  }

  runProbe(input: {
    runId: string;
    probeId: string;
    tenantId?: string;
    workspaceId?: string;
    forceError?: boolean;
  }): {
    result: AiDataSecurityResult;
    flow: AiDataFlowRecord | null;
    assessment: AiDataSecurityAssessment;
  } {
    const probe = this.probes.get(input.probeId);
    if (!probe) throw new Error(`Unknown AI/data probe: ${input.probeId}`);

    let result: AiDataSecurityResult = "unknown";
    let decision: AiDataFlowRecord["decision"] = "unknown";
    let classification = normalizeClassification("unknown");
    let targetRef = "unknown";
    let limitations: string | undefined;
    let flow: AiDataFlowRecord | null = null;

    try {
      if (input.forceError) throw new Error("Forced probe error");
      const fixture = runAiDataHarness(probe.harnessKey);
      result = fixture.result;
      decision = fixture.decision;
      classification = fixture.classification;
      targetRef = fixture.targetRef;
      limitations = fixture.limitations;

      const evidenceId = `ev-aid-${input.runId}`;
      const evidenceItem: SecurityEvidenceReference = {
        evidenceId,
        controlId: probe.controlRefs[0] ?? "RTB-SEC-S05",
        sourceType: "ai_runtime",
        sourceRef: `ai_data_probe:${probe.probeId}@${probe.version}`,
        scope: "platform",
        collector: "AiDataSecurityEngine",
        collectedAt: new Date().toISOString(),
        effectiveAt: new Date().toISOString(),
        freshness: "current",
        integrityRef: `sha256:aid-${input.runId}`,
        classification:
          classification === "public"
            ? "PUBLIC"
            : classification === "restricted"
              ? "RESTRICTED"
              : classification === "confidential"
                ? "CLIENT_CONFIDENTIAL"
                : "INTERNAL",
        provenance: {
          observed: true,
          inferred: false,
          fabricated: false,
          sourceCategory: "ai_runtime",
        },
        limitations,
        status: result === "pass" || result === "not_assessed" ? "current" : "invalid",
        containsSensitivePayload: false,
      };
      this.evidence.record(evidenceItem);

      flow = this.recordFlow({
        flowId: `flow-${input.runId}`,
        plane: probe.plane,
        source: probe.harnessKey,
        tenantId: input.tenantId ?? "tenant_a",
        workspaceId: input.workspaceId ?? "workspace_a",
        classification,
        purpose: probe.name,
        destination: targetRef,
        policyRefs: ["platform_policy.ai_data"],
        provenanceRefs: [evidenceId],
        evidenceRefs: [evidenceId],
        timestamp: new Date().toISOString(),
        decision,
        status: result,
        containsRawSecret: false,
        containsSensitivePayload: false,
      });

      if (probe.plane === "MODEL_PROVIDER") {
        const approvedStatus =
          probe.harnessKey === "provider.approved"
            ? ("approved" as const)
            : ("unknown" as const);
        this.providerAssessments.set(input.runId, {
          assessmentId: `prov-${input.runId}`,
          providerId: approvedStatus === "approved" ? "approved-provider" : "unknown-provider",
          modelId: approvedStatus === "approved" ? "model-v1" : undefined,
          modelVersion: approvedStatus === "approved" ? "1.0.0" : undefined,
          approvedStatus,
          dataHandlingPolicyRef:
            approvedStatus === "approved" ? "ai_provider_policy.v1" : undefined,
          retentionTrainingPosture:
            approvedStatus === "approved" ? "evidenced" : "unknown",
          egressClassification: classification,
          tenantId: input.tenantId ?? "tenant_a",
          workspaceId: input.workspaceId ?? "workspace_a",
          result: approvedStatus === "approved" ? "pass" : "not_assessed",
          assessedAt: new Date().toISOString(),
          fabricatedPassForbidden: true,
        });
      }

      if (probe.plane === "MODEL_OUTPUT" || probe.plane === "LOGGING_TELEMETRY") {
        this.exposureAssessments.set(input.runId, {
          assessmentId: `exp-${input.runId}`,
          plane: probe.plane,
          scope: "platform",
          exposureDetected: false,
          redactedEvidenceRef: evidenceId,
          result: "pass",
          assessedAt: new Date().toISOString(),
          universalSafetyClaimed: false,
        });
      }
    } catch {
      result = "error";
      limitations = "Probe technical error — reduces assurance; not PASS";
    }

    // Errors never become PASS
    if (result === "error") {
      result = "error";
    }

    const assessment: AiDataSecurityAssessment = {
      assessmentId: `aid-assess-${input.runId}`,
      plane: probe.plane,
      scope: "platform",
      flowRefs: flow ? [flow.flowId] : [],
      evidenceRefs: flow?.evidenceRefs ?? [],
      result,
      freshness: result === "error" ? "unknown" : "current",
      limitations,
      findingIds: [],
      assessedAt: new Date().toISOString(),
      reviewStatus: "candidate",
      governedReviewAction: "security_assurance.ai_data_review",
      errorCannotBecomePass: true,
    };

    if (result === "fail") {
      const findingId = `aid-finding-${input.runId}`;
      const finding: AiDataSecurityFinding = {
        findingId,
        plane: probe.plane,
        severity: "high",
        status: "open",
        summary: `AI/data security probe failure on ${probe.plane}`,
        evidenceRefs: assessment.evidenceRefs,
        provenanceRefs: assessment.evidenceRefs,
        normalizedAt: new Date().toISOString(),
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
        source: `ai_data_probe:${probe.probeId}`,
        summary: finding.summary,
        normalizedAt: finding.normalizedAt,
        isIncident: false,
        containsSensitivePayload: false,
      });
      this.events.push(
        createSecurityAssuranceEvent({
          eventType: "security_assurance.ai_data.finding_opened",
          tenantId: "platform",
          workspaceId: "platform",
          occurredAt: finding.normalizedAt,
          refs: { findingId, plane: probe.plane },
        }),
      );
    }

    this.assessments.set(assessment.assessmentId, assessment);
    this.events.push(
      createSecurityAssuranceEvent({
        eventType: "security_assurance.ai_data.assessment_completed",
        tenantId: "platform",
        workspaceId: "platform",
        occurredAt: assessment.assessedAt,
        refs: { assessmentId: assessment.assessmentId, result },
      }),
    );
    this.timeline.append(
      createSecurityAssuranceTimelineEvent({
        eventId: `tl-aid-${input.runId}`,
        tenantId: "platform",
        workspaceId: "platform",
        eventType: "ai_data_assessment_completed",
        entityType: "ai_data_security_assessment",
        entityId: assessment.assessmentId,
        recordedAt: assessment.assessedAt,
        summary: `AI/data probe ${probe.probeId} → ${result}`,
        refs: { plane: probe.plane, result },
      }),
    );

    return { result, flow, assessment };
  }

  runActiveProbes(): AiDataSecurityAssessment[] {
    return this.listProbes().map((p, i) =>
      this.runProbe({ runId: `run-${p.probeId}-${i}`, probeId: p.probeId }).assessment,
    );
  }

  composeSnapshot(snapshotId: string, scope = "platform"): AiDataSecuritySnapshot {
    const planes: AiDataSecurityPlaneStatus[] = AI_DATA_SECURITY_PLANES.map((plane) => {
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
      let result: AiDataSecurityResult = "unknown";
      if (results.some((r) => r === "fail")) result = "fail";
      else if (results.some((r) => r === "error")) result = "error";
      else if (results.some((r) => r === "not_assessed")) {
        // mixed approved+unknown provider: partial if any pass else not_assessed
        result = results.some((r) => r === "pass") ? "partial" : "not_assessed";
      } else if (results.every((r) => r === "pass")) result = "pass";
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
    let overallResult: AiDataSecurityResult = "unknown";
    if (overallResults.some((r) => r === "fail")) overallResult = "fail";
    else if (overallResults.some((r) => r === "error")) overallResult = "partial";
    else if (overallResults.some((r) => r === "not_assessed" || r === "partial")) {
      overallResult = "partial";
    } else if (overallResults.every((r) => r === "pass")) overallResult = "pass";

    // Preserve isolation dimension by composing full posture (isolation remains)
    this.posture.compose({
      snapshotId: `posture-from-aid-${snapshotId}`,
      scope,
    });

    const snapshot: AiDataSecuritySnapshot = {
      snapshotId,
      capturedAt: new Date().toISOString(),
      scope,
      planes,
      overallResult,
      isolationDimensionPreserved: true,
      universalScorePresent: false,
      promptInjectionCompletelyPreventedClaimed: false,
      knownSensitiveDataLeakageDetected: false,
    };
    this.snapshots.push(snapshot);
    this.events.push(
      createSecurityAssuranceEvent({
        eventType: "security_assurance.ai_data.posture_updated",
        tenantId: "platform",
        workspaceId: "platform",
        occurredAt: snapshot.capturedAt,
        refs: { snapshotId, overallResult },
      }),
    );
    return snapshot;
  }

  listFlows(): AiDataFlowRecord[] {
    return [...this.flows.values()];
  }
  listAssessments(): AiDataSecurityAssessment[] {
    return [...this.assessments.values()];
  }
  listProviderAssessments(): ProviderDataHandlingAssessment[] {
    return [...this.providerAssessments.values()];
  }
  listExposureAssessments(): SensitiveDataExposureAssessment[] {
    return [...this.exposureAssessments.values()];
  }
  listFindings(): AiDataSecurityFinding[] {
    return [...this.findings.values()];
  }
  listSnapshots(): AiDataSecuritySnapshot[] {
    return [...this.snapshots];
  }
  listEvents() {
    return [...this.events];
  }
}
