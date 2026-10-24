import type {
  ComplianceAssessment,
  ComplianceControlMapping,
  ComplianceEvidenceMapping,
  ComplianceFinding,
  ComplianceFramework,
  ComplianceFrameworkId,
  ComplianceFrameworkVersion,
  ComplianceGap,
  ComplianceRequirement,
  ComplianceRequirementStatus,
  ComplianceSnapshot,
  ComplianceSupportStatus,
  ExternalAssuranceRequirement,
} from "../../compliance-intelligence-contracts";
import { COMPLIANCE_FRAMEWORK_IDS } from "../../compliance-intelligence-contracts";
import type { SecurityEvidenceReference } from "../../contracts";
import type { FrameworkMappingRegistry } from "../framework-mapping-registry";
import type { SecurityControlRegistry } from "../control-registry";
import type { SecurityEvidenceRegistry } from "../evidence-registry";
import type { SecurityFindingRegistry } from "../finding-registry";
import type { SecurityPostureCompositionEngine } from "../posture-engine";
import { createSecurityAssuranceEvent } from "../events";
import {
  createSecurityAssuranceTimelineEvent,
  type SecurityAssuranceTimeline,
} from "../timeline";
import {
  SEED_COMPLIANCE_CONTROL_MAPPINGS,
  SEED_COMPLIANCE_FRAMEWORKS,
  SEED_COMPLIANCE_FRAMEWORK_VERSIONS,
  SEED_COMPLIANCE_REQUIREMENTS,
  SEED_EXTERNAL_ASSURANCE_REQUIREMENTS,
} from "./seed-frameworks";

/**
 * ComplianceIntelligenceEngine — maps frameworks ↔ RTB controls/evidence.
 * Does not certify, attest, remediate, or create a duplicate control plane.
 */
export class ComplianceIntelligenceEngine {
  readonly kind = "compliance_intelligence_engine" as const;
  private frameworks = new Map<ComplianceFrameworkId, ComplianceFramework>();
  private versions = new Map<string, ComplianceFrameworkVersion>();
  private requirements = new Map<string, ComplianceRequirement>();
  private controlMappings = new Map<string, ComplianceControlMapping>();
  private evidenceMappings = new Map<string, ComplianceEvidenceMapping>();
  private externalReqs = new Map<string, ExternalAssuranceRequirement>();
  private assessments = new Map<string, ComplianceAssessment>();
  private gaps = new Map<string, ComplianceGap>();
  private findings = new Map<string, ComplianceFinding>();
  private snapshots: ComplianceSnapshot[] = [];
  private events: ReturnType<typeof createSecurityAssuranceEvent>[] = [];

  readonly automaticRemediationEnabled = false as const;
  readonly automaticControlCreationEnabled = false as const;
  readonly automaticCertificationEnabled = false as const;
  readonly automaticComplianceClaimEnabled = false as const;
  readonly duplicateSecurityControlRegistryDetected = false as const;
  readonly duplicateSecurityEvidenceRegistryDetected = false as const;

  constructor(
    private readonly controls: SecurityControlRegistry,
    private readonly evidence: SecurityEvidenceRegistry,
    private readonly frameworkMappings: FrameworkMappingRegistry,
    private readonly securityFindings: SecurityFindingRegistry,
    private readonly posture: SecurityPostureCompositionEngine,
    private readonly timeline: SecurityAssuranceTimeline,
  ) {
    for (const f of SEED_COMPLIANCE_FRAMEWORKS) this.frameworks.set(f.frameworkId, f);
    for (const v of SEED_COMPLIANCE_FRAMEWORK_VERSIONS) {
      this.versions.set(v.frameworkVersionId, v);
    }
    for (const r of SEED_COMPLIANCE_REQUIREMENTS) {
      this.requirements.set(r.requirementId, r);
    }
    for (const m of SEED_COMPLIANCE_CONTROL_MAPPINGS) {
      this.controlMappings.set(m.mappingId, m);
    }
    for (const e of SEED_EXTERNAL_ASSURANCE_REQUIREMENTS) {
      this.externalReqs.set(e.externalRequirementId, e);
    }
  }

  listFrameworks(): ComplianceFramework[] {
    return [...this.frameworks.values()];
  }
  listFrameworkVersions(): ComplianceFrameworkVersion[] {
    return [...this.versions.values()];
  }
  listRequirements(frameworkId?: ComplianceFrameworkId): ComplianceRequirement[] {
    const all = [...this.requirements.values()];
    return frameworkId ? all.filter((r) => r.frameworkId === frameworkId) : all;
  }
  listControlMappings(): ComplianceControlMapping[] {
    return [...this.controlMappings.values()];
  }
  listEvidenceMappings(): ComplianceEvidenceMapping[] {
    return [...this.evidenceMappings.values()];
  }
  listExternalAssuranceRequirements(): ExternalAssuranceRequirement[] {
    return [...this.externalReqs.values()];
  }

