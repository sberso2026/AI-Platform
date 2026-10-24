/**
 * Phase 10E — Asset Failure Intelligence Engine.
 * Produces advisory failure assessments; never publishes autonomously.
 */

import type { Provenance } from "../architecture/identity-state";
import {
  createEvidenceConfidenceEngine,
  type EvidenceConfidenceAssessment,
  type EvidenceConfidenceEngine,
} from "./evidence-confidence";
import type {
  AssetFailureCauseState,
  AssetFailureConsequenceState,
  AssetFailureEffectState,
  AssetFailureMechanismState,
  AssetFailureModeState,
  FailureAssessmentBundle,
  FailureAssessmentInput,
  FailureRelationship,
} from "./failure";
import {
  createFailureTaxonomyRegistry,
  type FailureTaxonomyRegistry,
} from "./failure-taxonomy";

export type AssetFailureIntelligenceEngineDeps = {
  taxonomy?: FailureTaxonomyRegistry;
  evidenceConfidenceEngine?: EvidenceConfidenceEngine;
  newId?: (prefix: string) => string;
};

export class AssetFailureIntelligenceEngine {
  readonly kind = "asset_failure_intelligence_engine" as const;
  private readonly taxonomy: FailureTaxonomyRegistry;
  private readonly evidence: EvidenceConfidenceEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: AssetFailureIntelligenceEngineDeps = {}) {
    this.taxonomy = deps.taxonomy ?? createFailureTaxonomyRegistry();
    this.evidence = deps.evidenceConfidenceEngine ?? createEvidenceConfidenceEngine();
    this.newId = deps.newId ?? ((p) => `${p}_${crypto.randomUUID()}`);
  }

  assess(input: FailureAssessmentInput): FailureAssessmentBundle {
    const modeTax = this.taxonomy.requireActive("failure_mode", input.failureModeCode);
    const detection = input.detectionMethodCode
      ? this.taxonomy.requireActive("detection_method", input.detectionMethodCode)
      : undefined;

    const evidenceConfidence =
      input.evidenceConfidence ??
      this.evidence.assess({
        assessmentId: this.newId("ec"),
        assetId: input.assetId,
        scope: "failure_intelligence",
        evidenceRefs: input.evidenceRefs ?? [],
        sourceKeys: input.sourceRefs ?? [input.provenance.sourceSystem],
        observedAt: input.provenance.observedAt,
        asOf: input.recordedAt,
        confidenceHint: input.provenance.confidence,
      });

    const abstain = mustAbstain(evidenceConfidence);
    if (abstain) {
      const failureMode = baseMode(input, modeTax.name, modeTax.taxonomyVersion, evidenceConfidence, {
        method: "abstain_insufficient_evidence",
        reviewStatus: "draft",
        limitations: [evidenceConfidence.abstentionReason ?? "insufficient_evidence"],
      });
      return {
        failureMode,
        relationships: [],
        abstained: true,
        abstentionReason: evidenceConfidence.abstentionReason ?? "insufficient_evidence",
      };
    }

    const relationships: FailureRelationship[] = [];
    const failureMode = baseMode(input, modeTax.name, modeTax.taxonomyVersion, evidenceConfidence, {
      method: "governed_failure_intelligence_v1",
      reviewStatus: input.startReview === false ? "draft" : "pending_review",
      detectionMethodCode: detection?.code,
      limitations: [
        "advisory_only",
        "ai_may_not_publish",
        "no_pof_from_mode_presence",
        "no_rul_claim",
      ],
    });

    let mechanism: AssetFailureMechanismState | undefined;
    if (input.mechanismCode) {
      const mechTax = this.taxonomy.requireActive("failure_mechanism", input.mechanismCode);
      mechanism = {
        kind: "failure_mechanism",
        stateId: this.newId("fmech"),
        assetId: input.assetId,
        recordedAt: input.recordedAt,
        provenance: input.provenance,
        silentIdentityMutationForbidden: true,
        mechanismCode: mechTax.code,
        mechanismLabel: mechTax.name,
        mechanismCategory: mechTax.category,
        taxonomyVersion: mechTax.taxonomyVersion,
        relatedFailureModeCodes: [failureMode.failureModeCode],
        confidence: evidenceConfidence.score,
        method: "governed_failure_intelligence_v1",
        evidenceRefs: input.evidenceRefs,
        evidenceConfidenceRef: evidenceConfidence.assessmentId,
        sourceRefs: input.sourceRefs,
        reviewStatus: failureMode.reviewStatus,
        limitations: ["advisory_only"],
        assessedAt: input.recordedAt,
        evidenceConfidence,
        probabilityOfFailureCertified: false,
      };
      relationships.push({
        relationshipId: this.newId("frel"),
        relationshipType: "mode_has_mechanism",
        fromKind: "failure_mode",
        fromCode: failureMode.failureModeCode,
        toKind: "failure_mechanism",
        toCode: mechanism.mechanismCode,
        taxonomyVersion: mechTax.taxonomyVersion,
        version: 1,
      });
    }

    let cause: AssetFailureCauseState | undefined;
    if (input.causeCode) {
      const causeTax = this.taxonomy.requireActive("failure_cause", input.causeCode);
      const classification = input.causeClassification ?? "suspectedCause";
      if (classification === "rootCause") {
        // Candidate only until human review — never auto-certified.
      }
      cause = {
        kind: "failure_cause",
        stateId: this.newId("fcause"),
        assetId: input.assetId,
        recordedAt: input.recordedAt,
        provenance: input.provenance,
        silentIdentityMutationForbidden: true,
        causeCode: causeTax.code,
        causeLabel: causeTax.name,
        classification:
          classification === "rootCause" ? "suspectedCause" : classification,
        taxonomyVersion: causeTax.taxonomyVersion,
        relatedFailureModeCodes: [failureMode.failureModeCode],
        relatedMechanismCodes: mechanism ? [mechanism.mechanismCode] : [],
        confidence: evidenceConfidence.score,
        method: "governed_failure_intelligence_v1",
        evidenceRefs: input.evidenceRefs,
        evidenceConfidenceRef: evidenceConfidence.assessmentId,
        alternativeCauses: input.alternativeCauses ?? [],
        reviewStatus: failureMode.reviewStatus,
        limitations: [
          "not_autonomous_root_cause",
          classification === "rootCause"
            ? "root_cause_requires_human_approval"
            : "cause_advisory",
        ],
        assessedAt: input.recordedAt,
        rootCauseRequiresHumanApproval: true,
        aiAutonomousRootCauseForbidden: true,
        probabilityOfFailureCertified: false,
      };
      relationships.push({
        relationshipId: this.newId("frel"),
        relationshipType: "mode_has_cause",
        fromKind: "failure_mode",
        fromCode: failureMode.failureModeCode,
        toKind: "failure_cause",
        toCode: cause.causeCode,
        taxonomyVersion: causeTax.taxonomyVersion,
        version: 1,
      });
    }

    let effect: AssetFailureEffectState | undefined;
    if (input.effectCode) {
      const effectTax = this.taxonomy.requireActive("failure_effect", input.effectCode);
      effect = {
        kind: "failure_effect",
        stateId: this.newId("feffect"),
        assetId: input.assetId,
        recordedAt: input.recordedAt,
        provenance: input.provenance,
        silentIdentityMutationForbidden: true,
        effectCode: effectTax.code,
        effectLabel: effectTax.name,
        effectKind: input.effectKind ?? "localEffect",
        taxonomyVersion: effectTax.taxonomyVersion,
        relatedFailureModeCodes: [failureMode.failureModeCode],
        reviewStatus: failureMode.reviewStatus,
        limitations: ["advisory_only", "no_project_controls_auto_create"],
        assessedAt: input.recordedAt,
      };
      relationships.push({
        relationshipId: this.newId("frel"),
        relationshipType: "mode_has_effect",
        fromKind: "failure_mode",
        fromCode: failureMode.failureModeCode,
        toKind: "failure_effect",
        toCode: effect.effectCode,
        taxonomyVersion: effectTax.taxonomyVersion,
        version: 1,
      });
    }

    let consequence: AssetFailureConsequenceState | undefined;
    if (input.consequenceCode) {
      const consTax = this.taxonomy.requireActive("consequence", input.consequenceCode);
      consequence = {
        kind: "failure_consequence",
        stateId: this.newId("fcons"),
        assetId: input.assetId,
        recordedAt: input.recordedAt,
        provenance: input.provenance,
        silentIdentityMutationForbidden: true,
        consequenceCode: consTax.code,
        consequenceLabel: consTax.name,
        dimensions: input.consequenceDimensions ?? ["safety"],
        taxonomyVersion: consTax.taxonomyVersion,
        relatedFailureModeCodes: [failureMode.failureModeCode],
        createsCanonicalRiskRecord: false,
        reviewStatus: failureMode.reviewStatus,
        limitations: ["consequence_signal_only", "not_engineering_core_risk"],
        assessedAt: input.recordedAt,
      };
      relationships.push({
        relationshipId: this.newId("frel"),
        relationshipType: "mode_has_consequence",
        fromKind: "failure_mode",
        fromCode: failureMode.failureModeCode,
        toKind: "consequence",
        toCode: consequence.consequenceCode,
        taxonomyVersion: consTax.taxonomyVersion,
        version: 1,
      });
    }

    return {
      failureMode,
      mechanism,
      cause,
      effect,
      consequence,
      relationships,
      abstained: false,
    };
  }

  approveRootCause(
    cause: AssetFailureCauseState,
    input: {
      reviewerId: string;
      recordedAt: string;
      rootCauseMethod: string;
      supportingEvidence: string[];
      confidence: number;
    },
  ): AssetFailureCauseState {
    if (cause.reviewStatus !== "approved" && cause.reviewStatus !== "published") {
      throw new Error("root_cause_requires_approved_review_state");
    }
    return {
      ...cause,
      classification: "rootCause",
      rootCauseConfidence: input.confidence,
      rootCauseMethod: input.rootCauseMethod,
      supportingEvidence: input.supportingEvidence,
      reviewedAt: input.recordedAt,
      publishedAt: cause.publishedAt ?? input.recordedAt,
      provenance: {
        ...cause.provenance,
        reviewedBy: input.reviewerId,
        approvedAt: input.recordedAt,
        method: input.rootCauseMethod,
      },
      limitations: [
        ...cause.limitations.filter((l) => l !== "not_autonomous_root_cause"),
        "human_approved_root_cause",
      ],
    };
  }
}

