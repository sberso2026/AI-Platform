import { describe, expect, it } from "vitest";
import { applyHumanDisposition } from "./disposition";
import { explainFinding, explainabilityContainsModelChainOfThought } from "./explainability";
import {
  closedFindingProvesEngineeringCorrectness,
  distinguishFindingStates,
  packageEpistemicStateFromReview,
} from "./epistemic-state";
import { assertsNoFabricatedCoveragePercent, unmeasuredReviewCoverage } from "./coverage";
import { evidenceResolvesToSource, verifyFindingAgainstSources } from "./evidence-resolve";
import { createReviewFinding } from "./finding";
import { createReviewOwnership } from "./ownership";
import { asUntrustedDocumentText } from "./trust-boundary";
import {
  classifySourceAuthority,
  supersededIsEquivalentToCurrentAuthority,
} from "./source-authority";
import { FORBIDDEN_ZERO_FINDING_ASSURANCE, ZERO_FINDING_MESSAGE } from "./version";

const OWNER = createReviewOwnership({
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
});

const evidence = {
  evidenceId: "ev-1",
  documentId: "doc-1",
  tenantId: OWNER.tenantId,
  workspaceId: OWNER.workspaceId,
  projectId: OWNER.projectId,
  revision: "C",
  span: "design_pressure=150 kPa",
  sourceType: "structured_field" as const,
};

function finding() {
  return createReviewFinding({
    id: "f-1",
    ...OWNER,
    reviewPackageId: "pkg-1",
    reviewRunId: "run-1",
    category: "cross_document_inconsistency",
    title: "Pressure conflict",
    description: "150 vs 200 kPa",
    severity: "major",
    confidence: { score: 0.91 },
    evidence: [evidence],
    reasoningSummary: "Field mismatch on the specification versus drawing.",
    recommendedAction: "Reconcile",
    provenance: { origin: "detector", ruleId: "er.cross_document_inconsistency", ruleVersion: "1.0.0" },
    now: "2026-01-01T00:00:00.000Z",
  });
}

describe("ERA-PILOT-0 epistemic, silence, WHY, and source authority", () => {
  it("does not treat zero findings as assurance language", () => {
    expect(ZERO_FINDING_MESSAGE).toContain("Configured review completed.");
    expect(ZERO_FINDING_MESSAGE).toContain("No findings were identified within the selected review scope.");
    const lower = ZERO_FINDING_MESSAGE.toLowerCase();
    for (const phrase of FORBIDDEN_ZERO_FINDING_ASSURANCE) {
      expect(lower).not.toContain(phrase.toLowerCase());
    }
    expect(packageEpistemicStateFromReview({ runStatus: "completed", findingCount: 0 })).toBe("NOT_ASSESSED");
  });

  it("keeps workflow CLOSED distinct from technically proven", () => {
    const closed = applyHumanDisposition({
      finding: applyHumanDisposition({
        finding: { ...finding(), status: "awaiting_engineer" },
        action: "accept",
        actorId: "engineer-1",
      }).finding,
      action: "close",
      actorId: "engineer-1",
    }).finding;
    expect(closed.status).toBe("closed");
    expect(closedFindingProvesEngineeringCorrectness()).toBe(false);
    expect(distinguishFindingStates(closed).closedImpliesTechnicallyProven).toBe(false);
    expect(distinguishFindingStates(closed).workflow).toBe("CLOSED");
    expect(distinguishFindingStates(closed).epistemic).toBe("SUPPORTED");
  });

  it("exposes WHY as evidence provenance without chain-of-thought", () => {
    const view = explainFinding(finding(), {
      exclusions: ["doc-unsupported"],
      coverage: unmeasuredReviewCoverage({ reviewTypes: ["cross_document_inconsistency"] }),
    });
    expect(view.why).toBe("Field mismatch on the specification versus drawing.");
    expect(view.sources[0]?.documentId).toBe("doc-1");
    expect(view.sources[0]?.revision).toBe("C");
    expect(view.coverage.measured).toBe(false);
    expect(explainabilityContainsModelChainOfThought(view)).toBe(false);
    expect(assertsNoFabricatedCoveragePercent(view.coverage)).toBe(true);
  });

  it("does not treat superseded inclusion as current authority", () => {
    expect(classifySourceAuthority({ inclusion: "superseded", revision: "A" })).toBe("superseded");
    expect(supersededIsEquivalentToCurrentAuthority()).toBe(false);
    const docs = [
      {
        ...OWNER,
        documentId: "doc-1",
        revision: "A",
        role: "specification" as const,
        inclusion: "superseded" as const,
        fields: { design_pressure: "150 kPa" },
        extractedText: asUntrustedDocumentText("design_pressure=150 kPa"),
      },
    ];
    expect(evidenceResolvesToSource(evidence, docs)).toBe(false);
    const verified = verifyFindingAgainstSources(finding(), docs);
    expect(verified.verificationState).toBe("insufficient_evidence");
  });
});