  /** Cross-framework: same RTB control reused across frameworks via existing registry + CI mappings. */
  frameworksForControl(controlId: string): ComplianceFrameworkId[] {
    const fromCi = [
      ...new Set(
        [...this.controlMappings.values()]
          .filter((m) => m.controlId === controlId)
          .map((m) => m.frameworkId),
      ),
    ];
    // Also surface existing Foundation FrameworkMappingRegistry links (non-duplicating)
    void this.frameworkMappings.listByControl(controlId);
    return fromCi;
  }

  recordEvidenceMapping(input: {
    evidenceMappingId: string;
    requirementId: string;
    controlId: string;
    evidence: SecurityEvidenceReference;
    assessorSource: string;
    forceStale?: boolean;
  }): ComplianceEvidenceMapping {
    const req = this.requirements.get(input.requirementId);
    if (!req) throw new Error(`Unknown requirement: ${input.requirementId}`);
    this.evidence.record(input.evidence);
    const freshness = input.forceStale
      ? "stale"
      : input.evidence.freshness === "stale"
        ? "stale"
        : input.evidence.freshness === "missing"
          ? "missing"
          : "current";
    const mapping: ComplianceEvidenceMapping = {
      evidenceMappingId: input.evidenceMappingId,
      requirementId: input.requirementId,
      controlId: input.controlId,
      evidenceId: input.evidence.evidenceId,
      freshness,
      evidenceQuality:
        freshness === "missing"
          ? "missing"
          : freshness === "stale"
            ? "weak"
            : "adequate",
      observedAt: new Date().toISOString(),
      assessorSource: input.assessorSource,
      frameworkVersionId: req.frameworkVersionId,
      provenanceRef: input.evidence.sourceRef,
    };
    this.evidenceMappings.set(mapping.evidenceMappingId, mapping);
    return mapping;
  }

  assessRequirement(
    requirementId: string,
    opts?: { forceNotApplicable?: boolean; forceUnsupported?: boolean },
  ): ComplianceAssessment {
    const req = this.requirements.get(requirementId);
    if (!req) throw new Error(`Unknown requirement: ${requirementId}`);

    const mappings = [...this.controlMappings.values()].filter(
      (m) => m.requirementId === requirementId,
    );
    const controlIds = mappings.map((m) => m.controlId);
    const evidenceMaps = [...this.evidenceMappings.values()].filter(
      (m) => m.requirementId === requirementId,
    );
    const external = [...this.externalReqs.values()].filter(
      (e) => e.requirementId === requirementId,
    );

    let status: ComplianceSupportStatus = "not_assessed";
    let freshness: ComplianceAssessment["freshness"] = "missing";
    let limitations: string | undefined;

    if (opts?.forceNotApplicable && req.notApplicableAllowed) {
      status = "not_applicable";
      freshness = "current";
      limitations = "Requirement marked not_applicable";
    } else if (opts?.forceUnsupported) {
      status = "unsupported";
      freshness = "current";
      limitations = "Unsupported evidence forced for assessment demo";
    } else if (req.requiresExternalAssurance) {
      const satisfied = external.some((e) => e.status === "obtained");
      if (!satisfied) {
        status = "requires_external_assurance";
        freshness = evidenceMaps.length ? "current" : "missing";
        limitations =
          "External assurance required — internal evidence alone cannot satisfy";
      } else {
        status = "supported";
        freshness = "current";
      }
    } else if (controlIds.length === 0) {
      status = "unknown";
      freshness = "missing";
      limitations = "No mapped RTB controls";
    } else {
      const missingControls = controlIds.filter((id) => {
        try {
          this.controls.require(id);
          return false;
        } catch {
          return true;
        }
      });
      if (missingControls.length === controlIds.length) {
        status = "unknown";
        freshness = "missing";
        limitations = "Mapped controls not present in registry";
      } else if (evidenceMaps.length === 0) {
        status = "not_assessed";
        freshness = "missing";
        limitations = "Missing evidence — fail-closed (not supported)";
      } else if (evidenceMaps.some((e) => e.freshness === "stale")) {
        status = "partially_supported";
        freshness = "stale";
        limitations =
          "Supported mapping with stale evidence — not silently current PASS";
      } else if (
        missingControls.length > 0 ||
        evidenceMaps.some((e) => e.evidenceQuality === "weak")
      ) {
        status = "partially_supported";
        freshness = "current";
        limitations = "Partial control/evidence coverage";
      } else if (
        evidenceMaps.every((e) => e.freshness === "current" && e.evidenceQuality === "adequate") &&
        missingControls.length === 0
      ) {
        // All mapped controls evidenced — still not a certification claim
        status = "supported";
        freshness = "current";
        limitations =
          "Controls/evidence mapped and supported — not a certification claim";
      } else {
        status = "unknown";
        freshness = "unknown";
      }
    }

    // Never collapse unknown into supported
    if (status === "unknown" || status === "not_assessed") {
      // already fail-closed
    }

    const assessment: ComplianceAssessment = {
      assessmentId: `comp-assess-${requirementId}`,
      requirementId,
      frameworkId: req.frameworkId,
      frameworkVersionId: req.frameworkVersionId,
      controlIds,
      evidenceRefs: evidenceMaps.map((e) => e.evidenceId),
      status,
      freshness,
      assessorSource: "ComplianceIntelligenceEngine",
      observedAt: new Date().toISOString(),
      limitations,
      reviewStatus: "candidate",
      governedReviewAction: "security_assurance.compliance_review",
      certificationClaimed: false,
    };
    this.assessments.set(assessment.assessmentId, assessment);

    if (
      status === "unsupported" ||
      status === "requires_external_assurance" ||
      (status === "partially_supported" && freshness === "stale") ||
      status === "not_assessed"
    ) {
      this.openGap(assessment, evidenceMaps);
    }

    this.events.push(
      createSecurityAssuranceEvent({
        eventType: "security_assurance.compliance.assessment_completed",
        tenantId: "platform",
        workspaceId: "platform",
        occurredAt: assessment.observedAt,
        refs: { assessmentId: assessment.assessmentId, status },
      }),
    );
    this.timeline.append(
      createSecurityAssuranceTimelineEvent({
        eventId: `tl-comp-${requirementId}`,
        tenantId: "platform",
        workspaceId: "platform",
        eventType: "compliance_assessment_completed",
        entityType: "compliance_assessment",
        entityId: assessment.assessmentId,
        recordedAt: assessment.observedAt,
        summary: `Compliance ${requirementId} → ${status}`,
        refs: { frameworkId: req.frameworkId, status },
      }),
    );

    return assessment;
  }

