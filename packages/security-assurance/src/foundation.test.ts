import { describe, expect, it } from "vitest";
import { ASSESSMENT_REVIEW_ACTION } from "./domain/assessment-engine";
import { createSecurityAssuranceFoundation } from "./domain/foundation";
import { createSecurityAssuranceEvent } from "./domain/events";
import {
  createSecurityAssuranceTimelineEvent,
} from "./domain/timeline";
import { CLOSED_S01_S06, TIER1_EXTERNAL } from "./domain/seed-controls";
import { SEMANTICS, assessFromEvidenceStatuses } from "./domain/semantics";
import {
  SecurityAssuranceFoundationReady,
  automaticExceptionApprovalEnabled,
  automaticRemediationEnabled,
  automaticSecurityApprovalEnabled,
  getSecurityAssuranceFoundationDeclaration,
  phase15CReady,
} from "./foundation-flags";
import {
  PHASE_15A_BASELINE_COMMIT,
  SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION,
  SECURITY_ASSURANCE_VERSION,
} from "./version";
import { POSTURE_DIMENSION_IDS } from "./contracts";

function currentEvidence(partial: {
  evidenceId: string;
  controlId: string;
  status?: "current" | "stale" | "expired" | "missing" | "invalid" | "unknown";
  expiresAt?: string;
}) {
  return {
    evidenceId: partial.evidenceId,
    controlId: partial.controlId,
    sourceType: "ci" as const,
    sourceRef: "ci://workflow/example",
    scope: "platform",
    collector: "phase15b-test",
    collectedAt: "2026-08-01T00:00:00.000Z",
    effectiveAt: "2026-08-01T00:00:00.000Z",
    expiresAt: partial.expiresAt,
    freshness: partial.status ?? ("current" as const),
    integrityRef: "sha256:abc",
    classification: "INTERNAL" as const,
    provenance: {
      observed: true as const,
      inferred: false as const,
      fabricated: false as const,
      sourceCategory: "ci" as const,
    },
    status: partial.status ?? ("current" as const),
    containsSensitivePayload: false as const,
  };
}

