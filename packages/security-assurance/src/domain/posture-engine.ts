import type {
  AssessmentResult,
  PostureDimension,
  PostureDimensionId,
  PostureDimensionStatus,
  SecurityPostureSnapshot,
} from "../contracts";
import { POSTURE_DIMENSION_IDS } from "../contracts";
import type { SecurityAssessmentEngine } from "./assessment-engine";
import type { SecurityControlRegistry } from "./control-registry";
import type { SecurityEvidenceRegistry } from "./evidence-registry";
import type { SecurityFindingRegistry } from "./finding-registry";

const CATEGORY_TO_DIMENSION: Record<string, PostureDimensionId> = {
  identity: "identity",
  isolation: "isolation",
  data_protection: "data_protection",
  ai_security: "ai_security",
  secure_compute: "secure_compute",
  secure_sdlc: "secure_sdlc",
  incident_readiness: "incident_readiness",
  recovery: "recovery",
  compliance_evidence: "compliance_evidence",
};

function mapAssessmentToPosture(result: AssessmentResult): PostureDimensionStatus {
  switch (result) {
    case "pass":
      return "supported";
    case "partial":
      return "partial";
    case "fail":
      return "at_risk";
    case "not_applicable":
      return "unknown";
    case "unknown":
    default:
      return "insufficient_evidence";
  }
}

export class SecurityPostureCompositionEngine {
  readonly kind = "security_posture_composition_engine" as const;
  private snapshots: SecurityPostureSnapshot[] = [];

  constructor(
    private readonly controls: SecurityControlRegistry,
    private readonly evidence: SecurityEvidenceRegistry,
    private readonly assessments: SecurityAssessmentEngine,
    private readonly findings: SecurityFindingRegistry,
  ) {}

  compose(input: {
    snapshotId: string;
    scope: string;
    capturedAt?: string;
  }): SecurityPostureSnapshot {
    const dimensions: PostureDimension[] = POSTURE_DIMENSION_IDS.map((dimensionId) => {
      const supporting = this.controls
        .list("active")
        .filter((c) => CATEGORY_TO_DIMENSION[c.category] === dimensionId);
      const controlIds = supporting.map((c) => c.controlId);
      const evidenceItems = controlIds.flatMap((id) => this.evidence.listByControl(id));
      const assessmentResults = this.assessments
        .list()
        .filter((a) => controlIds.includes(a.controlId))
        .map((a) => a.result);
      let status: PostureDimensionStatus = "insufficient_evidence";
      if (assessmentResults.length > 0) {
        if (assessmentResults.every((r) => r === "pass")) status = "supported";
        else if (assessmentResults.some((r) => r === "fail")) status = "at_risk";
        else if (assessmentResults.some((r) => r === "partial")) status = "partial";
        else status = mapAssessmentToPosture(assessmentResults[0]!);
      } else if (evidenceItems.length === 0) {
        status = "insufficient_evidence";
      }
      const freshness =
        evidenceItems.length === 0
          ? ("missing" as const)
          : evidenceItems.every((e) => e.freshness === "current")
            ? ("current" as const)
            : evidenceItems.some((e) => e.freshness === "expired")
              ? ("expired" as const)
              : ("stale" as const);
      const findingIds = this.findings
        .list("open")
        .filter((f) => f.controlId && controlIds.includes(f.controlId))
        .map((f) => f.findingId);
      return {
        dimensionId,
        status,
        supportingControlIds: controlIds,
        evidenceCompleteness:
          evidenceItems.length === 0
            ? "missing"
            : evidenceItems.length >= controlIds.length
              ? "complete"
              : "partial",
        freshness,
        findingIds,
        externalCertificationImplied: false,
      };
    });

    const snapshot: SecurityPostureSnapshot = {
      snapshotId: input.snapshotId,
      capturedAt: input.capturedAt ?? new Date().toISOString(),
      scope: input.scope,
      dimensions,
      universalScorePresent: false,
      universalNumericScore: null,
    };
    this.snapshots.push(snapshot);
    return snapshot;
  }

  list(): SecurityPostureSnapshot[] {
    return [...this.snapshots];
  }
}