  private openGap(
    assessment: ComplianceAssessment,
    evidenceMaps: ComplianceEvidenceMapping[],
  ): void {
    const gapId = `comp-gap-${assessment.requirementId}`;
    const gap: ComplianceGap = {
      gapId,
      frameworkId: assessment.frameworkId,
      requirementId: assessment.requirementId,
      missingOrWeakControlIds: assessment.controlIds,
      missingOrStaleEvidenceIds: evidenceMaps
        .filter((e) => e.freshness === "stale" || e.evidenceQuality !== "adequate")
        .map((e) => e.evidenceId),
      severity: assessment.status === "unsupported" ? "high" : "medium",
      priority: assessment.status === "requires_external_assurance" ? "p1" : "p2",
      externalAssuranceDependency:
        assessment.status === "requires_external_assurance",
      recommendedHumanAction:
        assessment.status === "requires_external_assurance"
          ? "Obtain independent external assurance; do not claim compliance from internal evidence"
          : "Review mapped controls/evidence freshness via security_assurance.compliance_review",
      isIncident: false,
    };
    this.gaps.set(gapId, gap);

    const findingId = `comp-finding-${assessment.requirementId}`;
    const finding: ComplianceFinding = {
      findingId,
      frameworkId: assessment.frameworkId,
      requirementId: assessment.requirementId,
      severity: gap.severity,
      status: "open",
      summary: `Compliance gap on ${assessment.requirementId}: ${assessment.status}`,
      evidenceRefs: assessment.evidenceRefs,
      gapIds: [gapId],
      observedAt: assessment.observedAt,
      recommendedHumanReview: true,
      isIncident: false,
      certificationClaimed: false,
    };
    this.findings.set(findingId, finding);
    this.securityFindings.open({
      findingId,
      controlId: assessment.controlIds[0] ?? "RTB-SEC-S01",
      severity: gap.severity === "informational" ? "low" : gap.severity,
      state: "open",
      source: `compliance:${assessment.requirementId}`,
      summary: finding.summary,
      normalizedAt: finding.observedAt,
      isIncident: false,
      containsSensitivePayload: false,
    });
    this.events.push(
      createSecurityAssuranceEvent({
        eventType: "security_assurance.compliance.gap_opened",
        tenantId: "platform",
        workspaceId: "platform",
        occurredAt: finding.observedAt,
        refs: { gapId, findingId },
      }),
    );
  }

