import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  COMMAND_CENTRE_CARD_IDS,
  COMMAND_CENTRE_HEALTH_SCORE_ENABLED,
  COMMAND_CENTRE_REMAINING_LIFE_ENABLED,
  COMMAND_CENTRE_RISK_PROBABILITY_ENABLED,
  COMMAND_CENTRE_STORES_CANONICAL_COPY,
  COMMAND_CENTRE_USES_AI_METRICS,
  DUPLICATE_COMMAND_CENTRE_MODEL_DETECTED,
  II_6_IMPLEMENTED,
  II_COMMAND_CENTRE_IMPLEMENTED,
  INSPECTION_INTELLIGENCE_II_6_IMPLEMENTED,
  SCHEMA_CHANGED,
  composeInspectionCommandCentre,
  createHostedInspectionRepository,
  memoryActor,
  MemoryInspectionDb,
  type HostedInspectionContext,
} from "../src";

const tenantA = randomUUID();
const tenantB = randomUUID();
const workspaceA = randomUUID();
const projectA = randomUUID();
const actorA = randomUUID();

function ctx(projectId?: string, tenantId = tenantA, workspaceId = workspaceA): HostedInspectionContext {
  return { tenantId, workspaceId, actorUserId: actorA, projectId };
}

describe("II-6 Inspection Command Centre composition", () => {
  it("composes recorded cards with provenance and without health, risk, or AI metrics", () => {
    expect(INSPECTION_INTELLIGENCE_II_6_IMPLEMENTED).toBe(true);
    expect(II_6_IMPLEMENTED).toBe(true);
    expect(II_COMMAND_CENTRE_IMPLEMENTED).toBe(true);
    expect(DUPLICATE_COMMAND_CENTRE_MODEL_DETECTED).toBe(false);
    expect(COMMAND_CENTRE_STORES_CANONICAL_COPY).toBe(false);
    expect(COMMAND_CENTRE_USES_AI_METRICS).toBe(false);
    expect(COMMAND_CENTRE_HEALTH_SCORE_ENABLED).toBe(false);
    expect(COMMAND_CENTRE_RISK_PROBABILITY_ENABLED).toBe(false);
    expect(COMMAND_CENTRE_REMAINING_LIFE_ENABLED).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);

    const view = composeInspectionCommandCentre({
      plans: [{ id: "plan-1", title: "Weekly", status: "planned", targets: [] }],
      sessions: [
        { id: "sess-1", title: "Walkdown", status: "started", targets: [{ kind: "project", canonicalId: "p1", snapshot: { label: "Alpha" } }], updated_at: "2026-01-02" },
        { id: "sess-2", title: "Done", status: "completed", targets: [], updated_at: "2026-01-01" },
      ],
      evidence: [],
      defects: [{ id: "def-1", session_id: "sess-1", status: "open", title: "Corrosion", taxonomy: { severity: "medium" } }],
      correctiveActions: [{ id: "ca-1", session_id: "sess-1", status: "open", title: "Recoat" }],
      verifications: [{ id: "ver-1", session_id: "sess-1", status: "pending", kind: "defect", subject_id: "def-1" }],
      conditionRatings: [],
      reports: [{ id: "rep-1", report_key: "inspection_closeout", entity_id: "sess-2", generated_at: "2026-01-02" }],
    });

    expect(view.healthScore).toBeNull();
    expect(view.riskProbability).toBeNull();
    expect(view.remainingLife).toBeNull();
    expect(view.aiMetricsIncluded).toBe(false);
    expect(view.storesCanonicalCopy).toBe(false);
    expect(view.cards.map((card) => card.id).sort()).toEqual([...COMMAND_CENTRE_CARD_IDS].sort());
    const open = view.cards.find((card) => card.id === "open_defects");
    expect(open?.value).toBe("1");
    expect(open?.provenance.table).toBe("inspection_defects");
    expect(open?.provenance.aiDerived).toBe(false);
    expect(open?.href).toBe("/engineering/apps/inspection-intelligence/defects");
    expect(open?.items[0]?.href).toContain("/defects/def-1");
    const planned = view.cards.find((card) => card.id === "inspections_planned");
    expect(planned?.items[0]?.href).toContain("/plans/plan-1");
    const evidence = view.cards.find((card) => card.id === "evidence_completeness");
    expect(evidence?.value).toBe("1 / 1");
    const targets = view.cards.find((card) => card.id === "targets_requiring_attention");
    expect(targets?.items[0]?.href).toContain("/history/targets/project/p1");
    expect(view.attentionItems.some((item) => item.reasonCode === "open_inspection_defect")).toBe(true);
    expect(JSON.stringify(view.cards)).not.toMatch(/failureProbability/i);
    expect(JSON.stringify(view.attentionItems)).not.toMatch(/priority score|risk probability/i);
  });

  it("scopes hosted Command Centre to tenant/workspace/project and reuses existing inspection rows", async () => {
    const db = new MemoryInspectionDb();
    db.seed("engineering_projects", [
      { id: projectA, tenant_id: tenantA, workspace_id: workspaceA, project_code: "P-A" },
    ]);
    const repo = createHostedInspectionRepository(ctx(projectA), db.clientFor(memoryActor(ctx(projectA))));
    const created = await repo.createPlan({
      title: "CC plan",
      targets: [
        {
          id: randomUUID(),
          kind: "project",
          canonicalId: projectA,
          snapshot: { capturedAt: new Date().toISOString(), label: "Alpha" },
        },
      ],
    });
    const session = await repo.startSession({ planId: String(created.plan.id) });
    await repo.recordObservation({
      sessionId: String(session.id),
      checklistItemType: "visual",
      body: "flange",
    });
    const view = await repo.getCommandCentre({ canWrite: true });
    expect(view.cards.find((card) => card.id === "inspections_in_progress")?.value).toBe("1");
    expect(view.profile?.readCount).toBe(8);
    const foreignWs = randomUUID();
    const foreignCtx = ctx(undefined, tenantB, foreignWs);
    const foreign = createHostedInspectionRepository(
      foreignCtx,
      db.clientFor(memoryActor(foreignCtx)),
    );
    const empty = await foreign.getCommandCentre();
    expect(empty.cards.every((card) => card.value === "0" || card.value === "0 / 0")).toBe(true);
  });
});
