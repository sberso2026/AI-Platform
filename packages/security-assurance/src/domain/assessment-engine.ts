import type { AssessmentResult, SecurityAssessment } from "../contracts";
import type { SecurityEvidenceRegistry } from "./evidence-registry";
import { assessFromEvidenceStatuses } from "./semantics";

export const ASSESSMENT_REVIEW_ACTION =
  "security_assurance.assessment_review" as const;

export class SecurityAssessmentEngine {
  readonly kind = "security_assessment_engine" as const;
  private assessments = new Map<string, SecurityAssessment>();

  constructor(private readonly evidence: SecurityEvidenceRegistry) {}

  /**
   * Automated candidate only — never auto-approved.
   * AI self-approval forbidden.
   */
  evaluateCandidate(input: {
    assessmentId: string;
    controlId: string;
    scope: string;
    evidenceRefs: string[];
    assessedAt?: string;
    limitations?: string;
  }): SecurityAssessment {
    const statuses = input.evidenceRefs.map((id) => {
      const e = this.evidence.get(id);
      return e?.freshness ?? ("missing" as const);
    });
    if (this.evidence.detectConflict(input.controlId)) {
      statuses.push("conflicting");
    }
    const result = assessFromEvidenceStatuses(statuses);
    const assessment: SecurityAssessment = {
      assessmentId: input.assessmentId,
      controlId: input.controlId,
      scope: input.scope,
      result,
      evidenceRefs: input.evidenceRefs,
      assessmentMethod: "automated_candidate",
      assessedAt: input.assessedAt ?? new Date().toISOString(),
      limitations: input.limitations,
      reviewStatus: "candidate",
      provenance: {
        reproducibleFromEvidence: true,
        aiSelfApproval: false,
        governedReviewRequired: true,
      },
    };
    this.assessments.set(assessment.assessmentId, assessment);
    return assessment;
  }

  /**
   * Governed human review: security_assurance.assessment_review
   * Does NOT allow AI self-approval.
   */
  applyGovernedReview(input: {
    assessmentId: string;
    reviewer: string;
    decision: "approved" | "rejected";
    resultOverride?: AssessmentResult;
    reviewedAt?: string;
  }): SecurityAssessment {
    const current = this.require(input.assessmentId);
    if (input.reviewer.startsWith("ai:") || input.reviewer === "ai_runtime") {
      throw new Error("AI self-approval of assessments is forbidden");
    }
    const next: SecurityAssessment = {
      ...current,
      result: input.resultOverride ?? current.result,
      reviewStatus: input.decision,
      reviewedBy: input.reviewer,
      reviewedAt: input.reviewedAt ?? new Date().toISOString(),
      assessmentMethod: "human_governed",
      provenance: {
        ...current.provenance,
        aiSelfApproval: false,
        governedReviewRequired: false,
      },
    };
    this.assessments.set(next.assessmentId, next);
    return next;
  }

  /** Reproducible from referenced evidence when automated. */
  reproduce(assessmentId: string): AssessmentResult {
    const a = this.require(assessmentId);
    const statuses = a.evidenceRefs.map((id) => {
      const e = this.evidence.get(id);
      return e?.freshness ?? ("missing" as const);
    });
    return assessFromEvidenceStatuses(statuses);
  }

  require(assessmentId: string): SecurityAssessment {
    const a = this.assessments.get(assessmentId);
    if (!a) throw new Error(`Unknown assessment: ${assessmentId}`);
    return a;
  }

  list(): SecurityAssessment[] {
    return [...this.assessments.values()];
  }
}
