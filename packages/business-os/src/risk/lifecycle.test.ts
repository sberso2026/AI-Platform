import { describe, expect, it } from "vitest";
import { assessInherent } from "./assessment";
import { computeResidual } from "./residual";
import { computeRiskPriority } from "./priority";
import { resolveMaxAcceptableLevel, toleranceStatus } from "./tolerance";
import { detectRiskSignals } from "./signals";
import { assertObligationComplianceAllowed } from "./obligations";
import { financialExposure } from "./exposure";

describe("BOS-9 risk lifecycle", () => {
  it("follows Risk → Assessment → Residual → Signal without autonomous acceptance", () => {
    const inherent = assessInherent("likely", "severe");
    expect(inherent.level).toBe("extreme");
    expect(inherent.method).toBe("risk_assessment.v1");

    const beforeControl = computeResidual(inherent.level, [
      { status: "implemented", effectiveness: "untested", evidenceRefs: [] },
    ]);
    expect(beforeControl.residualLevel).toBe("extreme");

    const afterEvidence = computeResidual(inherent.level, [
      {
        status: "operating",
        effectiveness: "effective",
        evidenceRefs: [{ sourceType: "document", sourceRef: "test", title: "Test" }],
      },
    ]);
    expect(afterEvidence.residualLevel).toBe("high");

    const maxAcceptable = resolveMaxAcceptableLevel(
      {
        defaultMaxAcceptableLevel: "high",
        rules: [{ category: "financial", maxAcceptableLevel: "moderate", requiresApproval: true }],
      },
      { category: "financial" },
    );
    expect(toleranceStatus(afterEvidence.residualLevel, maxAcceptable)).toBe("outside");

    const priority = computeRiskPriority({
      residualLevel: afterEvidence.residualLevel,
      outsideTolerance: true,
      ownerLabel: "Owner",
      reviewAt: "2026-08-20T00:00:00.000Z",
      asOf: "2026-08-19T00:00:00.000Z",
      controlEffectiveness: "effective",
      financialExposureKnown: true,
      financialExposureHigh: true,
    });
    expect(priority.version).toBe("risk_priority.v1");
    expect(priority.authoritativeAi).toBe(false);

    const drafts = detectRiskSignals({
      row: {
        risk: {
          id: "r1",
          tenantId: "t",
          workspaceId: "w",
          reference: "RSK-0001",
          title: "Cash",
          description: null,
          category: "financial",
          domain: "finance",
          nature: "threat",
          ownerLabel: "Owner",
          status: "open",
          sourceType: "demo",
          sourceRef: "x",
          identifiedAt: "2026-01-01T00:00:00.000Z",
          reviewAt: "2026-08-20T00:00:00.000Z",
          closedAt: null,
          acceptedAt: null,
          acceptedBy: null,
          linkedDecisionId: null,
          toleranceExceptionAt: null,
          toleranceExceptionBy: null,
          toleranceExceptionRationale: null,
          provenance: {},
          isDemo: true,
          createdAt: "",
          updatedAt: "",
        },
        latestAssessment: null,
        inherentLevel: inherent.level,
        residualLevel: afterEvidence.residualLevel,
        toleranceStatus: "outside",
        toleranceException: false,
        treatmentStrategy: "reduce",
        controlCount: 1,
        evidencedControlCount: 1,
        evidenceFreshness: "fresh",
        priority,
      },
      controls: [],
      obligations: [],
      actions: [],
      asOf: "2026-08-19T00:00:00.000Z",
    });
    expect(drafts.some((d) => d.ruleId === "risk.outside_tolerance.v1")).toBe(true);
    expect(() => assertObligationComplianceAllowed("compliant", [], false)).toThrow("obligation_evidence_required");
    expect(financialExposure([{ amountMinor: "1", currency: "AUD" }, { amountMinor: "2", currency: "USD" }]).known).toBe(
      false,
    );
  });
});
