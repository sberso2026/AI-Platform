import { describe, expect, it } from "vitest";
import {
  FINDINGS_INTELLIGENCE_SHARED_SERVICES,
  FINDINGS_REVIEW_ACTIONS,
  analyzeFindingsPattern,
  applyFindingsReviewAction,
  assertAiFindingHasEvidence,
  assertFindingsIntelligenceSharedServices,
  assertFindingsTransition,
  assertIntakeCannotMutateCore,
  assertNoFindingsPrivateInfrastructure,
  createDocumentFindingsHandoff,
  createFindingsReportingHandoff,
  createMeetingFindingsHandoff,
  evaluateDuplicatePair,
  executeFindingsConversion,
  intakeFromDocumentHandoff,
  intakeFromMeetingHandoff,
  intakeManualFinding,
  proposeFindingsConversion,
  suggestFindingsClassification,
  confirmFindingsClassification,
} from "../src/index";

describe("Phase 8E findings intelligence domain", () => {
  it("binds shared services without private stacks", () => {
    expect(() => assertFindingsIntelligenceSharedServices()).not.toThrow();
    expect(() =>
      assertNoFindingsPrivateInfrastructure({
        implementsPrivateAudit: false,
        implementsPrivateNotification: false,
        implementsPrivateAiRuntime: false,
        implementsPrivateApprovalEngine: false,
      }),
    ).not.toThrow();
    expect(FINDINGS_INTELLIGENCE_SHARED_SERVICES).toContain("audit");
    expect(FINDINGS_INTELLIGENCE_SHARED_SERVICES).toContain("notification");
  });

  it("intakes document and meeting candidates without Core mutation", () => {
    const doc = createDocumentFindingsHandoff({
      id: "df1",
      findingType: "conflicting_requirement",
      title: "Conflict",
      confidence: 0.8,
      evidence: [
        {
          engineeringDocumentId: "doc-1",
          revision: "A",
          excerpt: "shall",
          evidenceScore: 1,
          chunkId: "c1",
        },
      ],
      engineeringDocumentId: "doc-1",
      traceId: "t-doc",
    });
    const docIntake = intakeFromDocumentHandoff(doc, {
      tenantId: "tenant-1",
      workspaceId: "ws-1",
    });
    expect(() => assertIntakeCannotMutateCore(docIntake)).not.toThrow();

    const meet = createMeetingFindingsHandoff({
      id: "mf1",
      meetingSessionId: "m1",
      title: "Site access",
      confidence: 0.7,
      transcriptReferences: ["seg-1"],
      traceId: "t-meet",
    });
    const meetIntake = intakeFromMeetingHandoff(meet, {
      tenantId: "tenant-1",
      workspaceId: "ws-1",
    });
    expect(meetIntake.sourceFeature).toBe("meeting_intelligence");

    const manual = intakeManualFinding({
      sourceId: "man-1",
      tenantId: "tenant-1",
      workspaceId: "ws-1",
      title: "Manual observation",
      actorUserId: "user-1",
      traceId: "t-man",
    });
    expect(manual.sourceFeature).toBe("manual");
    expect(manual.abstentionOrConflictState).toBe("abstained");
  });

  it("enforces lifecycle, evidence, classification, duplicates, review, conversion, patterns, reporting", () => {
    expect(() => assertFindingsTransition("candidate", "accepted", "ai")).toThrow();
    expect(() => assertFindingsTransition("under_review", "accepted", "human")).not.toThrow();
    expect(() => assertAiFindingHasEvidence([], true)).toThrow();
    const suggestion = suggestFindingsClassification({ title: "Safety hazard on site" });
    expect(suggestion.humanConfirmed).toBe(false);
    expect(suggestion.category).toBe("safety_concern");
    const confirmed = confirmFindingsClassification({
      category: "safety_concern",
      severity: "high",
      reviewerUserId: "rev-1",
    });
    expect(confirmed.humanConfirmed).toBe(true);

    const dup = evaluateDuplicatePair({
      left: { id: "a", title: "Valve leak" },
      right: { id: "b", title: "Valve leak" },
    });
    expect(dup?.kind).toBe("exact_duplicate");
    expect(dup?.automaticMergeAllowed).toBe(false);

    for (const action of FINDINGS_REVIEW_ACTIONS) {
      const result = applyFindingsReviewAction({
        action,
        reviewerUserId: "rev-1",
      });
      expect(result.coreMutationApplied).toBe(false);
      expect(result.aiSelfReview).toBe(false);
    }

    const proposal = proposeFindingsConversion({
      findingId: "f1",
      targetType: "risk",
      title: "Valve leak risk",
      proposedBy: "rev-1",
      findingStatus: "accepted",
    });
    const converted = executeFindingsConversion({
      proposal,
      approverUserId: "mgr-1",
      workspaceAuthorized: true,
      roleAuthorized: true,
      newCoreRecordId: "core-1",
    });
    expect(converted.backlink.coreRecordId).toBe("core-1");

    const pattern = analyzeFindingsPattern({
      kind: "recurring_category",
      key: "safety_concern",
      contributingFindingIds: ["1", "2", "3"],
      tenantId: "t1",
      workspaceId: "w1",
    });
    expect(pattern.abstained).toBe(false);
    expect(pattern.mayMutateEngineeringCore).toBe(false);

    const report = createFindingsReportingHandoff({
      tenantId: "t1",
      workspaceId: "w1",
      metrics: {
        findingSummaryCount: 3,
        openFindings: 2,
        overdueReview: 0,
        severityDistribution: { high: 1 },
        categoryDistribution: { safety_concern: 1 },
        convertedFindings: 1,
        recurringPatterns: 1,
        unresolvedConflicts: 0,
        evidenceCoverageRatio: 1,
        reviewPerformance: { completed: 1, pending: 2 },
      },
    });
    expect(report.mayAuthorReports).toBe(false);
    expect(report.targetFeatureKey).toBe("reporting_intelligence");
  });
});