describe("Phase 15B Security & Assurance foundation", () => {
  it("declares 0.2.0-control-evidence and Phase 15A baseline", () => {
    expect(SECURITY_ASSURANCE_VERSION).toBe("0.3.0-isolation-assurance");
    expect(SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION).toBe("0.3.0-isolation-assurance");
    expect(PHASE_15A_BASELINE_COMMIT).toBe(
      "4748972076f77e7392bb41ec664adddfeb677407",
    );
    expect(SecurityAssuranceFoundationReady).toBe(true);
    expect(automaticSecurityApprovalEnabled).toBe(false);
    expect(automaticExceptionApprovalEnabled).toBe(false);
    expect(automaticRemediationEnabled).toBe(false);
    expect(phase15CReady).toBe(true);
    const d = getSecurityAssuranceFoundationDeclaration();
    expect(d.implementsOwnAiStack).toBe(false);
    expect(d.SecurityIntelligenceImplemented).toBe(false);
    expect(d.duplicatePolicyEngineDetected).toBe(false);
  });

  it("enforces control lifecycle and implementation refs", () => {
    const f = createSecurityAssuranceFoundation();
    const c = f.controls.require("RTB-SEC-S01");
    expect(c.lifecycle).toBe("active");
    expect(f.controls.isImplemented("RTB-SEC-S01")).toBe(true);
    expect(f.controls.transitionLifecycle("RTB-SEC-S01", "deprecated").lifecycle).toBe(
      "deprecated",
    );
    expect(() => f.controls.transitionLifecycle("RTB-SEC-S01", "draft")).toThrow();
    const impl = f.controls.listImplementations("RTB-SEC-S08")[0]!;
    expect(impl.owner).toBe("Platform Identity");
    expect(impl.authoritative).toBe(true);
  });

  it("enforces evidence provenance, freshness, and fail-closed assessment", () => {
    expect(SEMANTICS.frameworkMappingNeqCertification).toBe(true);
    expect(assessFromEvidenceStatuses([])).toBe("unknown");
    expect(assessFromEvidenceStatuses(["invalid"])).toBe("fail");
    expect(assessFromEvidenceStatuses(["stale"])).toBe("partial");

    const f = createSecurityAssuranceFoundation();
    expect(() =>
      f.evidence.record({
        ...currentEvidence({ evidenceId: "e1", controlId: "RTB-SEC-S02" }),
        provenance: {
          observed: true,
          inferred: true as unknown as false,
          fabricated: false,
          sourceCategory: "ci",
        },
      }),
    ).toThrow(/Fabricated|inferred/i);

    const stale = f.evidence.record(
      currentEvidence({
        evidenceId: "e-stale",
        controlId: "RTB-SEC-S02",
        status: "stale",
      }),
    );
    expect(stale.freshness).toBe("stale");

    const expired = f.evidence.record(
      currentEvidence({
        evidenceId: "e-exp",
        controlId: "RTB-SEC-S02",
        expiresAt: "2020-01-01T00:00:00.000Z",
      }),
    );
    expect(expired.freshness).toBe("expired");

    f.evidence.record(
      currentEvidence({ evidenceId: "e-ok", controlId: "RTB-SEC-S01", status: "current" }),
    );
    f.evidence.record({
      ...currentEvidence({ evidenceId: "e-bad", controlId: "RTB-SEC-S01", status: "invalid" }),
    });
    expect(f.evidence.detectConflict("RTB-SEC-S01")).toBe(true);

    const missing = f.assessments.evaluateCandidate({
      assessmentId: "a-missing",
      controlId: "RTB-SEC-S03",
      scope: "platform",
      evidenceRefs: [],
    });
    expect(missing.result).toBe("unknown");
    expect(missing.reviewStatus).toBe("candidate");
  });

  it("supports governed assessment review and forbids AI self-approval", () => {
    expect(ASSESSMENT_REVIEW_ACTION).toBe("security_assurance.assessment_review");
    const f = createSecurityAssuranceFoundation();
    f.evidence.record(
      currentEvidence({ evidenceId: "e2", controlId: "RTB-SEC-S02" }),
    );
    const candidate = f.assessments.evaluateCandidate({
      assessmentId: "a1",
      controlId: "RTB-SEC-S02",
      scope: "ci",
      evidenceRefs: ["e2"],
    });
    expect(candidate.result).toBe("pass");
    expect(f.assessments.reproduce("a1")).toBe("pass");
    expect(() =>
      f.assessments.applyGovernedReview({
        assessmentId: "a1",
        reviewer: "ai:runtime",
        decision: "approved",
      }),
    ).toThrow(/AI/);
    const approved = f.assessments.applyGovernedReview({
      assessmentId: "a1",
      reviewer: "security.officer",
      decision: "approved",
    });
    expect(approved.reviewStatus).toBe("approved");
    expect(approved.provenance.aiSelfApproval).toBe(false);
  });

  it("manages findings, exceptions, posture without universal score", () => {
    const f = createSecurityAssuranceFoundation();
    f.findings.open({
      findingId: "f1",
      controlId: "RTB-SEC-S02",
      severity: "medium",
      state: "open",
      source: "dependency_scan",
      summary: "Advisory normalized",
      normalizedAt: "2026-08-09T00:00:00.000Z",
      isIncident: false,
      containsSensitivePayload: false,
    });
    expect(f.findings.transition("f1", "remediation_planned").state).toBe(
      "remediation_planned",
    );

    expect(() =>
      f.exceptions.approve({
        exceptionId: "x1",
        controlRef: "RTB-SEC-S02",
        scope: "ci",
        reason: "temporary",
        owner: "devops",
        approvedBy: "ai:bot",
        approvedAt: "2026-08-09T00:00:00.000Z",
        expiresAt: "2027-01-01T00:00:00.000Z",
        reviewStatus: "active",
        aiApproved: false,
        permanentImplicit: false,
      }),
    ).toThrow(/AI/);

    const ex = f.exceptions.approve({
      exceptionId: "x2",
      controlRef: "RTB-SEC-S02",
      scope: "ci",
      reason: "bounded exception",
      owner: "devops",
      approvedBy: "security.officer",
      approvedAt: "2026-08-09T00:00:00.000Z",
      expiresAt: "2027-01-01T00:00:00.000Z",
      reviewStatus: "active",
      aiApproved: false,
      permanentImplicit: false,
    });
    expect(ex.reviewStatus).toBe("active");
    expect(
      f.exceptions.refreshExpiry("x2", "2028-01-01T00:00:00.000Z").reviewStatus,
    ).toBe("expired");

    const snap = f.posture.compose({ snapshotId: "p1", scope: "platform" });
    expect(snap.universalScorePresent).toBe(false);
    expect(snap.universalNumericScore).toBeNull();
    expect(snap.dimensions).toHaveLength(POSTURE_DIMENSION_IDS.length);
    expect(snap.dimensions.every((d) => d.externalCertificationImplied === false)).toBe(
      true,
    );
  });

  it("maps frameworks many-to-many without certification claims", () => {
    const f = createSecurityAssuranceFoundation();
    const frameworks = f.mappings.frameworksForControl("RTB-SEC-S01");
    expect(frameworks).toEqual(
      expect.arrayContaining(["ISO27001", "NIST_CSF_2", "ESSENTIAL_EIGHT"]),
    );
    expect(f.mappings.list().every((m) => m.certified === false)).toBe(true);
    f.mappings.registerExternal({
      assuranceId: "ext-pentest",
      type: "penetration_test",
      status: "not_obtained",
      isExternalOpinion: true,
      generatedBySecurityAssurance: false,
    });
    expect(f.mappings.listExternal()[0]!.isExternalOpinion).toBe(true);
  });

  it("preserves S01–S08 ownership semantics", () => {
    expect(CLOSED_S01_S06).toHaveLength(6);
    expect(TIER1_EXTERNAL.S07.status).toContain("TIER1");
    expect(TIER1_EXTERNAL.S08.ownership).toBe("Platform Identity");
    expect(TIER1_EXTERNAL.S08.securityAssuranceOwns).toBe(false);
  });

  it("reuses platform infrastructure and emits safe events/timeline", () => {
    const f = createSecurityAssuranceFoundation();
    expect(f.reuses.policyEngine).toBe(true);
    expect(f.reuses.platformFiles).toBe(true);
    expect(f.reuses.duplicateEventBus).toBe(false);
    expect(f.reuses.duplicateKnowledgeGraph).toBe(false);

    const evt = createSecurityAssuranceEvent({
      eventType: "security_assurance.evidence_recorded",
      tenantId: "t1",
      workspaceId: "w1",
      occurredAt: "2026-08-09T00:00:00.000Z",
      refs: { evidenceId: "e1" },
    });
    expect(evt.containsSensitivePayload).toBe(false);

    const tl = createSecurityAssuranceTimelineEvent({
      eventId: "tl1",
      tenantId: "t1",
      workspaceId: "w1",
      eventType: "evidence_recorded",
      entityType: "evidence",
      entityId: "e1",
      recordedAt: "2026-08-09T00:00:00.000Z",
      summary: "Evidence recorded",
      refs: { evidenceId: "e1" },
    });
    f.timeline.append(tl);
    expect(f.timeline.list()).toHaveLength(1);
    expect(tl.dedicatedSecurityKg).toBe(false);
  });
});
