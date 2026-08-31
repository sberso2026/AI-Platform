import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  AUTONOMOUS_CONDITION_CERTIFICATION_ENABLED,
  AUTONOMOUS_INSPECTION_APPROVAL_ENABLED,
  AUTONOMOUS_REMEDIATION_APPROVAL_ENABLED,
  DATABASE_POLICY_CHANGED,
  DIRECT_PROVIDER_ACCESS_FROM_II,
  DUPLICATE_ASSET_TRUTH_MODEL_DETECTED,
  DUPLICATE_ENGINEERING_TRUTH_MODEL_DETECTED,
  DUPLICATE_HISTORY_MODEL_DETECTED,
  DUPLICATE_REPORTING_TRUTH_MODEL_DETECTED,
  EXTERNAL_WRITES_ENABLED,
  II_4_IMPLEMENTED,
  II_5_READY,
  II_AI_INSPECTION_ENGINEER_IMPLEMENTED,
  II_COMMAND_CENTRE_IMPLEMENTED,
  II_GOVERNED_REPORT_TYPES,
  II_HISTORY_INDICATORS,
  II_PDF_EXPORT_AVAILABLE,
  INSPECTION_INTELLIGENCE_II_4_IMPLEMENTED,
  MemoryInspectionDb,
  SCHEMA_CHANGED,
  assertReportAuthorityTransition,
  composeGovernedReport,
  computeChangeOverTime,
  computeHistoryIntelligence,
  createHostedInspectionRepository,
  memoryActor,
  nextReportAuthorityStates,
  projectInspectionHistory,
  renderReportMarkdown,
  type HostedInspectionContext,
} from "../src";

const tenantA = randomUUID();
const workspaceA = randomUUID();
const projectA = randomUUID();
const actorA = randomUUID();

function ctx(projectId?: string): HostedInspectionContext {
  return { tenantId: tenantA, workspaceId: workspaceA, actorUserId: actorA, projectId };
}