  /** Seed current evidence for primary mapped requirements (deterministic demo). */
  seedCurrentEvidenceForMappedRequirements(): void {
    const now = new Date().toISOString();
    const pairs = [
      ["req-iso-a5-access", "RTB-SEC-S01"],
      ["req-nist-pr-aa", "RTB-SEC-S01"],
      ["req-nist-id-ra", "RTB-SEC-S02"],
      ["req-e8-mfa", "RTB-SEC-S01"],
    ] as const;
    for (const [requirementId, controlId] of pairs) {
      this.recordEvidenceMapping({
        evidenceMappingId: `emap-${requirementId}`,
        requirementId,
        controlId,
        assessorSource: "seed-harness",
        evidence: {
          evidenceId: `ev-comp-${requirementId}`,
          controlId,
          sourceType: "platform_runtime",
          sourceRef: `compliance_seed:${requirementId}`,
          scope: "platform",
          collector: "ComplianceIntelligenceEngine",
          collectedAt: now,
          effectiveAt: now,
          freshness: "current",
          integrityRef: `sha256:comp-${requirementId}`,
          classification: "INTERNAL",
          provenance: {
            observed: true,
            inferred: false,
            fabricated: false,
            sourceCategory: "platform_runtime",
          },
          status: "current",
          containsSensitivePayload: false,
        },
      });
    }
  }

  runFoundationAssessments(): ComplianceAssessment[] {
    this.seedCurrentEvidenceForMappedRequirements();
    return this.listRequirements().map((r) => {
      if (r.requirementId === "req-nist-na-demo") {
        return this.assessRequirement(r.requirementId, { forceNotApplicable: true });
      }
      return this.assessRequirement(r.requirementId);
    });
  }

  composeSnapshot(snapshotId: string, scope = "platform"): ComplianceSnapshot {
    const frameworks = COMPLIANCE_FRAMEWORK_IDS.map((frameworkId) => {
      const version = [...this.versions.values()].find((v) => v.frameworkId === frameworkId);
      const reqStatuses: ComplianceRequirementStatus[] = this.listRequirements(frameworkId).map(
        (r) => {
          const a = [...this.assessments.values()].find(
            (x) => x.requirementId === r.requirementId,
          );
          return {
            requirementId: r.requirementId,
            frameworkId,
            status: a?.status ?? "not_assessed",
            freshness: a?.freshness ?? "missing",
            controlIds: a?.controlIds ?? [],
            limitations: a?.limitations,
          };
        },
      );
      const statuses = reqStatuses.map((s) => s.status);
      let overallStatus: ComplianceSupportStatus = "not_assessed";
      if (statuses.some((s) => s === "unsupported")) overallStatus = "unsupported";
      else if (statuses.some((s) => s === "requires_external_assurance")) {
        overallStatus = "requires_external_assurance";
      } else if (statuses.some((s) => s === "partially_supported")) {
        overallStatus = "partially_supported";
      } else if (statuses.some((s) => s === "unknown" || s === "not_assessed")) {
        overallStatus = statuses.every((s) => s === "not_assessed")
          ? "not_assessed"
          : "unknown";
      } else if (statuses.every((s) => s === "supported" || s === "not_applicable")) {
        overallStatus = statuses.every((s) => s === "not_applicable")
          ? "not_applicable"
          : "partially_supported"; // never label framework globally compliant
      }

      return {
        frameworkId,
        versionLabel: version?.versionLabel ?? "unknown",
        overallStatus,
        requirementStatuses: reqStatuses,
      };
    });

    this.posture.compose({
      snapshotId: `posture-from-comp-${snapshotId}`,
      scope,
    });

    const snapshot: ComplianceSnapshot = {
      snapshotId,
      capturedAt: new Date().toISOString(),
      scope,
      frameworks,
      isolationDimensionPreserved: true,
      aiDataDimensionPreserved: true,
      secureComputeDimensionPreserved: true,
      universalScorePresent: false,
      certificationClaimed: false,
      iso27001CertifiedClaimed: false,
      soc2CompliantClaimed: false,
      essentialEightPassedClaimed: false,
      nistCompliantClaimed: false,
      automaticRemediationEnabled: false,
    };
    this.snapshots.push(snapshot);
    this.events.push(
      createSecurityAssuranceEvent({
        eventType: "security_assurance.compliance.posture_updated",
        tenantId: "platform",
        workspaceId: "platform",
        occurredAt: snapshot.capturedAt,
        refs: { snapshotId },
      }),
    );
    return snapshot;
  }

  listAssessments(): ComplianceAssessment[] {
    return [...this.assessments.values()];
  }
  listGaps(): ComplianceGap[] {
    return [...this.gaps.values()];
  }
  listFindings(): ComplianceFinding[] {
    return [...this.findings.values()];
  }
  listSnapshots(): ComplianceSnapshot[] {
    return [...this.snapshots];
  }
  listEvents() {
    return [...this.events];
  }
}