export function createAssetFailureIntelligenceEngine(
  deps?: AssetFailureIntelligenceEngineDeps,
): AssetFailureIntelligenceEngine {
  return new AssetFailureIntelligenceEngine(deps);
}

function mustAbstain(ec: EvidenceConfidenceAssessment): boolean {
  return (
    ec.dataSufficiency === "insufficient" ||
    ec.dataSufficiency === "conflicting" ||
    ec.dataSufficiency === "stale" ||
    ec.dataSufficiency === "revoked"
  );
}

function baseMode(
  input: FailureAssessmentInput,
  label: string,
  taxonomyVersion: string,
  evidenceConfidence: EvidenceConfidenceAssessment,
  opts: {
    method: string;
    reviewStatus: AssetFailureModeState["reviewStatus"];
    detectionMethodCode?: string;
    limitations: string[];
  },
): AssetFailureModeState {
  return {
    kind: "failure_mode",
    stateId: input.stateIdPrefix ? `${input.stateIdPrefix}_mode` : crypto.randomUUID(),
    assetId: input.assetId,
    recordedAt: input.recordedAt,
    provenance: {
      ...input.provenance,
      method: opts.method,
      confidence: evidenceConfidence.score,
    },
    silentIdentityMutationForbidden: true,
    failureModeCode: input.failureModeCode,
    failureModeLabel: label,
    taxonomyVersion,
    status: opts.reviewStatus,
    confidence: evidenceConfidence.score,
    method: opts.method,
    evidenceConfidenceRef: evidenceConfidence.assessmentId,
    evidenceRefs: input.evidenceRefs,
    sourceRefs: input.sourceRefs,
    detectionMethodCode: opts.detectionMethodCode,
    assessmentType: "qualitative",
    reviewStatus: opts.reviewStatus,
    detectedAt: input.provenance.observedAt,
    assessedAt: input.recordedAt,
    limitations: opts.limitations,
    evidenceConfidence,
    probabilityOfFailureCertified: false,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
    aiMayPublishForbidden: true,
  };
}
