import type {
  BusinessEvidenceRef,
  BusinessRiskControlEffectiveness,
  BusinessRiskControlStatus,
  BusinessRiskLevel,
} from "@rtb/types";
import { BUSINESS_RISK_RESIDUAL_METHOD } from "@rtb/types";
import { inherentScoreForLevel } from "./assessment";

const LEVEL_ORDER: Exclude<BusinessRiskLevel, "unknown">[] = ["low", "moderate", "high", "extreme"];

export interface ResidualControlInput {
  applicable?: boolean;
  status: BusinessRiskControlStatus | string;
  effectiveness: BusinessRiskControlEffectiveness | string;
  evidenceRefs: BusinessEvidenceRef[] | unknown[];
}

export interface ResidualResult {
  method: typeof BUSINESS_RISK_RESIDUAL_METHOD;
  inherentLevel: BusinessRiskLevel;
  residualLevel: BusinessRiskLevel;
  residualScore: number | null;
  reduced: boolean;
  evidencedControlCount: number;
  rationale: string;
}

export function controlHasEffectivenessEvidence(evidenceRefs: unknown[] | null | undefined): boolean {
  return Array.isArray(evidenceRefs) && evidenceRefs.length > 0;
}

export function assertControlEffectivenessAllowed(
  effectiveness: BusinessRiskControlEffectiveness | string,
  evidenceRefs: unknown[] | null | undefined,
): void {
  if (effectiveness === "effective" && !controlHasEffectivenessEvidence(evidenceRefs)) {
    throw new Error("control_evidence_required");
  }
}

export function controlReducesResidual(control: ResidualControlInput): boolean {
  if (control.applicable === false) return false;
  if (control.status !== "implemented" && control.status !== "operating") return false;
  if (control.effectiveness !== "effective") return false;
  return controlHasEffectivenessEvidence(control.evidenceRefs);
}

function reduceOneBand(level: Exclude<BusinessRiskLevel, "unknown">): Exclude<BusinessRiskLevel, "unknown"> {
  const idx = LEVEL_ORDER.indexOf(level);
  return LEVEL_ORDER[Math.max(0, idx - 1)] ?? "low";
}

export function computeResidual(
  inherentLevel: BusinessRiskLevel,
  controls: ResidualControlInput[],
): ResidualResult {
  const evidenced = controls.filter(controlReducesResidual);
  if (inherentLevel === "unknown") {
    return {
      method: BUSINESS_RISK_RESIDUAL_METHOD,
      inherentLevel,
      residualLevel: "unknown",
      residualScore: null,
      reduced: false,
      evidencedControlCount: evidenced.length,
      rationale:
        "Inherent risk is unknown, so residual risk stays unknown. Evidenced controls cannot invent a residual level.",
    };
  }

  if (evidenced.length === 0) {
    return {
      method: BUSINESS_RISK_RESIDUAL_METHOD,
      inherentLevel,
      residualLevel: inherentLevel,
      residualScore: inherentScoreForLevel(inherentLevel),
      reduced: false,
      evidencedControlCount: 0,
      rationale:
        "Residual equals inherent. A control record, untested control, partially effective control, or ineffective control does not reduce residual risk.",
    };
  }

  const residualLevel = reduceOneBand(inherentLevel);
  return {
    method: BUSINESS_RISK_RESIDUAL_METHOD,
    inherentLevel,
    residualLevel,
    residualScore: inherentScoreForLevel(residualLevel),
    reduced: residualLevel !== inherentLevel,
    evidencedControlCount: evidenced.length,
    rationale: `Residual reduced by at most one band because ${evidenced.length} applicable control(s) are implemented/operating, effective, and evidenced. Existence of a control record alone is insufficient.`,
  };
}