describe("II-4 inspection history and governed reporting", () => {
  it("locks II-4 flags without schema, AI, PDF, or duplicate truth models", () => {
    expect(INSPECTION_INTELLIGENCE_II_4_IMPLEMENTED).toBe(true);
    expect(II_4_IMPLEMENTED).toBe(true);
    expect(II_5_READY).toBe(true);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(DATABASE_POLICY_CHANGED).toBe(false);
    expect(II_PDF_EXPORT_AVAILABLE).toBe(false);
    expect(II_COMMAND_CENTRE_IMPLEMENTED).toBe(true);
    expect(II_AI_INSPECTION_ENGINEER_IMPLEMENTED).toBe(true);
    expect(AUTONOMOUS_INSPECTION_APPROVAL_ENABLED).toBe(false);
    expect(AUTONOMOUS_CONDITION_CERTIFICATION_ENABLED).toBe(false);
    expect(AUTONOMOUS_REMEDIATION_APPROVAL_ENABLED).toBe(false);
    expect(DUPLICATE_HISTORY_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_REPORTING_TRUTH_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_ASSET_TRUTH_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_ENGINEERING_TRUTH_MODEL_DETECTED).toBe(false);
    expect(DIRECT_PROVIDER_ACCESS_FROM_II).toBe(false);
    expect(EXTERNAL_WRITES_ENABLED).toBe(false);
    expect(II_GOVERNED_REPORT_TYPES.map((row) => row.title)).toEqual([
      "Inspection Summary",
      "Inspection Report",
      "Defect / Corrective Action Summary",
      "Condition Assessment Summary",
    ]);
    expect(II_HISTORY_INDICATORS.every((row) => row.inputs.length && row.rule && row.unknownBehavior && row.provenance)).toBe(
      true,
    );
  });

  it("projects history from sessions without inventing inspector, continuity, or a second store", () => {
    const history = projectInspectionHistory({
      sessions: [
        {
          id: "s2",
          status: "started",
          started_at: "2026-08-02T00:00:00.000Z",
          targets: [{ kind: "asset", canonicalId: "asset-1" }],
        },
        {
          id: "s1",
          status: "closed",
          started_at: "2026-08-01T00:00:00.000Z",
          completed_at: "2026-08-01T02:00:00.000Z",
          targets: [{ kind: "project", canonicalId: projectA }],
        },
      ],
      filter: { targetKind: "project", targetCanonicalId: projectA },
    });
    expect(history.projection).toBe("inspection_history_over_canonical_sessions");
    expect(history.not).toContain("asset_intelligence_history");
    expect(history.rows).toHaveLength(1);
    expect(history.rows[0].sessionId).toBe("s1");
    expect(history.rows[0].actorUnknown).toBe(true);
  });

  it("computes like-for-like measurement deltas and keeps UNKNOWN unrated/incomparable", () => {
    const change = computeChangeOverTime({
      sessions: [
        { id: "s1", started_at: "2026-08-01T00:00:00.000Z", targets: [{ kind: "asset", canonicalId: "a1" }] },
        { id: "s2", started_at: "2026-08-10T00:00:00.000Z", targets: [{ kind: "asset", canonicalId: "a1" }] },
      ],
      defects: [
        { id: "d1", session_id: "s1", status: "open", title: "corrosion", taxonomy: { defectCategory: "corrosion" } },
        { id: "d2", session_id: "s2", status: "open", title: "corrosion", taxonomy: { defectCategory: "corrosion" } },
      ],
      measurements: [
        { id: "m1", session_id: "s1", measurement_type: "thickness", unit: "mm", observed_value: 10, recorded_at: "2026-08-01T00:00:00.000Z" },
        { id: "m2", session_id: "s2", measurement_type: "thickness", unit: "mm", observed_value: 8, recorded_at: "2026-08-10T00:00:00.000Z" },
        { id: "m3", session_id: "s2", measurement_type: "thickness", unit: "in", observed_value: 0.3, recorded_at: "2026-08-10T00:00:00.000Z" },
      ],
      conditionRatings: [],
      correctiveActions: [{ id: "ca1", session_id: "s1" }],
      evidence: [],
      verifications: [],
    });
    expect(change.measurementDeltas).toHaveLength(1);
    expect(change.measurementDeltas[0].delta).toBe(-2);
    expect(change.measurementDeltas[0].note).toContain("Not a deterioration rate");
    expect(change.repeatDefects[0].count).toBe(2);
    expect(change.conditionRatingHistory).toEqual({});
    expect(change.correctiveActionCurrentStates[0].status).toBe("unknown");
  });

  it("documents history intelligence UNKNOWN behavior without probability or remaining life", () => {
    const intel = computeHistoryIntelligence({
      sessions: [
        { id: "s1", status: "closed", completed_at: "2026-08-01T00:00:00.000Z" },
        { id: "s2", status: "closed" },
        { id: "s3", status: "started" },
      ],
      defects: [{ id: "d1", status: "open", created_at: "2026-08-01T00:00:00.000Z" }, { id: "d2" }],
      correctiveActions: [{ id: "ca1", status: "assigned" }],
      verifications: [{ id: "v1", session_id: "s3", status: "pending" }],
      evidence: [],
      conditionRatings: [],
    });
    expect(intel.inspectionsCompletedOverPeriod.value).toBe(1);
    expect(intel.inspectionsCompletedOverPeriod.periodUnknown).toBe(1);
    expect(intel.inspectionsAwaitingVerification.pendingVerifications).toBe(1);
    expect(intel.openDefectsOverTime.unknownStatus).toBe(1);
    expect(intel.outstandingCorrectiveActions.value).toBe(1);
    expect(intel.evidenceCompleteness.withoutRegisteredEvidence).toBe(3);
    expect(JSON.stringify(intel)).not.toMatch(/remaining.?life|probability|confidenceScore|health score/i);
  });

  it("composes a deterministic draft snapshot with provenance and markdown, never PDF or AI", () => {
    const snapshot = composeGovernedReport({
      reportKey: "inspection.session_summary",
      actorUserId: actorA,
      generatedAt: "2026-08-31T00:00:00.000Z",
      workspace: {
        session: { id: "s1", status: "started", plan_id: "p1", targets: [{ kind: "project", canonicalId: projectA }] },
        plan: { id: "p1", title: "Plan", template_id: "t1" },
        template: { id: "t1", pack_id: "generic" },
        observations: [{ id: "o1" }],
        measurements: [{ id: "m1", evaluation_status: "unknown" }],
        evidence: [],
        defects: [],
        recommendations: [],
        correctiveActions: [],
        assessments: [],
        conditionRatings: [],
        verifications: [],
      },
    });
    expect(snapshot.authority.state).toBe("draft");
    expect(snapshot.aiNarrative).toBe(false);
    expect(snapshot.pdfAvailable).toBe(false);
    const sections = snapshot.sections as { provenance: { session: { sessionId: string } }; limitations: string[] };
    expect(sections.provenance.session.sessionId).toBe("s1");
    expect(sections.limitations.some((row) => row.includes("Unrated"))).toBe(true);
    expect(nextReportAuthorityStates("draft")).toEqual(["reviewed"]);
    expect(() => assertReportAuthorityTransition("draft", "published")).toThrow(/invalid_report_authority_transition/);
    const markdown = renderReportMarkdown(snapshot);
    expect(markdown).toContain("PDF export: unavailable");
    expect(markdown).toContain("AI narrative: none");
  });

  it("persists history projection and report snapshots on existing inspection_reporting_outputs", async () => {
    const db = new MemoryInspectionDb();
    db.seed("engineering_projects", [{ id: projectA, tenant_id: tenantA, workspace_id: workspaceA }]);
    const repo = createHostedInspectionRepository(ctx(projectA), db.clientFor(memoryActor(ctx(projectA))));
    const created = await repo.createPlan({
      title: "II-4",
      targets: [
        {
          id: randomUUID(),
          kind: "project",
          canonicalId: projectA,
          snapshot: { capturedAt: new Date().toISOString(), label: "A" },
        },
      ],
    });
    const session = await repo.startSession({ planId: String(created.plan.id) });
    await repo.recordObservation({
      sessionId: String(session.id),
      checklistItemType: "visual",
      body: "flange",
    });
    const history = await repo.listHistory({ targetKind: "project", targetCanonicalId: projectA });
    expect(history.rows.some((row) => row.sessionId === String(session.id))).toBe(true);
    const target = await repo.getTargetHistory({ kind: "project", canonicalId: projectA });
    expect(target.timeline.some((event) => event.kind === "session")).toBe(true);
    expect(target.missingContinuity).toBe(false);
    const missing = await repo.getTargetHistory({ kind: "asset", canonicalId: randomUUID() });
    expect(missing.missingContinuity).toBe(true);
    const composed = await repo.composeReport({
      sessionId: String(session.id),
      reportKey: "inspection.session_summary",
    });
    expect(composed.report_key).toBe("inspection.session_summary");
    expect((composed.payload as { authority: { state: string }; aiNarrative: boolean }).authority.state).toBe("draft");
    expect((composed.payload as { aiNarrative: boolean }).aiNarrative).toBe(false);
    expect(composed.pdfAvailable).toBe(false);
    const reloaded = await repo.getReport(String(composed.id));
    expect(reloaded.id).toBe(composed.id);
    const exported = repo.exportReportMarkdown(reloaded);
    expect(exported.markdown).toContain("Inspection Summary");
    expect(exported.pdfAvailable).toBe(false);
    const reviewed = await repo.transitionReport(String(composed.id), "reviewed");
    expect((reviewed.payload as { authority: { state: string } }).authority.state).toBe("reviewed");
    await expect(repo.transitionReport(String(composed.id), "published")).rejects.toThrow(
      /invalid_report_authority_transition/,
    );
    expect(db.rows("inspection_reporting_outputs").some((row) => String(row.id) === String(composed.id))).toBe(true);
  });
});
